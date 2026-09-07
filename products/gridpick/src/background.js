// Gridpick — service worker. Injection, the multi-page crawl, downloads.

importScripts("license.js");

const SCRIPTS = ["src/detect.js", "src/csv.js", "src/content.js"];
const STYLES = ["src/picker.css"];

async function inject(tabId) {
  await chrome.scripting.insertCSS({ target: { tabId }, files: STYLES }).catch(() => {});
  await chrome.scripting.executeScript({ target: { tabId }, files: SCRIPTS });
}

// Content scripts are injected on demand rather than declared, so the extension
// asks for nothing until the user actually clicks it.
async function ask(tabId, message) {
  try {
    return await chrome.tabs.sendMessage(tabId, message);
  } catch {
    await inject(tabId);
    return chrome.tabs.sendMessage(tabId, message);
  }
}

function waitForLoad(tabId, timeoutMs = 20000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { cleanup(); reject(new Error("Page took too long to load")); }, timeoutMs);
    function listener(id, info) {
      if (id === tabId && info.status === "complete") { cleanup(); resolve(); }
    }
    function cleanup() { clearTimeout(timer); chrome.tabs.onUpdated.removeListener(listener); }
    chrome.tabs.onUpdated.addListener(listener);
  });
}

// After navigating, the structure we were reading has a new index. Match it by
// column shape instead — same loop, same columns.
function bestMatch(tables, columns) {
  let best = null;
  let bestScore = 0;
  for (const t of tables) {
    const overlap = t.columns.filter((c) => columns.includes(c)).length;
    const score = overlap / Math.max(columns.length, t.columns.length);
    if (score > bestScore) { bestScore = score; best = t; }
  }
  return bestScore >= 0.6 ? best : null;
}

async function crawl({ tabId, index, maxPages = 10, onProgress }) {
  const first = await ask(tabId, { type: "RAW", index });
  if (!first || !first.ok) throw new Error((first && first.error) || "Could not read that table");

  const columns = first.columns;
  const rows = first.rows.slice();
  const seen = new Set([(await chrome.tabs.get(tabId)).url]);
  let pages = 1;

  while (pages < maxPages) {
    const next = await ask(tabId, { type: "NEXT_LINK" });
    if (!next || !next.ok || !next.href || seen.has(next.href)) break;
    seen.add(next.href);

    await chrome.tabs.update(tabId, { url: next.href });
    await waitForLoad(tabId);
    await inject(tabId);

    const scan = await ask(tabId, { type: "SCAN" });
    if (!scan || !scan.ok) break;
    const match = bestMatch(scan.tables, columns);
    if (!match) break;

    const raw = await ask(tabId, { type: "RAW", index: match.index });
    if (!raw || !raw.ok || !raw.rows.length) break;

    // Same rows again means the "next" link looped back on itself.
    if (JSON.stringify(raw.rows[0]) === JSON.stringify(rows[rows.length - raw.rows.length] || [])) break;
    rows.push(...raw.rows);
    pages++;
    if (onProgress) onProgress({ pages, rows: rows.length });
  }

  return { columns, rows, pages };
}

chrome.runtime.onMessage.addListener((msg, sender, respond) => {
  (async () => {
    try {
      switch (msg.type) {
        case "INJECT":
          await inject(msg.tabId);
          respond({ ok: true });
          break;
        case "CRAWL": {
          const result = await crawl({ tabId: msg.tabId, index: msg.index, maxPages: msg.maxPages });
          respond({ ok: true, ...result });
          break;
        }
        case "DOWNLOAD": {
          // A data: URL keeps this off the network and works in a service
          // worker, where URL.createObjectURL is not available.
          const url = `data:${msg.mime};base64,${msg.base64}`;
          const id = await chrome.downloads.download({ url, filename: msg.filename, saveAs: false });
          respond({ ok: true, id });
          break;
        }
        case "OPEN_CHECKOUT":
          GridpickLicense.openCheckout();
          respond({ ok: true });
          break;
        default:
          respond({ ok: false, error: "Unknown request" });
      }
    } catch (err) {
      respond({ ok: false, error: String((err && err.message) || err) });
    }
  })();
  return true; // keep the channel open for the async reply
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "gridpick-open",
    title: "Gridpick — copy this page's data",
    contexts: ["page", "selection"],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "gridpick-open" && tab && tab.id != null) {
    await inject(tab.id);
    await chrome.action.openPopup().catch(() => {});
  }
});
