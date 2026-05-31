# Fox27 garage-template — 1-hour client playbook

This is the production line. Follow the phases in order. With the template in place, a new client site ships in ~60 minutes of focused work + ~45 minutes of async asset generation (which you don't sit through).

> **Golden rule:** if you change anything outside `config/brand.config.ts`, `public/brand/`, `app/{about,mot}/page.tsx`, the OG generator, or the sitemap, you're forking the template — stop and ask why.

---

## 0 · Discovery call (15 min, day before)

One call, one form, done. Capture:

| Field | Why it matters |
|---|---|
| Legal name + trading name + tagline | Hero, OG, schema |
| Year established | About page, schema `foundingDate` |
| Full NAP (name / address / phone / postcode) | Hero, FindUs, schema, footer |
| Phone (display) + E.164 (`tel:` link) | All CTAs |
| Email | Quote form delivery |
| Opening hours (Mon-Sun) | Hours panel, schema `OpeningHoursSpecification` |
| Services offered + price-from (where known) | Services grid, schema `makesOffer` |
| Accreditations (RAC / Bosch / Trust My Garage / etc.) | Trust strip, hero overlay, schema `award` |
| 3-5 written reviews + sources | Hero overlay, /reviews, schema |
| Google Business Profile URL | Place ID for reviews API later |
| Geo coordinates (lat/lng) | Schema `geo` — improves local-search |
| Logo (SVG preferred) + 5-10 workshop photos | Brand assets |
| Domain status (have one / want one / transfer) | Vercel DNS step |
| Form delivery preference (mailto / Formspree / Resend) | Form wiring decision |
| Social channels | Footer / schema `sameAs` |

Stash answers in `docs/client_questions.md` and tick them off as you build.

---

## 1 · Spin up the project (5 min)

```bash
# From the template repo
gh repo create fox27/<client-slug>-site --private --clone --source=. --remote=upstream
cd <client-slug>-site
git switch -c main
rm -rf node_modules .next
git add -A && git commit -m "init: <Client> from Fox27 garage template v1"
```

If you keep the template as a private template repo on GitHub, "Use this template" gives you the same outcome in two clicks.

---

## 2 · Rebrand via `config/brand.config.ts` (15-20 min)

Open the file. Walk top to bottom. Replace every field. Specifically:

- `client.*` — name, tagline, yearEstablished, logo paths
- `contact.*` — phone (UK format AND E.164), email, full address, mapsQuery
- `hours[]` — set null/null for closed days
- `colors.*` — keep defaults unless logo demands otherwise; if it does, extract two values: dark base (`ink`) and accent
- `fonts.*` — only change if the brand requires it; the Inter / Space Grotesk / JetBrains Mono triple works for most automotive
- `trust[]` — 4 cells, keep them punchy (`RAC Approved`, `5-Star Reviews`, etc.)
- `servicing.tiers[]` — drop in their checklists verbatim; if no tiers, replace with whatever service structure they sell
- `repairs[]` — paste in their service list; each needs `id`, `name`, `summary`, `detail`, optional `priceFrom`, and a Lucide icon name (browse https://lucide.dev/icons — string keys map straight in)
- `offer.*` — featured promo, leave blank if none
- `reviews[]` — 3-5, real, with source
- `promise.*` — three pillars
- `seo.*` — siteTitle, siteDescription, keyword targets (think *MOT \<town\>*, *car service \<town\>*, *garage \<postcode\>*)

> If a section doesn't apply (no offer, no tiered servicing) **leave the data block empty and remove the section from `app/page.tsx`** — don't rewrite the component.

---

## 3 · Drop in assets (5 min)

```
public/
├── brand/
│   ├── logo.svg              ← client logo
│   ├── mark.svg              ← icon-only mark for nav (optional)
│   ├── favicon.ico
│   └── dashboard/            ← rename per client (e.g. /engine/, /workshop/)
│       └── frame-01..NN.webp
└── og/                       ← swap if you've made a custom OG
```

Run the WebP optimiser if hero frames are heavier than 100 KB each:

```bash
# From repo root
python3 scripts/optimise-frames.py public/brand/<sequence>/
```

(See script in §8 — add to the template if you haven't yet.)

---

## 4 · Audit pages (10 min)

Walk the sub-pages, prune what doesn't apply to this client.

| Page | Keep if… | Else… |
|---|---|---|
| `/servicing` | They tier or bundle servicing | Delete folder, remove from `Nav` |
| `/repairs` | They list distinct repair services | Merge into homepage section |
| `/mot` | They do MOTs (UK garages mostly do) | Delete folder, remove from `Nav` |
| `/about` | Always keep — rewrite the prose | Update copy + stats sidebar |
| `/contact` | Always keep | — |
| `/reviews` | They have ≥3 reviews | Delete folder, remove from `Nav` |

Remember to drop the matching entry from `components/sections/Nav.tsx` `links[]` and `app/sitemap.ts` `paths[]`.

---

## 5 · SEO pass (5 min)

- `app/sitemap.ts` — sync the routes array with what actually exists.
- `app/robots.ts` — leave default; only block staging-only routes.
- `app/opengraph-image.tsx` — the JSX is generic, but check the eyebrow line still reads true (accreditation + city + year).
- `lib/seo.ts` — `areaServed` array → set to nearby towns / postcodes the client targets.
- `app/layout.tsx` metadata — auto-reads from `brand.seo.*`, no edit usually needed.

---

## 6 · Decide form wiring (2-5 min)

- **Demo / cold pitch** → ship as-is. `mailto:` opens user's mail app pre-filled. No backend, zero cost, works.
- **Paid client, launch day** → wire Formspree (https://formspree.io — free tier, 5 min, paste the form action) **or** Resend + a Next route handler (`app/api/quote/route.ts`). Resend gives you a proper inbox API, ~10 min, and you can throw a confirmation email back to the customer.

Either way, update `client_questions.md` #11 to closed.

---

## 7 · QA before deploy (5 min)

Open the site at desktop + 375px mobile in two tabs. Walk this checklist:

- [ ] Hero scrub plays smoothly on first load — preloader hits 100%
- [ ] All `tel:` links open the dialer on mobile (`+44…` format)
- [ ] All `mailto:` links open mail
- [ ] Quote form opens mail with pre-filled subject + body
- [ ] Google Map loads and pins the right address
- [ ] "Get directions" opens Maps with the right destination
- [ ] Nav active state highlights the current page
- [ ] Mobile hamburger opens, links close it on tap
- [ ] All images have meaningful alt text
- [ ] `prefers-reduced-motion` honoured (toggle in DevTools → Rendering)
- [ ] `npm run typecheck` clean
- [ ] `/sitemap.xml` and `/robots.txt` return the right content
- [ ] `/opengraph-image` renders the branded card
- [ ] Lighthouse mobile: ≥90 Performance, ≥100 SEO, ≥95 Accessibility

---

## 8 · Deploy (5 min)

```bash
git add -A
git commit -m "feat: <Client> production-ready"
git push -u origin main
```

Vercel: **Import Project → pick repo → set `NEXT_PUBLIC_SITE_URL` env to the prod domain → Deploy**.

DNS: at the registrar, point apex + `www` at Vercel. Wait for SSL.

Final live-site smoke test:
- Pull up Rich Results Test with the live URL — confirm AutoRepair + BreadcrumbList parse.
- Share the OG URL in Slack / WhatsApp — confirm the card preview.
- Submit `sitemap.xml` to Google Search Console.

---

## Time budget reality-check

| Phase | Target |
|---|---|
| Discovery (async, day -1) | 15 min |
| Spin up | 5 min |
| brand.config rewrite | 20 min |
| Asset swap | 5 min |
| Page audit | 10 min |
| SEO pass | 5 min |
| Form wiring decision | 5 min |
| QA | 5 min |
| Deploy | 5 min |
| **Hands-on total** | **~60 min** |

Asset generation (hero frames if you do custom renders per client, photo retouching) runs async in parallel — don't count it against the hour.

---

## When the template doesn't fit

The template is opinionated for **independent automotive shops**. If a client is in an adjacent vertical (locksmith, plumber, tyres-only, valeting), 80% transfers cleanly — the sections that don't (e.g. MOT page for a non-garage) just get deleted. If a client wants e-commerce, booking calendar, or member areas, that's a fork — not an hour, two days minimum. Quote accordingly.

---

## Versioning the template

Every file starts with `// vX.Y — purpose` comment. When you change template defaults (not client-specific copy), bump that version and note the change in `docs/CHANGELOG.md`. Client repos pin against template versions in their commit log — makes it obvious when a client site is drifting behind.
