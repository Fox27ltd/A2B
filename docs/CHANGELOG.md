# Template changelog

Track template-level changes here (not client-specific copy). Client repos pin against the template version noted in their initial commit.

## v1.2 — 2026-09-07

Adds `products/` — standalone software products, unrelated to the site template.

- `products/gridpick/` — Chrome extension (MV3, zero dependencies, no build step)
  that extracts tables and repeated list structures from any page to CSV, TSV,
  JSON or Markdown. Real tables are parsed into a grid honouring colspan/rowspan;
  everything else is found by fingerprinting sibling shape, with columns inferred
  from content position and named from class/tag. Free tier covers HTML tables;
  Pro covers inferred lists, click-to-pick, extra formats and multi-page crawl.
  15 detection assertions run in headless Chromium via `test/run.sh`.
  Ships with store listing, permission justifications, data-disclosure answers,
  privacy policy and a one-session setup guide.
- `products/BRIEF.md` — the options considered with honest odds, and why this one.

## v1.1 — 2026-09-07

Sales tooling. No changes to the site template itself.

- `forecourt/` — zero-dependency local-visibility audit engine for garage websites.
  30+ weighted checks across three pillars (Found / Trusted / Fast), scored 0-100,
  rendered to a single-file branded HTML report that prints to A4. Single and batch
  modes, optional competitor comparison. Public data only: homepage, robots.txt,
  sitemap, and a capped sample of linked assets — no credentials, no client accounts.
- `funding/` — `runway.mjs` reads `funding/ledger.csv` and reports whether recurring
  income covers recurring tooling cost, and how many retainers close the gap if not.
- `sales/06-forecourt-service.md` — product spec, pricing, unit economics, and the
  PECR/UK GDPR rules for outreach by email, phone, post and in person.
- `sales/07-forecourt-outreach.md` — outreach templates per route, and targeting criteria.
- `sales/08-self-funding-plan.md` — the 30-day plan and the arithmetic behind it.
- `npm run audit` and `npm run runway`.
- `.gitignore`: anchored the `out` rule to the repo root so `forecourt/out/` is not
  swallowed by the Next.js static-export ignore.

## v1.0 — 2026-05-30

Initial production-ready template.

- Next.js 14 (App Router) + TypeScript + Tailwind
- `config/brand.config.ts` as single source of truth
- `useScrollScrubber` + `<ScrollScrubber>` with timed `stops` overlays
- Hero with layered captions: tagline / featured review / RAC card + CTA
- Sections: Nav, Hero, TrustStrip, QuoteContact (mailto form), FindUs (Maps embed), Footer, ServicingTiers, RepairsGrid, ReviewsList, PromisePillars, PageHeader
- Sub-pages: /servicing /repairs /mot /about /contact /reviews
- SEO: per-page canonical + AutoRepair JSON-LD + BreadcrumbList + dynamic OG image (`next/og`) + sitemap + robots
- WebP optimisation script at `scripts/optimise-frames.py`
- 1-hour client playbook at `docs/WORKFLOW.md`
