# Making the tooling pay for itself

## Your prompt, reworded

You asked me to sharpen your prompt before acting on it. Here it is — the version that gets the most out of a session like this one, with the impossible parts removed and the useful constraints made explicit:

> Assume you cannot legally receive money, cannot run unattended, and do not persist between sessions. Under those constraints, design and build the highest-expected-value asset I can own outright.
>
> It must: (a) need one setup session from me and nothing after, (b) have near-zero marginal cost per customer, (c) get its distribution free from a marketplace people already search, (d) deliver and bill itself with no human in the loop, and (e) be complete and shippable when you finish, not a plan.
>
> Prefer ideas where the code *is* the product. Rule out anything needing ad spend, cold outreach, or ongoing fulfilment by me. Before building, give me the ranked shortlist you considered and the honest odds on each. Then build the top pick to completion, tested, and finish with a numbered setup checklist under an hour.

The changes that matter: **"minimum human input" became "one setup session, then zero"**, because zero-total is not reachable and pretending otherwise wastes your evening. **"Quick cash flip"** became *near-zero marginal cost and marketplace distribution*, because those are the properties that actually make money arrive without you working. And it now demands honest odds up front, so you can kill the idea before you spend the £4 rather than after.

---

## The part I can't do, stated once

To receive money you need a bank account, a payment processor, and a tax identity. All three require government ID and a liable human. I have none and cannot get them. I also don't run when you're not talking to me — this container is wiped after the session ends, so there is no version of me quietly selling things overnight.

So the floor on your involvement is **one setup session: about an hour, mostly waiting on identity checks.** I can get you to that floor and no lower. Everything below is built to make that hour worth it.

Related, and worth saying because it solves your actual stated problem faster than any of this: if you're on the Max plan, dropping to Pro cuts the bill by roughly 80% and you keep coding. That's a five-minute fix. The rest of this is for making the bill irrelevant rather than smaller.

---

## What I considered, and the odds

Ranked by expected value per hour of *your* time, which is the only currency you said you're short of.

| Idea | Why it might work | Why it might not | Verdict |
|---|---|---|---|
| **Chrome extension, paid tier** | Web Store is free distribution with genuine search intent. Billing via ExtensionPay is ~10 lines. Zero marginal cost. Ships in one session. | Discovery is slow and competitive; most extensions earn nothing. | **Built it.** Best odds-to-effort ratio available. |
| Paid API on a marketplace | Marketplace supplies both billing and discovery | Marketplace traffic has thinned; developers are the cheapest buyers alive | Second |
| Digital template / boilerplate sale | You can already build these fast | Gumroad has no traffic of its own; needs an audience you don't have | Only viable on a marketplace with buyer traffic |
| Programmatic SEO site + affiliate | Genuinely passive once ranked | Six months to rank, and ad networks need traffic before they'll approve you | Too slow for the problem |
| Freelance/agency work | Highest and fastest revenue by a wide margin | Requires exactly the thing you ruled out — talking to people | Ruled out by your constraints |

Two honest notes on that table. **Freelancing is objectively the highest-earning option** and I've ranked it last only because you excluded it; if you ever change your mind, it beats everything above it by an order of magnitude. And **every option here is a lottery ticket** — the difference between them is the price of the ticket, and a Chrome extension is the cheapest one that's still worth owning.

---

## What I built: Gridpick

A Chrome extension that turns any table, product grid or search-results list into CSV, Excel, JSON or Markdown. Full source in `products/gridpick/`, setup in `products/gridpick/SETUP.md`.

**The commercial idea in one line:** free tools handle `<table>`; almost nothing free handles the other 90% of the web, because product grids and search results are `<div>`s and reading them means *inferring* structure rather than parsing it. That inference is the paid tier.

- **Free** — every real table on the page, exported to CSV. Deliberately a complete, useful product: it exists to earn installs and reviews, which is the only distribution this has.
- **Pro (~£4/mo or £29 once)** — grids and lists that aren't tables, click-to-point extraction, Excel/JSON/Markdown, and following "next page" links to collect a whole paginated list into one file.

It is finished, not scaffolded: 15 detection tests pass against real markup in headless Chromium, the popup is built and rendered, icons are generated, and the store listing, permission justifications, data-disclosure answers and privacy policy are all written. Load it unpacked and it works right now.

**Break-even is two Pro subscribers for Claude Pro, or about twenty for Max.**

---

## What I'd hold myself to

- If it earns nothing in 90 days, it cost you £4 and one evening, and you own a working product either way. That's the whole downside.
- I have not told you this will work. I've told you it's the cheapest ticket with a real prize, and I've written down the odds so you can hold me to them.
- The one thing that reliably makes this fail is publishing it and never reading the reviews. The first three reviews decide the next hundred installs.
