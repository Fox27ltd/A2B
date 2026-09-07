// Gridpick — page-side controller.
//
// Holds the detected structures (which contain live DOM nodes and so cannot
// cross the message boundary) and hands the popup plain summaries by index.

(function () {
  "use strict";
  if (window.__gridpickLoaded) return;
  window.__gridpickLoaded = true;

  const state = { found: [], picking: false, overlay: null, label: null, hovered: null };

  function summarise(t, i) {
    return {
      index: i,
      kind: t.kind,
      count: t.count,
      columns: t.columns,
      preview: t.rows.slice(0, 5).map((r) => r.map((c) => String(c).slice(0, 120))),
    };
  }

  function scan() {
    state.found = Gridpick.detect(document);
    return state.found.map(summarise);
  }

  // ---------- pick mode ----------

  function ensureOverlay() {
    if (state.overlay) return;
    const o = document.createElement("div");
    o.className = "gridpick-overlay";
    const l = document.createElement("div");
    l.className = "gridpick-label";
    document.documentElement.appendChild(o);
    document.documentElement.appendChild(l);
    state.overlay = o;
    state.label = l;
  }

  function paint(members) {
    ensureOverlay();
    if (!members || !members.length) {
      state.overlay.style.display = "none";
      state.label.style.display = "none";
      return;
    }
    let top = Infinity, left = Infinity, right = -Infinity, bottom = -Infinity;
    for (const m of members) {
      const r = m.getBoundingClientRect();
      top = Math.min(top, r.top); left = Math.min(left, r.left);
      right = Math.max(right, r.right); bottom = Math.max(bottom, r.bottom);
    }
    Object.assign(state.overlay.style, {
      display: "block",
      top: `${top + window.scrollY}px`,
      left: `${left + window.scrollX}px`,
      width: `${Math.max(0, right - left)}px`,
      height: `${Math.max(0, bottom - top)}px`,
    });
    state.label.textContent = `${members.length} items — click to take these`;
    Object.assign(state.label.style, {
      display: "block",
      top: `${Math.max(0, top + window.scrollY - 26)}px`,
      left: `${left + window.scrollX}px`,
    });
  }

  function cohortFor(el) {
    let node = el;
    while (node && node.parentElement && node !== document.body) {
      const parent = node.parentElement;
      const target = Gridpick._internals.sig(node, 2);
      const members = Array.from(parent.children).filter(
        (c) => Gridpick._internals.sig(c, 2) === target
      );
      if (members.length >= 3) return members;
      node = parent;
    }
    return null;
  }

  function onMove(e) {
    if (!state.picking) return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el || el.classList.contains("gridpick-overlay") || el.classList.contains("gridpick-label")) return;
    state.hovered = el;
    paint(cohortFor(el));
  }

  function onClick(e) {
    if (!state.picking) return;
    e.preventDefault();
    e.stopPropagation();
    const el = document.elementFromPoint(e.clientX, e.clientY) || state.hovered;
    const table = el && Gridpick.pickFrom(el);
    stopPicking();
    if (table) {
      state.found.unshift(table);
      chrome.runtime.sendMessage({ type: "PICKED", table: summarise(table, 0) });
    } else {
      chrome.runtime.sendMessage({ type: "PICK_FAILED" });
    }
  }

  function onKey(e) {
    if (state.picking && e.key === "Escape") { stopPicking(); chrome.runtime.sendMessage({ type: "PICK_CANCELLED" }); }
  }

  function startPicking() {
    state.picking = true;
    ensureOverlay();
    document.addEventListener("mousemove", onMove, true);
    document.addEventListener("click", onClick, true);
    document.addEventListener("keydown", onKey, true);
    document.documentElement.classList.add("gridpick-picking");
  }

  function stopPicking() {
    state.picking = false;
    document.removeEventListener("mousemove", onMove, true);
    document.removeEventListener("click", onClick, true);
    document.removeEventListener("keydown", onKey, true);
    document.documentElement.classList.remove("gridpick-picking");
    if (state.overlay) state.overlay.style.display = "none";
    if (state.label) state.label.style.display = "none";
  }

  // ---------- next-page discovery ----------

  const NEXT_TEXT = /^(next|next page|older|more|»|›|>|→)$/i;

  function findNextLink() {
    const rel = document.querySelector('a[rel~="next"], link[rel~="next"]');
    if (rel && rel.href) return rel.href;
    const anchors = Array.from(document.querySelectorAll("a[href]"));
    for (const a of anchors) {
      const label = (a.textContent || "").trim();
      const aria = a.getAttribute("aria-label") || "";
      if (NEXT_TEXT.test(label) || NEXT_TEXT.test(aria.trim())) {
        if (a.getAttribute("aria-disabled") === "true") continue;
        if (a.href && a.href !== location.href) return a.href;
      }
    }
    return null;
  }

  // ---------- messaging ----------

  chrome.runtime.onMessage.addListener((msg, _sender, respond) => {
    try {
      switch (msg.type) {
        case "SCAN":
          respond({ ok: true, tables: scan(), title: document.title, url: location.href });
          break;
        case "EXTRACT": {
          const t = state.found[msg.index];
          if (!t) return respond({ ok: false, error: "That table is no longer on the page. Rescan and try again." });
          const { text, ext, mime } = Gridpick.serialise(t, msg.format, msg.options || {});
          respond({ ok: true, text, ext, mime, filename: Gridpick.filename(t, ext, document.title), rows: t.count });
          break;
        }
        case "RAW": {
          const t = state.found[msg.index];
          if (!t) return respond({ ok: false, error: "Table no longer available." });
          respond({ ok: true, columns: t.columns, rows: t.rows });
          break;
        }
        case "START_PICK": startPicking(); respond({ ok: true }); break;
        case "STOP_PICK": stopPicking(); respond({ ok: true }); break;
        case "NEXT_LINK": respond({ ok: true, href: findNextLink() }); break;
        default: respond({ ok: false, error: "Unknown request" });
      }
    } catch (err) {
      respond({ ok: false, error: String((err && err.message) || err) });
    }
    return true;
  });
})();
