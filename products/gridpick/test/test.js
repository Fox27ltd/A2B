// Runs inside fixtures.html, against the real document — the same situation a
// content script is in.
window.addEventListener("load", () => {
  const log = [];
  const found = Gridpick.detect(document);
  log.push("DETECTED " + found.length + " structure(s)");
  found.forEach((t, i) => {
    log.push(`\n--- [${i}] kind=${t.kind} rows=${t.count} cols=${t.columns.length}`);
    log.push("columns: " + JSON.stringify(t.columns));
    t.rows.slice(0, 3).forEach((r) => log.push("  " + JSON.stringify(r)));
  });

  let failures = 0;
  const assert = (name, cond) => { if (!cond) failures++; log.push((cond ? "PASS  " : "FAIL  ") + name); };

  log.push("\n--- assertions ---");
  const fees = found.find((t) => t.kind === "table");
  assert("real table detected", !!fees);
  assert("table headers read", fees && fees.columns.join(",") === "Service,Price,Turnaround");
  assert("rowspan filled (MOT on both rows)", fees && fees.rows[0][0] === "MOT" && fees.rows[1][0] === "MOT");
  assert("colspan expanded across 2 cells", fees && fees.rows[3][1] === fees.rows[3][2] && /189/.test(fees.rows[3][1]));

  const grid = found.find((t) => t.kind === "list" && t.count === 4);
  assert("product grid detected (4 items)", !!grid);
  assert("grid found a price column", grid && grid.columns.some((c) => /price/i.test(c)));
  assert("grid captured absolute link", grid && grid.rows[0].some((c) => /\/p\/1$/.test(c)));
  assert("grid captured image", grid && grid.rows[0].some((c) => /\/img\/1\.jpg$/.test(c)));
  assert("constant 'Add to basket' column dropped", grid && !grid.rows[0].includes("Add to basket"));
  assert("state class .is-active did not split the group", grid && grid.count === 4);

  const rows = found.find((t) => t.kind === "list" && t.count === 5);
  assert("result rows detected (5 items)", !!rows);
  assert("results captured datetime attribute", rows && rows.rows[0].includes("2026-08-01"));
  assert("results captured address text", rows && rows.rows[0].some((c) => /Rainham/.test(c)));

  const navish = found.filter((t) => t.rows.some((r) => r.join(" ").includes("Contact")));
  assert("site nav not offered as data", navish.length === 0);
  const pager = found.filter((t) => t.count === 3 && t.rows.every((r) => r.join("").length < 4));
  assert("pagination not offered as data", pager.length === 0);

  if (found[0]) {
    log.push("\n--- CSV of best structure ---");
    log.push(Gridpick.toCsv(found[0], { bom: false }).replace(/\r/g, ""));
  }
  log.push(failures === 0 ? "\nALL ASSERTIONS PASSED" : `\n${failures} ASSERTION(S) FAILED`);
  document.getElementById("out").textContent = log.join("\n");
});
