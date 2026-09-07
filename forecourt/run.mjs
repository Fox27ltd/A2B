#!/usr/bin/env node
// Forecourt CLI.
//
//   node forecourt/run.mjs --url a2bautocentre.com --name "A2B Autocentre" --town Rainham
//   node forecourt/run.mjs --url a2b.com --town Rainham --rival bloggsmotors.co.uk --rival xyz.co.uk
//   node forecourt/run.mjs --batch forecourt/prospects.csv
//
// Writes <slug>.html and <slug>.json into --out (default forecourt/out).

import { writeFile, mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { auditSite } from "./audit.mjs";
import { renderReport, renderTextSummary } from "./report.mjs";

function parseArgs(argv) {
  const args = { rival: [], out: "forecourt/out" };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    const value = next && !next.startsWith("--") ? (i++, next) : true;
    if (key === "rival") args.rival.push(value);
    else args[key] = value;
  }
  return args;
}

const slugify = (s) =>
  String(s)
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

// Minimal CSV reader: handles quoted fields and embedded commas. Header row required.
function parseCsv(raw) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (quoted) {
      if (ch === '"' && raw[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { row.push(field); field = ""; }
    else if (ch === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (ch !== "\r") field += ch;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [header, ...body] = rows.filter((r) => r.some((c) => c.trim()));
  if (!header) return [];
  const keys = header.map((h) => h.trim().toLowerCase());
  return body.map((r) => Object.fromEntries(keys.map((k, i) => [k, (r[i] || "").trim()])));
}

async function auditOne({ url, name, town, rivals = [], outDir }) {
  process.stdout.write(`  auditing ${url} … `);
  const audit = await auditSite({ url, name, town });
  if (!audit.ok) {
    console.log(`FAILED (${audit.error})`);
    return audit;
  }
  console.log(`${audit.overall}/100 (${audit.grade})`);

  const rivalAudits = [];
  for (const r of rivals) {
    process.stdout.write(`    rival ${r} … `);
    const ra = await auditSite({ url: r, town });
    console.log(ra.ok ? `${ra.overall}/100` : `skipped (${ra.error})`);
    if (ra.ok) rivalAudits.push(ra);
  }

  const slug = slugify(name || url);
  await mkdir(outDir, { recursive: true });
  await writeFile(join(outDir, `${slug}.json`), JSON.stringify({ ...audit, rivals: rivalAudits }, null, 2));
  await writeFile(join(outDir, `${slug}.html`), renderReport(audit, rivalAudits));
  console.log(`    → ${join(outDir, `${slug}.html`)}`);
  return audit;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help || (!args.url && !args.batch)) {
    console.log(`
Forecourt — local-visibility audits for independent garages (Fox27)

  --url <domain>       the garage's website
  --name "<name>"      business name for the report header
  --town <town>        the town it wants to rank in (drives the local checks)
  --rival <domain>     a competing garage to compare against (repeatable)
  --batch <file.csv>   audit a list; columns: url,name,town
  --out <dir>          output directory (default forecourt/out)

Examples
  node forecourt/run.mjs --url a2bautocentre.com --name "A2B Autocentre" --town Rainham
  node forecourt/run.mjs --batch forecourt/prospects.csv --out forecourt/out
`);
    process.exit(args.help ? 0 : 1);
  }

  const outDir = args.out;
  const results = [];

  if (args.batch) {
    const rows = parseCsv(await readFile(args.batch, "utf8"));
    console.log(`Forecourt — ${rows.length} prospect${rows.length === 1 ? "" : "s"} from ${args.batch}\n`);
    for (const row of rows) {
      if (!row.url) continue;
      results.push(
        await auditOne({
          url: row.url,
          name: row.name || row.url,
          town: row.town || null,
          rivals: row.rival ? [row.rival] : [],
          outDir,
        })
      );
    }
  } else {
    console.log("Forecourt\n");
    results.push(
      await auditOne({
        url: args.url,
        name: args.name === true ? null : args.name,
        town: args.town === true ? null : args.town,
        rivals: args.rival.filter((r) => r !== true),
        outDir,
      })
    );
  }

  const ok = results.filter((r) => r.ok);
  if (ok.length > 1) {
    console.log("\nWorst first — call these:\n");
    for (const r of ok.sort((a, b) => a.overall - b.overall)) {
      console.log(renderTextSummary(r).split("\n").map((l) => `  ${l}`).join("\n") + "\n");
    }
  }
  console.log(`Done. ${ok.length}/${results.length} audited.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
