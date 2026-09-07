# Forecourt — the audit product

*The lead engine. Also the thing that pays for the tooling before a single site is sold.*

---

## The problem this solves

The template works. `docs/WORKFLOW.md` says a new client site ships in about an hour. So building sites is not the bottleneck — **finding garages who want one is.**

Right now the sales process is: pick a garage, spend a weekend mocking up their site for free, walk in, hope. That is one prospect per weekend, and the whole investment is gone if they say no.

Forecourt inverts it. Instead of building a site on spec, you generate a **diagnostic report** on their existing site — in about thirty seconds, from public information only — and lead with what is broken. Twenty of those is an evening's work.

A garage owner will not read a pitch. They will read a report that says their site is scoring 31 out of 100 while the garage two miles away scores 74.

---

## What it is

```bash
node forecourt/run.mjs --url theirgarage.co.uk --name "Their Garage" --town Rainham
```

Thirty seconds later: a branded HTML report, dark Fox27 styling, prints clean to A4. Thirty-odd checks across three pillars a garage owner actually understands:

| Pillar | The question it answers |
|---|---|
| **Found** | Can Google put you in front of someone searching "MOT Rainham" right now? |
| **Trusted** | Does the person who lands on the page believe you enough to call? |
| **Fast** | Does the page load before they give up — on a phone, on 4G? |

Page one is a score dial, three pillar bars, and **the three things costing you the most** — ranked by lost business, not by technical severity. Each one written in plain English with a one-line fix.

Add `--rival theothergarage.co.uk` and it audits the competition too and puts them on a bar chart next to each other. That comparison is the part that gets a reply.

### What it never does

- No login, no credentials, no access to their hosting, their analytics, or their Google profile.
- Nothing a customer with a browser could not see: their homepage, their robots.txt, their sitemap, and the size of the files their page loads.
- It does not fabricate numbers. Every claim in the report traces to something measured, and the report footer says exactly how and when it was measured.

That constraint is deliberate. It is what makes it legal to run on a stranger's business unasked, and it is what makes it defensible when the owner emails it to their current web guy — which they will.

---

## Three ways it makes money

### 1. Free — the door-opener *(this is the main one)*

Replaces "I spent the weekend mocking up your site." Now it is:

> "I ran your website through a check I use — you're scoring 31 out of 100. Bloggs down the road is on 74. Want the report? No charge, no catch."

Costs you nothing to produce and it is genuinely useful even if they never buy. Every audit that does not convert is still a garage that knows your name.

**Conversion path:** audit → they read it → they ask what it would cost to fix → that is the existing pitch in `01-pitch-script.md`, except now they opened the conversation.

### 2. Paid — £49 one-off / £99 with a call

Some owners want the report but are not ready to talk about a rebuild. Sell it as a standalone:

- **£49** — the report, emailed as a PDF.
- **£99** — the report plus a 20-minute call walking through it, and a prioritised fix list they can hand to whoever currently maintains the site.

This is deliberately priced to be an easy yes and deliberately not priced as consultancy. It exists to **cover the tooling** and to qualify: a garage that pays £49 to understand their website is a garage that will pay £1,500 to have one built.

Credit the £49 against the build if they go ahead within 30 days. Say so up front — it removes the only objection.

### 3. Recurring — £15/month monitoring *(month three, not now)*

Storefront monthly clients get the audit re-run monthly, and an email only when something breaks: certificate expired, site down, page weight crept up, someone deleted the phone number. For non-clients, £15/month standalone.

Do not build this until you have five storefront clients. It is a cron job and an email; the value is entirely in already having the relationship.

---

## Unit economics

Per audit, the marginal cost is a few pennies of tokens and about thirty seconds of network time. There is no per-client hosting, no seat, no licence.

| | Monthly recurring | Covers Claude Pro (~£17/mo) | Covers Claude Max (~£90/mo) |
|---|---|---|---|
| 1 paid audit (£49, one-off) | — | ~3 months banked | ~½ month banked |
| 1 storefront retainer | £55 | 3.2× over | 0.6× |
| 2 storefront retainers | £110 | 6.5× | 1.2× |
| 1 Pulse client | £150 | 8.8× | 1.7× |
| 3 storefront + 1 Pulse | £315 | 18× | 3.5× |

**The honest headline: one signed storefront retainer covers the tooling forever, at 3× margin.** The audit tool is not what pays the bill — it is what makes the first retainer happen in a fortnight instead of a quarter, and the second one without another lost weekend.

Track it for real:

```bash
node funding/runway.mjs
```

That reads `funding/ledger.csv` and tells you plainly whether the tooling is paying for itself yet, and exactly how many retainers close the gap if not. Add a line every time money moves.

---

## Outreach: what is actually legal

**Read this before you email anybody.** Practical guidance, not legal advice — the ICO's own pages at ico.org.uk are the authority, and they are readable.

The relevant law is **PECR** (the Privacy and Electronic Communications Regulations) for how you make contact, and **UK GDPR** for what you do with the details afterwards.

### Email

PECR splits recipients into two groups, and garages fall on both sides of the line:

- **Limited companies and LLPs** are "corporate subscribers". You may send unsolicited B2B marketing email, provided you identify yourself clearly and give a working way to opt out. They can still object under UK GDPR, and you must honour it.
- **Sole traders and ordinary partnerships** are treated as individual subscribers. You need consent or the soft opt-in. **Cold-emailing them is not allowed.** A great many independent garages are sole traders.

So: **check Companies House before you email.** It is free, it takes ten seconds, and it decides whether that email is marketing or a fine. If they are not a limited company, use one of the routes below instead.

### Phone

Screen the number against the **TPS** and **CTPS** registers before you call. Calling a registered number without consent is the thing that generates complaints. Registration is a paid service; budget for it before you start calling at volume.

### Post and in person

Neither is covered by PECR. Posting an audit, or walking one in, is governed by UK GDPR only — a legitimate-interests basis with a clear opt-out on the document. **This is the safest and, for a local garage, the most effective route anyway.** An A4 report handed across the counter outperforms an email in a spam folder every time.

### Whatever the route

- Say who you are and how to make you stop, on every single piece.
- Keep `forecourt/suppression.csv` and check it before every send. One line, permanently, no exceptions, no "just one more".
- Low volume, high relevance, local. Twenty well-chosen garages beats two thousand scraped addresses — commercially as well as legally.
- Never claim their site is "hacked", "penalised by Google", or "about to be delisted" unless you have measured it and it is true. It usually is not. The report is credible precisely because it does not do this.

---

## Where this sits next to the rest of the ladder

```
Forecourt audit      free / £49     the way in
   ↓
Storefront           £1,500 or £750 + £55/mo    the build
   ↓
Pulse                £150/mo        the Monday brief (05-backroom-service-spec.md)
   ↓
Backroom             £325/mo        Pulse + chasing + margin review
```

Every rung sells the next one, and every rung is delivered by the same person on the same evening. Forecourt is the rung that was missing at the bottom.

---

## Running it

```bash
# one garage
node forecourt/run.mjs --url theirgarage.co.uk --name "Their Garage" --town Rainham

# with the competition alongside
node forecourt/run.mjs --url theirgarage.co.uk --town Rainham \
  --rival rivalgarage.co.uk --rival othergarage.co.uk

# a whole town in one go
node forecourt/run.mjs --batch forecourt/prospects.csv
```

Batch mode prints a worst-first list at the end. That list is your call sheet — the garage at the bottom has the most to gain and the least to defend.

To turn a report into a PDF: open the HTML, print, save as PDF. A4, margins already set.
