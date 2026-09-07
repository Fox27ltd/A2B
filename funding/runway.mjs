#!/usr/bin/env node
// Does the tooling pay for itself yet? One number, honestly calculated.
//
//   node funding/runway.mjs
//
// Reads funding/ledger.csv. Add a line every time money moves. That is the
// whole system — no dashboard, no spreadsheet, no subscription.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const cfg = JSON.parse(readFileSync(join(here, "config.json"), "utf8"));
const cur = cfg.currency;

function parseCsv(raw) {
  const [header, ...body] = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const keys = header.split(",").map((k) => k.trim().toLowerCase());
  return body.map((line) => {
    // Fields here never contain commas; keep the parser honest but simple.
    const cells = line.split(",");
    return Object.fromEntries(keys.map((k, i) => [k, (cells[i] || "").trim()]));
  });
}

const rows = parseCsv(readFileSync(join(here, "ledger.csv"), "utf8"));

const num = (r) => Number(r.amount) || 0;
const isRecurring = (r) => (r.recurring || "").toLowerCase() === "monthly";

const mrr = rows.filter((r) => r.type === "revenue" && isRecurring(r)).reduce((s, r) => s + num(r), 0);
const monthlyCost =
  rows.filter((r) => r.type === "cost" && isRecurring(r)).reduce((s, r) => s + num(r), 0) ||
  cfg.costs.membershipGBP + cfg.costs.otherMonthlyGBP;

const thisMonth = new Date().toISOString().slice(0, 7);
const oneOffThisMonth = rows
  .filter((r) => r.type === "revenue" && !isRecurring(r) && (r.date || "").startsWith(thisMonth))
  .reduce((s, r) => s + num(r), 0);

const oneOffAllTime = rows
  .filter((r) => r.type === "revenue" && !isRecurring(r))
  .reduce((s, r) => s + num(r), 0);

const coverage = monthlyCost > 0 ? mrr / monthlyCost : Infinity;
const gap = Math.max(0, monthlyCost - mrr);
const monthsBankedByOneOffs = monthlyCost > 0 ? oneOffAllTime / monthlyCost : Infinity;

const bar = (ratio, width = 28) => {
  const filled = Math.min(width, Math.round(Math.min(ratio, 1) * width));
  return "█".repeat(filled) + "·".repeat(width - filled);
};

const money = (n) => `${cur}${n.toFixed(2).replace(/\.00$/, "")}`;
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

console.log(`
  FOX27 — does the tooling pay for itself?
  ${"─".repeat(50)}

  Recurring revenue      ${money(mrr).padStart(10)} / month
  Recurring cost         ${money(monthlyCost).padStart(10)} / month
                         ${bar(coverage)}  ${
  coverage === Infinity ? "∞" : `${coverage.toFixed(1)}×`
} covered
`);

if (mrr >= monthlyCost) {
  console.log(`  ✅ SELF-FUNDING. Recurring income covers the tooling ${coverage.toFixed(1)}× over.`);
  const surplus = mrr - monthlyCost;
  console.log(`     ${money(surplus)}/month of that is yours.`);
} else {
  console.log(`  ⏳ NOT YET. Short by ${money(gap)}/month.`);
  const opts = [
    ["storefront retainer", "storefront retainers", cfg.prices.storefrontMonthly],
    ["Pulse client", "Pulse clients", cfg.prices.pulseMonthly],
  ];
  console.log(`     Any one of these closes it:`);
  for (const [one, many, price] of opts) {
    console.log(`       ${plural(Math.ceil(gap / price), one, many)} at ${money(price)}/mo`);
  }
  const auditMonths = cfg.prices.auditOneOff / monthlyCost;
  console.log(
    `     Or sell one audit at ${money(cfg.prices.auditOneOff)} — that alone banks ` +
      `${auditMonths.toFixed(1)} months of tooling.`
  );
}

console.log(`
  One-off income         ${money(oneOffThisMonth).padStart(10)} this month
                         ${money(oneOffAllTime).padStart(10)} all time  (= ${monthsBankedByOneOffs.toFixed(
  1
)} months of tooling banked)
`);

const target = cfg.targets.coverageMultiple;
if (coverage < target) {
  const need = monthlyCost * target - mrr;
  console.log(
    `  Target is ${target}× cover (${money(monthlyCost * target)}/mo). ${money(need)}/mo to go — ` +
      `${plural(
        Math.ceil(need / cfg.prices.storefrontMonthly),
        "more storefront retainer",
        "more storefront retainers"
      )}.`
  );
} else {
  console.log(`  Target of ${target}× cover: hit. Raise the target.`);
}

console.log(`
  ${"─".repeat(50)}
  Add a line to funding/ledger.csv every time money moves.
  Columns: date,type,client,item,amount,recurring,note
    type      revenue | cost
    recurring monthly | once
`);
