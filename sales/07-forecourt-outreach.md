# Forecourt — outreach templates

*Use with `06-forecourt-service.md`. Check the legal section there before you send anything.*

The rule underneath all of these: **you have already done the work.** You are not asking for their time, you are handing them something. That is the whole reason this converts and a cold pitch does not.

---

## Route A — walk it in (best conversion, always legal)

Print the report. Two pages, stapled, no folder. Mid-morning, Tuesday to Thursday, per `00-tomorrow-checklist.md`.

> "Morning — I'm Callum, I build websites for garages round here. I ran yours through a check I use, it's on my laptop anyway. You're scoring 41 out of 100. Not a sales thing, you can have it either way — but there's three things on there costing you calls that'd take me an afternoon. Want me to leave it with you?"

Leave it. Do not pitch. Do not stand there while they read it.

**Then:** note the date. Come back or ring in **four working days** — long enough that they have read it, short enough that it is still on the counter.

> "Callum — dropped the website report in Tuesday. Any of it make sense? Happy to go through it, no charge either way."

Most conversions happen on this second contact, not the first.

---

## Route B — post it (legal for everyone, slower)

An A4 report in an envelope, hand-addressed, second class. Costs under a pound.

Cover note, handwritten if your writing is legible:

> Hi — I build websites for independent garages in the area. I ran yours through the check I use on my own clients' sites; the report's attached, no charge and nothing owed.
>
> The three things on page one are the ones actually costing you enquiries. If you want them fixed, that's what I do — but the report's yours regardless.
>
> Callum, Fox27 — [phone] — callumcorrigan27@gmail.com
>
> *Don't want anything else from me? Text NO to [phone] and you're off my list for good.*

That last line is not optional and it is not weakness. It is the opt-out, and it is why nobody complains.

---

## Route C — email *(limited companies only — check Companies House first)*

**Subject:** `[Garage name] — your website scores 41/100, here's why`

> Hi [name],
>
> I build websites for independent garages. I ran [garagename.co.uk] through the check I use on my own clients — it came back at 41 out of 100. Report attached, no charge.
>
> The short version:
>
> - No mobile viewport, so on a phone it loads as a shrunk-down desktop page
> - The phone number isn't tappable — customers have to memorise it and dial by hand
> - "[Town]" doesn't appear in your page title, which is the single biggest factor in "MOT [town]" searches
>
> [Rival Garage] two miles away scores 74 on the same checks. That gap is showing up in who gets the call.
>
> Fixing all three is an afternoon's work. If you want it done I build these for garages — £1,500 outright, or £750 and £55 a month with the hosting and updates looked after. If you'd rather hand the report to whoever built the site, that's genuinely fine, it's yours.
>
> Callum Corrigan
> Fox27 — [phone] — callumcorrigan27@gmail.com
>
> *Reply STOP and I won't contact you again.*

Three specifics from the real report, one comparison, one price, one opt-out. Never more.

**One follow-up only.** Five working days later:

> Hi [name] — did the website report land? No follow-up after this one either way. Callum

Then they go in `forecourt/suppression.csv`. No third email, ever.

---

## Route D — the paid audit *(for the ones who won't commit to a rebuild)*

When they are interested but not ready:

> "Tell you what — the full thing's £49. Report, and I'll spend twenty minutes on the phone walking you through it so you know what's worth fixing and what isn't. Whoever does the work after that is up to you. And if you do end up having me build it, the £49 comes off."

Why this works: it converts a "no" into £49 and a scheduled call. Half of those calls become builds. The other half paid for the month.

---

## Route E — the annual re-audit *(existing clients, month 12)*

Every storefront client, on their anniversary. Costs you thirty seconds.

> "Ran your site through the check again — you're on 94, same as launch day. Everything's still tight. Nothing needed, just so you know somebody's watching it."

Nobody cancels a retainer the week they got proof it is working. Put a calendar reminder in on the day they go live.

---

## Choosing who to audit

Twenty good targets, not two hundred scraped ones. What makes a good one:

- **Independent, single site.** Chains have a marketing department and no budget authority at the counter.
- **A website that exists and is bad.** No website at all is a harder sell — nothing to compare against, no loss to feel. A bad site is a wound they already suspect.
- **Within 20 minutes' drive.** You want to be able to walk it in and go back on day four.
- **RAC / Trust My Garage / Good Garage Scheme members.** They already pay for credibility signals, so they already believe in the category.
- **Good Google reviews, bad website.** The strongest signal there is. The business is working; the website is the only part letting it down. That is an easy, honest thing to say out loud.

Build the list in `forecourt/prospects.csv`, run it as a batch, and work the worst-first list the tool prints.

---

## The discipline

- One line in `forecourt/suppression.csv` the moment anyone says no. Check it before every send.
- Never say "hacked", "penalised" or "delisted" unless you measured it and it is true.
- Never send a report you have not opened and read yourself. The tool is good; it is not accountable. You are.
- If the site is genuinely fine, say so and move on. "I ran yours, it's actually solid, nothing for me to sell you" buys more goodwill in a trade this small than any pitch — and garage owners talk to each other.
