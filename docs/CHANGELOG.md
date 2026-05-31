# Template changelog

Track template-level changes here (not client-specific copy). Client repos pin against the template version noted in their initial commit.

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
