// Gridpick — popup controller.

const $ = (id) => document.getElementById(id);
const state = { tabId: null, tables: [], current: null, format: "csv", limits: null, pro: false };

const FORMAT_LABELS = { csv: "CSV", tsv: "Excel", json: "JSON", markdown: "Markdown" };

function toast(text, isError) {
  const el = $("toast");
  el.textContent = text;
  el.className = "toast" + (isError ? " err" : "");
  el.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { el.hidden = true; }, 2600);
}

const send = (msg) => chrome.runtime.sendMessage(msg);
const tell = (msg) => chrome.tabs.sendMessage(state.tabId, msg);

async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) return fail("No page to read here.");
  state.tabId = tab.id;

  if (/^(chrome|edge|about|chrome-extension):/i.test(tab.url || "")) {
    return fail("Chrome blocks extensions on this page. Open a normal website and try again.");
  }

  state.pro = await GridpickLicense.isPro();
  state.limits = state.pro ? GridpickLicense.PRO : GridpickLicense.FREE;
  const badge = $("upgrade");
  badge.hidden = false;
  badge.textContent = state.pro ? "Pro" : "Free";
  badge.classList.toggle("pro", state.pro);
  if (!state.pro) badge.addEventListener("click", () => send({ type: "OPEN_CHECKOUT" }));

  await scan();
}

function fail(message) {
  $("status").textContent = message;
  $("status").classList.add("err");
  $("status").hidden = false;
  $("list").hidden = true;
}

async function scan() {
  $("status").hidden = false;
  $("status").classList.remove("err");
  $("status").textContent = "Scanning the page…";
  $("preview").hidden = true;
  $("list").hidden = true;

  const injected = await send({ type: "INJECT", tabId: state.tabId });
  if (!injected || !injected.ok) return fail(injected?.error || "Could not read this page.");

  let res;
  try {
    res = await tell({ type: "SCAN" });
  } catch {
    return fail("Could not read this page. Try reloading it.");
  }
  if (!res || !res.ok) return fail(res?.error || "Nothing readable on this page.");

  state.tables = res.tables;
  if (!state.tables.length) {
    return fail("No tables or lists found here. Try 'Pick manually' to point at what you want.");
  }
  renderList();
}

function renderList() {
  const ul = $("list");
  ul.innerHTML = "";
  for (const t of state.tables) {
    const locked = t.kind === "list" && !state.limits.lists;
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.disabled = locked;

    const title = document.createElement("div");
    title.className = "row-title";
    const label = document.createElement("span");
    label.textContent = t.kind === "table" ? "Table" : "List / grid";
    const count = document.createElement("span");
    count.className = "count";
    count.textContent = locked ? "Pro" : `${t.count} rows`;
    title.append(label, count);

    const cols = document.createElement("div");
    cols.className = "row-cols";
    cols.textContent = t.columns.join(" · ");

    btn.append(title, cols);
    btn.addEventListener("click", () => (locked ? send({ type: "OPEN_CHECKOUT" }) : open(t)));
    li.append(btn);
    ul.append(li);
  }
  $("status").hidden = true;
  ul.hidden = false;
}

function open(t) {
  state.current = t;
  if (!state.limits.formats.includes(state.format)) state.format = "csv";

  $("list").hidden = true;
  $("preview").hidden = false;
  $("preview-meta").textContent = `${t.count} rows · ${t.columns.length} columns`;

  const grid = $("grid");
  grid.innerHTML = "";
  const head = grid.insertRow();
  for (const c of t.columns) {
    const th = document.createElement("th");
    th.textContent = c;
    th.title = c;
    head.append(th);
  }
  for (const row of t.preview) {
    const tr = grid.insertRow();
    for (const cell of row) {
      const td = tr.insertCell();
      td.textContent = cell;
      td.title = cell;
    }
  }

  renderFormats();
  const crawlOpt = $("crawl-opt");
  crawlOpt.querySelector(".pro-tag").hidden = state.limits.multiPage;
  $("crawl").disabled = !state.limits.multiPage;
}

function renderFormats() {
  const box = $("formats");
  box.innerHTML = "";
  for (const key of Object.keys(FORMAT_LABELS)) {
    const allowed = state.limits.formats.includes(key);
    const b = document.createElement("button");
    b.textContent = FORMAT_LABELS[key];
    b.className = state.format === key ? "on" : "";
    b.disabled = !allowed;
    b.title = allowed ? "" : "Pro";
    b.addEventListener("click", () => {
      if (!allowed) return send({ type: "OPEN_CHECKOUT" });
      state.format = key;
      renderFormats();
    });
    box.append(b);
  }
}

// Build the export, crawling extra pages first if asked.
async function build() {
  const wantsCrawl = $("crawl").checked && state.limits.multiPage;

  // activeTab dies the moment the tab navigates, so a crawl needs a real
  // grant. Ask for it only when the user actually ticks the box.
  if (wantsCrawl) {
    const granted = await chrome.permissions.request({
      permissions: ["tabs"],
      origins: ["<all_urls>"],
    });
    if (!granted) {
      $("crawl").checked = false;
      throw new Error("Following pages needs permission to read the next pages.");
    }
  }

  if (!wantsCrawl) {
    const res = await tell({ type: "EXTRACT", index: state.current.index, format: state.format });
    if (!res || !res.ok) throw new Error(res?.error || "Could not build the file.");
    return res;
  }

  toast("Following next-page links…");
  const crawled = await send({ type: "CRAWL", tabId: state.tabId, index: state.current.index, maxPages: 10 });
  if (!crawled || !crawled.ok) throw new Error(crawled?.error || "Could not follow the pages.");

  // The crawl runs in the worker, so serialise here from the raw rows.
  const table = { columns: crawled.columns, rows: crawled.rows };
  const res = await tell({ type: "SCAN" }); // refresh the title after navigation
  const { text, ext, mime } = serialiseLocally(table, state.format);
  return {
    ok: true, text, ext, mime, rows: crawled.rows.length, pages: crawled.pages,
    filename: `gridpick-${new Date().toISOString().slice(0, 10)}.${ext}`,
    title: res?.title,
  };
}

// Minimal local mirror of csv.js for crawled data, which never passes through
// the content script.
function serialiseLocally(table, format) {
  const cell = (v) => {
    let s = v == null ? "" : String(v);
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  if (format === "json") {
    const objs = table.rows.map((r) => Object.fromEntries(table.columns.map((c, i) => [c, r[i] ?? ""])));
    return { text: JSON.stringify(objs, null, 2), ext: "json", mime: "application/json" };
  }
  if (format === "markdown") {
    const esc = (s) => String(s ?? "").replace(/\|/g, "\\|");
    return {
      text: [`| ${table.columns.map(esc).join(" | ")} |`,
             `| ${table.columns.map(() => "---").join(" | ")} |`,
             ...table.rows.map((r) => `| ${r.map(esc).join(" | ")} |`)].join("\n"),
      ext: "md", mime: "text/markdown",
    };
  }
  const d = format === "tsv" ? "\t" : ",";
  const lines = [table.columns.map(cell).join(d), ...table.rows.map((r) => r.map(cell).join(d))];
  return { text: "﻿" + lines.join("\r\n") + "\r\n", ext: format === "tsv" ? "tsv" : "csv",
           mime: format === "tsv" ? "text/tab-separated-values" : "text/csv" };
}

$("copy").addEventListener("click", async () => {
  try {
    const res = await build();
    await navigator.clipboard.writeText(res.text);
    toast(`${res.rows} rows copied${res.pages > 1 ? ` from ${res.pages} pages` : ""}`);
  } catch (err) { toast(err.message, true); }
});

$("download").addEventListener("click", async () => {
  try {
    const res = await build();
    // btoa cannot handle non-Latin-1; encode as UTF-8 bytes first.
    const bytes = new TextEncoder().encode(res.text);
    let binary = "";
    for (const b of bytes) binary += String.fromCharCode(b);
    const out = await send({
      type: "DOWNLOAD", base64: btoa(binary), mime: res.mime, filename: res.filename,
    });
    if (!out || !out.ok) throw new Error(out?.error || "Download failed");
    toast(`Saved ${res.filename}`);
  } catch (err) { toast(err.message, true); }
});

$("pick").addEventListener("click", async () => {
  if (!state.limits.pick) return send({ type: "OPEN_CHECKOUT" });
  await tell({ type: "START_PICK" });
  window.close(); // the user needs the page, not this panel
});

$("back").addEventListener("click", () => {
  $("preview").hidden = true;
  $("list").hidden = false;
});

$("rescan").addEventListener("click", scan);

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "PICKED") { state.tables.unshift(msg.table); renderList(); open(msg.table); }
});

init().catch((err) => fail(err.message));
