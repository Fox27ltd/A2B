// Forecourt — turns an audit JSON into a single-file HTML report.
//
// No build step, no assets, no external requests: one .html Callum can email,
// or open and print to PDF (Cmd/Ctrl+P → Save as PDF) on A4.

import { PILLAR_LABEL } from "./audit.mjs";

const BRAND = {
  studio: "Fox27",
  strapline: "Independent web studio · garages across south-east England",
  contact: "callumcorrigan27@gmail.com",
  ink: "#0F1419",
  surface: "#15191F",
  line: "#252B33",
  muted: "#9AA3AD",
  accent: "#F39C12",
  good: "#3FB950",
  warn: "#F39C12",
  bad: "#E5534B",
};

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const STATUS_META = {
  pass: { label: "Good", colour: BRAND.good, mark: "&#10003;" },
  warn: { label: "Could be better", colour: BRAND.warn, mark: "!" },
  fail: { label: "Costing you calls", colour: BRAND.bad, mark: "&#10007;" },
  info: { label: "For information", colour: BRAND.muted, mark: "i" },
};

const gradeColour = (n) => (n >= 70 ? BRAND.good : n >= 45 ? BRAND.warn : BRAND.bad);

const VERDICT = {
  A: "This site is doing its job. The gains left are small ones.",
  B: "Solid foundations with a handful of fixable leaks.",
  C: "The site works, but it is quietly losing enquiries every week.",
  D: "This site is holding the business back more than it helps it.",
  F: "Customers searching for this garage are being handed to competitors.",
};

function dial(score, size = 132) {
  const r = size / 2 - 9;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  return `
  <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="Score ${score} out of 100">
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${BRAND.line}" stroke-width="10"/>
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${gradeColour(score)}"
            stroke-width="10" stroke-linecap="round"
            stroke-dasharray="${filled.toFixed(1)} ${(circ - filled).toFixed(1)}"
            transform="rotate(-90 ${size / 2} ${size / 2})"/>
    <text x="50%" y="50%" text-anchor="middle" dy="0.36em"
          font-size="${size * 0.3}" font-weight="700" fill="#F6F8FA"
          font-family="'Space Grotesk',system-ui,sans-serif">${score}</text>
  </svg>`;
}

function pillarBar(p) {
  return `
  <div class="pillar">
    <div class="pillar-head">
      <span class="pillar-name">${esc(p.label)}</span>
      <span class="pillar-score" style="color:${gradeColour(p.score)}">${p.score}<span class="of">/100</span></span>
    </div>
    <div class="track"><div class="fill" style="width:${p.score}%;background:${gradeColour(p.score)}"></div></div>
    <p class="pillar-blurb">${esc(p.blurb)}</p>
    <p class="pillar-count">${p.passed} of ${p.total} checks passed</p>
  </div>`;
}

function checkRow(c) {
  const m = STATUS_META[c.status] || STATUS_META.info;
  return `
  <tr class="row ${c.status}">
    <td class="mark"><span class="dot" style="background:${m.colour}">${m.mark}</span></td>
    <td class="body">
      <div class="check-label">${esc(c.label)}</div>
      <div class="check-detail">${esc(c.detail)}</div>
      ${c.status !== "pass" && c.status !== "info" && c.fix ? `<div class="check-fix"><strong>Fix:</strong> ${esc(c.fix)}</div>` : ""}
    </td>
  </tr>`;
}

function headlineCard(c, i) {
  return `
  <li class="headline">
    <div class="headline-n">${i + 1}</div>
    <div>
      <h3>${esc(c.label)}</h3>
      <p>${esc(c.detail)}</p>
      <p class="fix"><strong>What fixes it:</strong> ${esc(c.fix)}</p>
    </div>
  </li>`;
}

function comparisonBlock(subject, rivals) {
  if (!rivals || !rivals.length) return "";
  const rows = [subject, ...rivals]
    .filter((r) => r && r.ok)
    .sort((a, b) => b.overall - a.overall)
    .map((r) => {
      const isSubject = r.url === subject.url;
      return `
      <div class="cmp-row ${isSubject ? "cmp-you" : ""}">
        <span class="cmp-name">${esc(r.business.name)}${isSubject ? " <em>(you)</em>" : ""}</span>
        <span class="cmp-track"><span class="cmp-fill" style="width:${r.overall}%;background:${
        isSubject ? BRAND.accent : BRAND.line
      }"></span></span>
        <span class="cmp-score" style="color:${isSubject ? BRAND.accent : BRAND.muted}">${r.overall}</span>
      </div>`;
    })
    .join("");
  return `
  <section class="block avoid-break">
    <h2>How you compare locally</h2>
    <p class="lede">The same checks, run against other garages competing for the same searches.</p>
    <div class="cmp">${rows}</div>
  </section>`;
}

export function renderReport(audit, rivals = []) {
  if (!audit.ok) {
    return `<!-- Forecourt: audit failed -->
    <h1>Could not reach ${esc(audit.url)}</h1><p>${esc(audit.error)}</p>`;
  }

  const date = new Date(audit.generatedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const name = audit.business.name;
  const town = audit.business.town;
  const pillars = Object.values(audit.pillars);
  const failCount = audit.checks.filter((c) => c.status === "fail").length;

  const byPillar = ["found", "trusted", "fast"].map((key) => {
    const rows = audit.checks
      .filter((c) => c.pillar === key)
      .sort((a, b) => {
        const order = { fail: 0, warn: 1, pass: 2, info: 3 };
        return order[a.status] - order[b.status] || b.weight - a.weight;
      })
      .map(checkRow)
      .join("");
    return `
    <section class="block">
      <h2>${esc(PILLAR_LABEL[key])} — every check</h2>
      <table class="checks">${rows}</table>
    </section>`;
  });

  return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(name)} — website audit — ${esc(BRAND.studio)}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;700&display=swap');
  :root{--ink:${BRAND.ink};--surface:${BRAND.surface};--line:${BRAND.line};--muted:${BRAND.muted};--accent:${BRAND.accent}}
  *{box-sizing:border-box}
  body{margin:0;background:var(--ink);color:#E6EAEF;
       font:400 15px/1.6 Inter,system-ui,-apple-system,"Segoe UI",sans-serif;
       -webkit-font-smoothing:antialiased}
  .page{max-width:820px;margin:0 auto;padding:48px 32px 64px}
  h1,h2,h3{font-family:'Space Grotesk',system-ui,sans-serif;font-weight:700;letter-spacing:-.01em;margin:0 0 12px}
  h1{font-size:34px;line-height:1.15}
  h2{font-size:21px;margin-top:0}
  h3{font-size:16px;margin-bottom:6px}
  p{margin:0 0 12px}
  .eyebrow{font:600 11px/1 Inter;letter-spacing:.18em;text-transform:uppercase;color:var(--accent);margin-bottom:14px}
  .lede{color:var(--muted);margin-bottom:20px}
  header.masthead{border-bottom:1px solid var(--line);padding-bottom:28px;margin-bottom:36px}
  .meta{color:var(--muted);font-size:13px;margin-top:8px}
  .meta a{color:var(--muted)}
  .verdict{display:flex;gap:32px;align-items:center;background:var(--surface);
           border:1px solid var(--line);border-radius:14px;padding:28px;margin-bottom:36px}
  .verdict .grade-word{font:700 13px/1 Inter;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);margin-bottom:8px}
  .verdict h2{font-size:22px;margin-bottom:8px}
  .verdict p{color:var(--muted);margin:0}
  .pillars{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-bottom:40px}
  .pillar{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:18px}
  .pillar-head{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:10px}
  .pillar-name{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:15px}
  .pillar-score{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:20px}
  .of{font-size:11px;color:var(--muted);font-weight:500}
  .track{height:6px;background:var(--line);border-radius:99px;overflow:hidden;margin-bottom:12px}
  .fill{height:100%;border-radius:99px}
  .pillar-blurb{font-size:12.5px;color:var(--muted);margin:0 0 8px}
  .pillar-count{font-size:11px;color:#6C7681;margin:0}
  .block{margin-bottom:40px}
  ol.headlines{list-style:none;padding:0;margin:0}
  li.headline{display:flex;gap:18px;background:var(--surface);border:1px solid var(--line);
              border-left:3px solid ${BRAND.bad};border-radius:10px;padding:20px;margin-bottom:14px}
  .headline-n{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:26px;color:${BRAND.bad};line-height:1;min-width:26px}
  li.headline p{font-size:14px;color:var(--muted);margin:0 0 8px}
  li.headline p.fix{color:#C6CDD5;margin:0}
  table.checks{width:100%;border-collapse:collapse}
  tr.row{border-top:1px solid var(--line)}
  tr.row:first-child{border-top:0}
  td{padding:14px 0;vertical-align:top}
  td.mark{width:34px}
  .dot{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;
       border-radius:50%;color:#0F1419;font-weight:700;font-size:11px;line-height:1}
  .check-label{font-weight:600;margin-bottom:3px}
  .check-detail{font-size:13.5px;color:var(--muted)}
  .check-fix{font-size:13px;color:#C6CDD5;margin-top:6px;padding-left:12px;border-left:2px solid var(--accent)}
  .cmp{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:20px}
  .cmp-row{display:grid;grid-template-columns:1fr 220px 40px;gap:14px;align-items:center;padding:9px 0}
  .cmp-name{font-size:14px}
  .cmp-you .cmp-name{font-weight:600;color:#fff}
  .cmp-track{height:8px;background:var(--line);border-radius:99px;overflow:hidden;display:block}
  .cmp-fill{display:block;height:100%;border-radius:99px}
  .cmp-score{font-family:'Space Grotesk',sans-serif;font-weight:700;text-align:right}
  .cta{background:linear-gradient(180deg,#1A1F26,#15191F);border:1px solid var(--accent);
       border-radius:14px;padding:28px;margin-top:8px}
  .cta h2{color:var(--accent)}
  .cta ul{margin:0 0 16px;padding-left:20px;color:var(--muted)}
  .cta li{margin-bottom:6px}
  footer{border-top:1px solid var(--line);margin-top:44px;padding-top:20px;
         font-size:12px;color:#6C7681}
  .method{font-size:12px;color:#6C7681}
  @media (max-width:680px){
    .verdict{flex-direction:column;text-align:center;gap:18px}
    .pillars{grid-template-columns:1fr}
    .cmp-row{grid-template-columns:1fr 90px 34px}
    .page{padding:32px 20px 48px}
  }
  @media print{
    body{background:#fff;color:#111}
    .page{max-width:none;padding:0}
    .verdict,.pillar,.cmp,li.headline,.cta{background:#fff;border-color:#DDE1E6;
      -webkit-print-color-adjust:exact;print-color-adjust:exact}
    .check-detail,.pillar-blurb,.lede,.meta,li.headline p{color:#4A5158}
    .verdict h2,.check-label,h1,h2,h3{color:#111}
    .dot{-webkit-print-color-adjust:exact;print-color-adjust:exact}
    .avoid-break,li.headline,.pillar{break-inside:avoid}
    .block{break-inside:auto}
    @page{size:A4;margin:16mm}
  }
</style>
</head>
<body>
<div class="page">

  <header class="masthead">
    <div class="eyebrow">${esc(BRAND.studio)} · Website audit</div>
    <h1>${esc(name)}</h1>
    <p class="meta">${esc(audit.finalUrl)} · audited ${esc(date)}${town ? ` · local search area: ${esc(town)}` : ""}</p>
  </header>

  <section class="verdict avoid-break">
    <div>${dial(audit.overall)}</div>
    <div>
      <div class="grade-word">Overall — grade ${esc(audit.grade)}</div>
      <h2>${esc(VERDICT[audit.grade])}</h2>
      <p>${
        failCount === 0
          ? `Nothing on this site is actively losing you enquiries.`
          : `${failCount} of ${audit.checks.length} checks came back as ${
              failCount === 1 ? "a problem that is" : "problems that are"
            } costing you enquiries. Every one of them is fixable.`
      }</p>
    </div>
  </section>

  <section class="pillars">${pillars.map(pillarBar).join("")}</section>

  ${
    audit.headline.length
      ? `<section class="block">
    <h2>${
      audit.headline.length === 1
        ? "The biggest thing costing you business"
        : `The ${audit.headline.length === 2 ? "two" : "three"} things costing you the most`
    }</h2>
    <p class="lede">Ranked by how much business ${
      audit.headline.length === 1 ? "it leaks" : "they leak"
    }, not by how hard ${audit.headline.length === 1 ? "it is" : "they are"} to fix.</p>
    <ol class="headlines">${audit.headline.map(headlineCard).join("")}</ol>
  </section>`
      : `<section class="block"><h2>No critical faults</h2>
    <p class="lede">Nothing on this site is actively losing you enquiries. The detail below covers the smaller gains.</p></section>`
  }

  ${comparisonBlock(audit, rivals)}

  ${byPillar.join("")}

  <section class="cta avoid-break">
    <h2>What ${esc(BRAND.studio)} would do about it</h2>
    <ul>
      <li>Rebuild on a fast, mobile-first stack — live within 7 days of go-ahead</li>
      <li>Every fault in this report closed, and the fixes checked in front of you</li>
      <li>Quote form straight to your inbox, tap-to-call on every page, map with directions</li>
      <li>Structured business data so Google gets your hours, address and phone right</li>
      <li>Hosting, backups, SSL and monthly copy changes looked after</li>
    </ul>
    <p style="margin:0"><strong>£1,500 once, or £750 up front and £55 a month.</strong>
    Either way you own the site. ${esc(BRAND.contact)}</p>
  </section>

  <footer>
    <p class="method"><strong>How this was measured.</strong> Automated checks run against the public homepage
    on ${esc(date)}: page source, robots.txt, sitemap, and a sample of up to 40 linked files weighed over the
    network. Scores are weighted by commercial impact for an independent garage — nothing here required access
    to your accounts, your hosting or your Google profile. A page can change between audits; rerun it any time.</p>
    <p>${esc(BRAND.studio)} · ${esc(BRAND.strapline)} · ${esc(BRAND.contact)}</p>
  </footer>

</div>
</body>
</html>`;
}

export function renderTextSummary(audit) {
  if (!audit.ok) return `${audit.url}: FAILED — ${audit.error}`;
  const p = audit.pillars;
  const lines = [
    `${audit.business.name} — ${audit.finalUrl}`,
    `Overall ${audit.overall}/100 (grade ${audit.grade})`,
    `  Found ${p.found.score}  ·  Trusted ${p.trusted.score}  ·  Fast ${p.fast.score}`,
  ];
  if (audit.headline.length) {
    lines.push("Biggest losses:");
    for (const h of audit.headline) lines.push(`  - ${h.label}`);
  }
  return lines.join("\n");
}

export { BRAND };
