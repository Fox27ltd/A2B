# A2B Autocentre — Fox27 agency template

Built on the Fox27 garage-template stack:
- Next.js 14 App Router · TypeScript · Tailwind
- Framer Motion · Lucide icons · shadcn-style primitives
- HTML Canvas hero via `useScrollScrubber`
- Single `config/brand.config.ts` per client

## Dev

```bash
npm install
npm run dev
```

## Per-client retheme

Swap the contents of `config/brand.config.ts`. Drop logo + frames into `public/brand/` and `public/frames/engine/`. See `docs/WORKFLOW.md` (added in Phase 8).

## Fox27 tooling

Two zero-dependency Node tools live alongside the site. Neither needs `npm install`.

### Forecourt — `forecourt/`

Local-visibility audits for garage websites. Scores any site out of 100 on public
information alone and writes a branded report that prints to A4. It is the lead
engine: twenty prospects in an evening instead of one per weekend.

```bash
npm run audit -- --url theirgarage.co.uk --name "Their Garage" --town Rainham
npm run audit -- --batch forecourt/prospects.csv
```

See `forecourt/README.md`, and `sales/06-forecourt-service.md` for pricing and the
outreach rules (read the legal section before emailing anyone).

### Runway — `funding/`

Whether the tooling pays for itself yet, calculated from `funding/ledger.csv`.

```bash
npm run runway
```

See `sales/08-self-funding-plan.md`.
