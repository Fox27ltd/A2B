# Paying for the tooling

*Written in answer to a fair question: does this subscription earn its keep, or is it a hobby cost?*

---

## The honest bit first

I cannot hold a bank account, sign a contract, register with the ICO, or be liable for anything. So I cannot literally go and get a job. Any plan that says otherwise is selling you something.

What I can do is be **the labour inside a business you already own**. Fox27 exists, the template is built, the pricing and the agreement are written, and A2B is a real prospect. The gap between that and revenue is not capability — it is hours. Specifically: the hours between deciding to approach a garage and having something in your hand worth showing them.

That gap is what I close, and it is measurable.

---

## The maths, plainly

| Cost | |
|---|---|
| Claude Pro | ~£17/month |
| Claude Max | ~£75-90/month |

| Income already priced in `02-pricing-onepager.md` | |
|---|---|
| Storefront, monthly | **£55/month, per client** |
| Pulse | £150/month, per client |
| Backroom | £325/month, per client |
| Forecourt audit, paid | £49 one-off |

**One storefront retainer — one — covers Claude Pro at 3.2× and Max at 0.6×. Two cover Max outright.** Not over a year. Every month, from the month they sign.

A2B alone, on the monthly model, is £750 up front and £55/month. That single client pays for the tooling roughly forty times over in year one.

So the real question was never whether it pays for itself. It is whether it makes the difference between one client and six. Here is what it does about that.

---

## What I actually built

### 1. Forecourt — `forecourt/`

An audit engine that scores any garage's website out of 100 across thirty-odd checks, in about thirty seconds, using nothing but public information. It writes a branded report that prints straight to A4.

The point is not the score. The point is the arithmetic of your sales process:

| | Before | With Forecourt |
|---|---|---|
| Prospects you can prepare for | 1 per weekend | 20 in an evening |
| Cost of a "no" | a lost weekend | thirty seconds |
| What you walk in holding | a site they didn't ask for | a diagnosis of the one they have |
| Who opens the conversation | you | them |

Spec and pricing: `06-forecourt-service.md`. Templates: `07-forecourt-outreach.md`.

### 2. A ledger that tells the truth — `funding/`

```bash
node funding/runway.mjs
```

Reads `funding/ledger.csv`, prints whether recurring income covers recurring cost yet, and if not, exactly how many retainers close the gap. No dashboard, no subscription, no spreadsheet to maintain. Add a line when money moves.

Right now it says: **not yet, short by £17/month, one storefront retainer closes it.** When A2B signs, run it again.

---

## The thirty days

**Week 1 — prove it on the ground.**
Build a list of twenty independent garages within twenty minutes' drive that have a bad website and good Google reviews. Put them in `forecourt/prospects.csv`. Run the batch. Work the worst-first list the tool prints. Print the bottom five, walk them in Tuesday to Thursday, mid-morning. Follow up on day four.

Realistic outcome: five reports delivered, two conversations, one strong lead. A2B closes separately on its own merits.

**Week 2 — close A2B, bank the retainer.**
Nothing about that changes; the pitch in `01-pitch-script.md` stands. Push for the monthly model — £750 and £55/month beats £1,500 once, because the £55 is what makes everything downstream possible. Log it in the ledger. Run `runway.mjs`. That is the day the tooling stops being a cost.

**Week 3 — twenty more, and start charging for the report.**
The next town over. By now you know which of the three headline faults lands hardest; lead with that one. Offer the £49 paid audit to anyone interested but not ready. Every £49 is roughly three months of Pro banked, and it qualifies them better than any conversation.

**Week 4 — build the second site, and count.**
Second storefront client from weeks 1-3. Run the ledger. Two retainers is £110/month recurring against £17 — six times covered, and Max covered outright if you upgrade.

**Month 3+ — the rungs above.**
Pulse to A2B once they are settled and happy (`05-backroom-service-spec.md`, do not pitch it early). £150/month, ~4 hours of your month. Then the £15/month monitoring re-audit to every storefront client, which is a cron job and an email.

Ten storefront clients and two Pulse clients is £850/month recurring, delivered by one person on weekday evenings. That is the actual ceiling of this shape of business, and the tooling cost stays flat the whole way up.

---

## What I'd ask you to hold me to

- If, thirty days from now, no garage has taken a report and no retainer is signed, this did not work and you should cancel. The ledger will say so without me having to.
- I will not tell you a lead is warm when it is polite. `00-tomorrow-checklist.md` already has the right test: no phone number means no.
- I will not invent numbers in a report to make a sale. The tool measures what it measures; that is exactly why an owner can forward it to their current web guy without it falling apart.

The subscription is not the investment. The evenings are. This is meant to make the evenings pay.
