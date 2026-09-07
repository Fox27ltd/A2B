# Gridpick

A Chrome extension that turns any table, product grid or search-results list into CSV, Excel, JSON or Markdown. Zero dependencies, zero build step, nothing to host.

**Setup and publishing: `SETUP.md`. Store copy: `store/listing.md`.**

## Try it in two minutes

`chrome://extensions` → Developer mode → **Load unpacked** → pick this folder.

## Why it should sell

Free tools handle `<table>`. Almost nothing free handles the other 90% of the web — product grids, search results, directory rows — because those are `<div>`s, and reading them means inferring structure rather than parsing it. That inference is what `src/detect.js` does, and it's the paid tier.

The free tier is deliberately a complete, useful product: every real table on the page, exported to CSV. It exists to earn installs and reviews, which is the only distribution this has.

## How detection works

**Real tables** are parsed into a grid, so `colspan` and `rowspan` land in the right cells instead of shunting every later column sideways.

**Everything else** relies on the fact that anything worth extracting was rendered from a loop, and a loop leaves a fingerprint: N sibling elements with the same shape. So:

1. For every element with 3+ children, fingerprint each child (tag + meaningful classes + the shape of its own children, two levels down).
2. Siblings sharing a fingerprint are a candidate list. State classes (`.is-active`, `.selected`) are stripped first, so one highlighted card doesn't split the group.
3. Discard candidates that merely wrap a better one, and candidates whose items are too thin to be data — that's what rejects nav bars and pagination.
4. Infer columns by walking each item and keying every piece of content by its position within the item. A key present in half the items becomes a column.
5. Drop columns whose value never changes: every row saying "Add to basket" is chrome, not data.
6. Name columns from class names, falling back to tags — a heading outranks a wrapping `<a>`, so a linked title comes out as `title`, not `link`.

Column names come out as `title`, `price`, `stock`, `rating`, `link` on real markup, which is what makes the CSV usable without editing.

## Tests

```bash
./test/run.sh
```

Runs the detector against `test/fixtures.html` in real headless Chromium and asserts 15 behaviours — colspan/rowspan handling, grid detection, constant-column dropping, nav/pagination rejection. No test framework, no dependencies.

`test/popup-preview.html` renders the popup outside an extension host with the Chrome APIs stubbed, so the UI can be checked and screenshotted without loading anything.

## Layout

| | |
|---|---|
| `src/detect.js` | table parsing + repeated-structure inference — the product |
| `src/csv.js` | CSV/TSV/JSON/Markdown, with Excel formula-injection guarding |
| `src/content.js` | page-side controller, click-to-pick overlay, next-link discovery |
| `src/background.js` | injection, multi-page crawl, downloads |
| `src/license.js` | the only file that knows about ExtensionPay |
| `src/popup.*` | the panel |
| `icons/make-icons.py` | regenerates the PNGs; no image library needed |

## Notes

- Nothing is injected until the user clicks the icon, so the extension asks for no permissions on install.
- Host access is requested only when the user ticks "Follow next page links", because `activeTab` is revoked on navigation.
- CSV cells starting with `=`, `+`, `-` or `@` are prefixed with `'` so a scraped cell can't execute as a formula in Excel.
