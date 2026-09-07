# Forecourt

Local-visibility audits for independent garages. Zero dependencies, public data only, about thirty seconds per site.

Why it exists and how to sell it: `sales/06-forecourt-service.md`.

## Run it

```bash
# one garage
node forecourt/run.mjs --url theirgarage.co.uk --name "Their Garage" --town Rainham

# against the competition
node forecourt/run.mjs --url theirgarage.co.uk --town Rainham --rival rivalgarage.co.uk

# a list
cp forecourt/prospects.example.csv forecourt/prospects.csv   # then edit it
node forecourt/run.mjs --batch forecourt/prospects.csv
```

Or via npm: `npm run audit -- --url theirgarage.co.uk --town Rainham`

Reports land in `forecourt/out/` as `<slug>.html` (the deliverable) and `<slug>.json` (the raw findings). Open the HTML, print, save as PDF — A4 margins are already set.

`--town` matters. Several of the highest-weighted checks ask whether the site tells Google what town it serves, and they are skipped without it.

## What it checks

Thirty-odd checks in three pillars, weighted by commercial impact for a garage rather than by technical severity:

- **Found** (40%) — HTTPS, title, town in the title, meta description, H1, AutoRepair/LocalBusiness structured data, geo coordinates, canonical, robots, sitemap, share card, service words, town in the body copy.
- **Trusted** (35%) — tap-to-call, visible phone, enquiry form, address and postcode, map, opening hours, reviews, accreditations, published prices.
- **Fast** (25%) — mobile viewport, total page weight, server response time, image sizes and formats, alt text, render-blocking scripts, mixed content, favicon.

Score is a weighted mean of the pillars; grade A-F. The report leads with the three highest-weighted failures.

## What it will not do

- No credentials, no logins, no access to hosting, analytics or Google Business profiles.
- Nothing a customer with a browser could not see: the homepage, `robots.txt`, `sitemap.xml`, and the size of up to 40 files the page loads.
- No invented numbers. Every claim traces to something measured, and the report footer states the method and the date.

It sends a self-identifying user agent, honours a blanket `robots.txt` disallow by skipping the asset crawl, and makes roughly 45 requests per site. Do not point it at a list of thousands — see the outreach rules in `sales/06-forecourt-service.md`.

## Files

| | |
|---|---|
| `audit.mjs` | the checks and the scoring |
| `report.mjs` | audit JSON → single-file branded HTML |
| `run.mjs` | CLI, single and batch |
| `prospects.example.csv` | batch input format |
| `suppression.csv` | anyone who said no. Check it before every send. |
