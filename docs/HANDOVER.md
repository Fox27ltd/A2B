# A2B Autocentre — app-readiness handover

**Written:** 2026-08-29 · **Branch:** `claude/app-readiness-handover-5f7xxx` · **Repo:** `Fox27ltd/A2B`

Context recovered from git after the previous session ran out. This file is the
durable record — read this first in any new session, then `docs/client_questions.md`
and `docs/WORKFLOW.md`.

---

## 1 · What this project is

A2B Autocentre is the **first client build** on the Fox27 garage-site template
(template v1.0, see `docs/CHANGELOG.md`). Next.js 14 App Router · TypeScript ·
Tailwind · Framer Motion. Single source of truth is `config/brand.config.ts`.

Commercially it is also the **pitch asset** — the `sales/` folder is a complete
door-knock pack (script, pricing one-pager, agreement, onboarding email,
"tomorrow" checklist) aimed at walking into A2B and leaving with a signature.
Pricing on the table: £1,500 one-off, or £750 setup + £55/mo.

## 2 · Verified state as of this handover

Run on a clean `npm install` in this container:

| Check | Result |
|---|---|
| `npx tsc --noEmit` | **clean, exit 0** |
| `npm run build` | **clean** — 16 routes, all static except `/opengraph-image` (edge) |
| Git | `main` and this branch both at `3620ce9`; no divergence, working tree clean |

Commit history is short and all from 2026-05-31:

```
3620ce9 fix: narrow optional priceFrom via 'in' guard in seo + RepairsGrid
6e6cee1 fix: narrow priceFrom via 'in' guard for AutoRepair schema
2599cdf fix: type cookies.list as CookieEntry[] so empty array compiles
41873c0 fix: widen legal.ts placeholder types so TBD comparisons type-check
56c57b9 init: A2B Autocentre site from Fox27 garage template v1.0
```

Those four fixes were a typecheck-cleanup pass on the initial import. Nothing
functional has been added since.

## 3 · What is actually built

**Routes (16):** `/` `/servicing` `/repairs` `/mot` `/about` `/contact` `/reviews`
`/privacy` `/terms` `/cookies` `/scrubber-test` plus `sitemap.xml`, `robots.txt`,
`opengraph-image`, `_not-found`.

**Homepage** (`app/page.tsx`) composes: `Hero` → `TrustStrip` → `QuoteContact` →
`FindUs` → `Footer`. `ServicingTiers`, `RepairsGrid`, `ReviewsList` and
`PromisePillars` live on their sub-pages, not the homepage.

**Content already confirmed and in `brand.config.ts`:**
- NAP: 95-103 Upminster Road South, Rainham, London RM13 9AA · 01708 521 818 ·
  `a2bautocentre@gmail.com` · established 2016
- Hours Mon–Fri 08:00–18:00, Sat 08:00–17:00, Sun closed
- 9 repair services with Lucide icon keys; MOT priced from £35
- 3 servicing tiers (Bronze/Silver/Gold) — **checklists are placeholders**
- Featured offer: RAC MOT Check & Repair Plan, £750 cover
- 3 real RAC reviews (T.A., N.Y., S.T.)

**Assets present** (`public/`, 1.6 MB): logo in clean + blue-badge variants (webp
and png), full favicon set incl. apple-touch-icon, and **11 dashboard hero frames**
(`public/brand/dashboard/frame-01..11.webp`) driving the scroll scrubber. Raw
originals are committed at `_source-images/` (9.1 MB).

**Legal layer** (`lib/legal.ts` + the three policy pages) is built out: UK GDPR
lawful bases, retention schedule, processor list, cookie table (currently zero
non-essential cookies). Effective date 30 May 2026.

**SEO layer** (`lib/seo.ts`): AutoRepair JSON-LD with opening hours, `makesOffer`,
`aggregateRating`, reviews, `areaServed` (Rainham, Upminster, Hornchurch, Dagenham,
London); BreadcrumbList helper; canonical helper; dynamic OG via `next/og`.

## 4 · Open technical issues found during this audit

These are **new findings**, not carried over — worth fixing before launch.

1. **`brand.seo.ogImage` points at a file that does not exist.** It is
   `/og/default.png`, but `public/og/` is absent. `autoRepairSchema()` emits it as
   the `image` field, so the structured data references a 404. Either add the file
   or point `ogImage` at the dynamic `/opengraph-image` route.
2. **`/repairs` ships the entire Lucide icon library to the client.**
   `components/sections/RepairsGrid.tsx:7` does `import * as Icons from "lucide-react"`
   to resolve icons from string keys. Result: `/repairs` is 156 kB page / **298 kB
   First Load JS**, against ~140 kB for every other route. This is the main threat
   to the "Lighthouse Performance ≥90" line in the QA checklist and the "95+"
   claim on the pricing sheet. Fix: an explicit icon map of the ~9 icons used.
3. **`/scrubber-test` is a dev route that ships to production.** It is
   `Disallow`ed in `robots.ts` and absent from the sitemap, so it will not be
   indexed, but it is still publicly reachable and built. Decide: delete before
   launch, or leave.
4. **`lib/reviews.ts` is referenced but does not exist.** `brand.config.ts`
   comments point at it for future Google Places ingestion. `googlePlaces.enabled`
   is `false`, so nothing is broken today.
5. **`NEXT_PUBLIC_SITE_URL` still defaults to `https://a2bautocentre.example.com`**
   (`lib/seo.ts:5`). Every canonical, the sitemap and the OG image inherit that
   placeholder until it is set in Vercel.

## 5 · Blocked on the client (not on us)

`docs/client_questions.md` holds 19 items. The ones that actually gate launch:

- **Bronze/Silver/Gold checklists** — currently industry-standard placeholders
- **Business structure** (sole trader vs Ltd) and, if Ltd, company number +
  registered office — legally required on the site
- **ICO registration number** — the quote form collects personal data, so they
  almost certainly must register (~£52/yr)
- **Review consent** from the three RAC reviewers (DMCC Act 2024)
- **Domain decision** — keep `a2bautocentre.com` or new
- **Geo coordinates** for the JSON-LD `geo` field
- Owner name(s) + bio for `/about` (there is a `TBD` comment at `app/about/page.tsx:54`)
- Google Place ID, logo vector, photography, social channels, booking-flow preference

## 6 · Form delivery — still a decision

`components/sections/QuoteContact.tsx` builds a `mailto:` URL and opens the
visitor's mail client, pre-filled to `a2bautocentre@gmail.com`. Zero backend, zero
cost, fine for a pitch demo. The pricing one-pager promises *"quote form delivered
straight to your inbox"*, which mailto does not really deliver — a visitor on a
phone without a configured mail app drops out. Upgrade before a paid launch:
Formspree (~5 min) or Resend + `app/api/quote/route.ts` (~10 min).

## 7 · Suggested next steps

1. Fix the three code issues above (OG image path, Lucide barrel import, decide on
   `/scrubber-test`) — all small, all inside the current scope.
2. Set `NEXT_PUBLIC_SITE_URL` and deploy to Vercel to get a real preview URL.
3. Work `sales/00-tomorrow-checklist.md` for the pitch.
4. Everything else waits on client answers.

## 8 · Note on the other "app readiness" thread

There was a separate session in **`Fox27ltd/fox27-system`** on branch
`claude/fox27-app-readiness-3befd1` (14–15 Aug 2026) — that repo holds
`fox27_pro.py`, the 9,796-line Streamlit "Fox27 Intelligence System v3.0" for
commercial catering engineering. **That branch no longer exists on GitHub**;
`fox27-system` has only `main`, last touched 23 Mar 2026 ("Security update — new
PINs, VAT fixes, Gas Safety simplified"). That session ran in a bridge environment
on the MacBook, so any uncommitted work from it is on that machine, not here. If
that is the thread to resume, the work needs recovering from the MacBook first.
