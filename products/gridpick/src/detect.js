// Gridpick — structure detection.
//
// Two jobs:
//   1. Pull real <table> elements into rows, honouring colspan/rowspan.
//   2. Find repeated structures that are lists in everything but name — product
//      grids, search results, directory rows — and infer their columns.
//
// (2) is the part people pay for. Everything on the web that matters is a list
// of things rendered from a loop, and the loop leaves a fingerprint: N siblings
// with the same shape. Find the fingerprint, and the columns fall out of the
// difference between siblings.
//
// Runs in the page as a content script, and standalone in a test harness.

(function (global) {
  "use strict";

  const MIN_ROWS = 3;
  const SKIP = new Set([
    "SCRIPT", "STYLE", "NOSCRIPT", "SVG", "CANVAS", "IFRAME", "BR", "HR",
    "INPUT", "BUTTON", "SELECT", "TEXTAREA", "OPTION", "TEMPLATE", "LINK", "META",
  ]);
  // Class fragments that mark state rather than structure — two cards are the
  // same shape even if one of them is .active.
  const STATE_CLASS = /^(is-|has-|js-|ng-|active|selected|current|hover|focus|open|first|last|odd|even|alt|highlight|sticky|visible|hidden)/i;

  const clean = (s) => (s || "").replace(/\s+/g, " ").trim();

  function isVisible(el) {
    if (!el || typeof el.getBoundingClientRect !== "function") return true;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return false;
    if (typeof global.getComputedStyle === "function") {
      const st = global.getComputedStyle(el);
      if (st && (st.display === "none" || st.visibility === "hidden")) return false;
    }
    return true;
  }

  function classPart(el) {
    const raw = el.getAttribute && el.getAttribute("class");
    if (!raw) return "";
    const parts = String(raw)
      .trim()
      .split(/\s+/)
      .filter((c) => c && !STATE_CLASS.test(c))
      // Hashed CSS-module / styled-components names differ per element; drop them.
      .filter((c) => !/^[a-z]*[-_][a-zA-Z0-9]{5,}$/.test(c) || /[-_](item|card|row|cell|title|price|link|name)/i.test(c))
      .sort()
      .slice(0, 3);
    return parts.length ? "." + parts.join(".") : "";
  }

  // A shape fingerprint: tag + meaningful classes, plus the shape of the first
  // few children, `depth` levels down.
  function sig(el, depth) {
    if (!el || el.nodeType !== 1) return "";
    let s = el.tagName + classPart(el);
    if (depth > 0) {
      const kids = Array.from(el.children)
        .filter((c) => !SKIP.has(c.tagName))
        .slice(0, 6)
        .map((c) => sig(c, depth - 1));
      if (kids.length) s += "(" + kids.join(",") + ")";
    }
    return s;
  }

  // ---------- real tables ----------

  function extractTable(table) {
    // Build a grid so colspan/rowspan land in the right cells instead of
    // shunting every later column one to the left.
    const grid = [];
    const rows = Array.from(table.rows || []);
    rows.forEach((tr, y) => {
      if (!grid[y]) grid[y] = [];
      let x = 0;
      for (const cell of Array.from(tr.cells || [])) {
        while (grid[y][x] !== undefined) x++;
        const text = clean(cell.textContent);
        const colspan = Math.min(parseInt(cell.getAttribute("colspan") || "1", 10) || 1, 50);
        const rowspan = Math.min(parseInt(cell.getAttribute("rowspan") || "1", 10) || 1, 50);
        for (let dy = 0; dy < rowspan; dy++) {
          for (let dx = 0; dx < colspan; dx++) {
            if (!grid[y + dy]) grid[y + dy] = [];
            grid[y + dy][x + dx] = text;
          }
        }
        x += colspan;
      }
    });

    const width = grid.reduce((m, r) => Math.max(m, r.length), 0);
    if (!width) return null;
    const matrix = grid.map((r) => {
      const out = [];
      for (let i = 0; i < width; i++) out.push(r[i] === undefined ? "" : r[i]);
      return out;
    });

    // Header row: a <thead>, or a first row that is all <th>.
    let headers = null;
    let body = matrix;
    const firstTr = rows[0];
    const firstAllTh =
      firstTr && Array.from(firstTr.cells || []).length > 0 &&
      Array.from(firstTr.cells).every((c) => c.tagName === "TH");
    if ((table.tHead && table.tHead.rows.length) || firstAllTh) {
      headers = matrix[0];
      body = matrix.slice(1);
    }
    if (!headers) headers = matrix[0].map((_, i) => `column_${i + 1}`);

    body = body.filter((r) => r.some((c) => c !== ""));
    if (!body.length) return null;

    return {
      kind: "table",
      element: table,
      columns: dedupeNames(headers.map((h, i) => clean(h) || `column_${i + 1}`)),
      rows: body,
      count: body.length,
      score: body.length * width * 2, // real tables are unambiguous — favour them
    };
  }

  function findTables(root) {
    return Array.from(root.querySelectorAll("table"))
      .filter((t) => isVisible(t) && (t.rows || []).length >= 2)
      // Layout tables: no th, no thead, one column.
      .map(extractTable)
      .filter(Boolean)
      .filter((t) => t.rows[0].length > 1 || t.rows.length >= MIN_ROWS);
  }

  // ---------- repeated structures ----------

  function findRepeats(root) {
    const candidates = [];
    const all = root.querySelectorAll("*");

    for (const parent of all) {
      if (SKIP.has(parent.tagName) || parent.tagName === "TABLE") continue;
      const kids = Array.from(parent.children).filter(
        (c) => !SKIP.has(c.tagName) && isVisible(c)
      );
      if (kids.length < MIN_ROWS) continue;

      const groups = new Map();
      for (const k of kids) {
        const s = sig(k, 2);
        if (!groups.has(s)) groups.set(s, []);
        groups.get(s).push(k);
      }

      for (const [signature, members] of groups) {
        if (members.length < MIN_ROWS) continue;
        const totalText = members.reduce((a, m) => a + clean(m.textContent).length, 0);
        const avgText = totalText / members.length;
        if (avgText < 12) continue; // icon rows, pagination, nav dots
        candidates.push({
          parent,
          members,
          signature,
          // Many items with substance beat a handful of fat ones, but not linearly.
          score: members.length * Math.log(1 + avgText),
        });
      }
    }

    // Drop candidates that merely wrap a better one. If A's members each contain
    // one of B's containers, B is the real list and A is its scaffolding.
    const kept = [];
    candidates.sort((a, b) => b.score - a.score);
    for (const c of candidates) {
      const overlaps = kept.some(
        (k) =>
          k.members.some((m) => c.members.some((n) => m.contains(n) || n.contains(m)))
      );
      if (!overlaps) kept.push(c);
    }
    return kept;
  }

  // Walk one item and record every piece of content, keyed by its position
  // within the item. Two items from the same loop produce the same keys.
  function collectFields(item) {
    const found = new Map();
    const put = (key, value) => {
      if (!value) return;
      if (!found.has(key)) found.set(key, value);
    };

    const walk = (el, path) => {
      const seen = new Map();
      for (const child of Array.from(el.childNodes)) {
        if (child.nodeType === 3) {
          const t = clean(child.nodeValue);
          if (t) put(path + "/#" + seen.size, t);
          continue;
        }
        if (child.nodeType !== 1 || SKIP.has(child.tagName)) continue;

        const base = sig(child, 0);
        const n = (seen.get(base) || 0) + 1;
        seen.set(base, n);
        const p = `${path}/${base}${n > 1 ? `:${n}` : ""}`;

        if (child.tagName === "A") {
          const href = child.getAttribute("href");
          if (href) put(p + "@href", absolute(href, item));
        }
        if (child.tagName === "IMG") {
          const src = child.getAttribute("src") || child.getAttribute("data-src");
          if (src) put(p + "@src", absolute(src, item));
        }
        if (child.tagName === "TIME") {
          const dt = child.getAttribute("datetime");
          if (dt) put(p + "@datetime", dt);
        }
        walk(child, p);
      }
    };

    walk(item, "");
    return found;
  }

  function absolute(url, ctx) {
    try {
      const base =
        (ctx && ctx.ownerDocument && ctx.ownerDocument.baseURI) ||
        (global.location && global.location.href) ||
        "";
      return base ? new URL(url, base).toString() : url;
    } catch {
      return url;
    }
  }

  function nameFor(path) {
    if (path.endsWith("@href")) return "link";
    if (path.endsWith("@src")) return "image";
    if (path.endsWith("@datetime")) return "date";
    const segs = path.split("/").filter(Boolean);
    for (let i = segs.length - 1; i >= 0; i--) {
      const m = segs[i].match(/\.([a-zA-Z][\w-]*)/);
      if (m) {
        const word = m[1].replace(/[-_]+/g, " ").trim();
        if (word && !/^(item|row|col|cell|wrap|wrapper|inner|container|content|box|flex|grid)$/i.test(word)) {
          return word.toLowerCase();
        }
      }
    }
    // A bare text node inherits its name from the element holding it, so an
    // <h2> full of text becomes "title" rather than "text0". A wrapping <a> or
    // <span> is not what the text *is*, so a heading in the path outranks it.
    const tags = segs.map((x) => x.split(/[.:@]/)[0]).filter((t) => !t.startsWith("#"));
    const STRONG = /^(H[1-6]|TIME|TD|TH|BLOCKQUOTE)$/;
    let tag = tags.find((t) => STRONG.test(t)) || tags[tags.length - 1] || "text";
    const map = {
      H1: "title", H2: "title", H3: "title", H4: "title", H5: "title", H6: "title",
      A: "link", IMG: "image", TIME: "date", SPAN: "text", P: "text", DIV: "text", LI: "text",
    };
    return (map[tag] || tag || "text").toLowerCase();
  }

  function dedupeNames(names) {
    const seen = new Map();
    return names.map((n) => {
      const base = n || "column";
      const count = (seen.get(base) || 0) + 1;
      seen.set(base, count);
      return count === 1 ? base : `${base}_${count}`;
    });
  }

  function buildRows(candidate) {
    const perItem = candidate.members.map(collectFields);
    const order = [];
    const tally = new Map();
    for (const map of perItem) {
      for (const key of map.keys()) {
        if (!tally.has(key)) { tally.set(key, 0); order.push(key); }
        tally.set(key, tally.get(key) + 1);
      }
    }

    // A column has to appear in at least half the items, or it is decoration.
    const threshold = Math.max(2, Math.ceil(perItem.length * 0.5));
    let keys = order.filter((k) => tally.get(k) >= threshold);

    // Constant columns carry no information — every row saying "Add to basket".
    keys = keys.filter((k) => {
      const values = new Set(perItem.map((m) => m.get(k) || ""));
      return values.size > 1;
    });

    if (!keys.length) return null;
    if (keys.length > 40) keys = keys.slice(0, 40);

    const rows = perItem.map((m) => keys.map((k) => m.get(k) || ""));
    const nonEmpty = rows.filter((r) => r.some((c) => c !== ""));
    if (nonEmpty.length < MIN_ROWS) return null;

    return {
      kind: "list",
      element: candidate.parent,
      columns: dedupeNames(keys.map(nameFor)),
      rows: nonEmpty,
      count: nonEmpty.length,
      score: candidate.score,
    };
  }

  // ---------- public ----------

  function detect(root) {
    const doc = root || global.document;
    const out = [];
    for (const t of findTables(doc)) out.push(t);
    for (const c of findRepeats(doc)) {
      const built = buildRows(c);
      if (built) out.push(built);
    }
    return out.sort((a, b) => b.score - a.score).slice(0, 12);
  }

  // Click-to-pick: given one element the user clicked, find its cohort.
  function pickFrom(el) {
    let node = el;
    while (node && node.parentElement) {
      const parent = node.parentElement;
      const target = sig(node, 2);
      const members = Array.from(parent.children).filter(
        (c) => !SKIP.has(c.tagName) && sig(c, 2) === target
      );
      if (members.length >= MIN_ROWS) {
        return buildRows({ parent, members, signature: target, score: members.length });
      }
      node = parent;
    }
    return null;
  }

  global.Gridpick = Object.assign(global.Gridpick || {}, {
    detect,
    pickFrom,
    _internals: { sig, collectFields, findRepeats, findTables, clean },
  });
})(typeof window !== "undefined" ? window : globalThis);
