# Setup — one session, then it runs itself

Everything below is a one-time job. There is nothing to run afterwards, nothing to host, and no server to keep alive. The extension is a folder of files that Google serves for you.

**Realistic time: 50–70 minutes, plus a wait for review.** The two accounts are the only part I cannot do for you — both require photo ID and bank details, which is exactly the wall that stops me doing this unattended.

---

## Before you start

Try it first, so you know what you're publishing. Two minutes:

1. Chrome → `chrome://extensions`
2. Turn on **Developer mode** (top right)
3. **Load unpacked** → select `products/gridpick`
4. Go to any page with a table or a product grid, click the Gridpick icon

It works fully in free mode right now. Pro features are gated but the gate is honest — nothing is faked.

---

## 1 · Chrome Web Store developer account — 15 min, £4

- Go to https://chrome.google.com/webstore/devconsole
- Sign in with the Google account you want to own this forever. **Not** one you might lose.
- Pay the one-off $5 (about £4) registration fee.
- Fill in the publisher details. You can publish under your own name; a trading name needs verification.

## 2 · ExtensionPay account — 15 min, free until you sell

ExtensionPay handles Stripe, the checkout page, subscriptions and refunds. It takes a small cut per sale and charges nothing up front.

- Register at https://extensionpay.com
- Create an extension, note the **extension ID** it gives you (a short slug, not the Chrome one).
- Connect your Stripe account. This is the KYC step: photo ID and bank details. Budget 10 minutes.
- Set the price. **Suggested: £4/month, or £29 one-off.** Offer both — roughly a third of buyers prefer to own it.

Then wire it in — two edits:

```bash
# 1. download extpay.js into src/
#    https://github.com/Glench/ExtPay  ->  dist/ExtPay.js  ->  save as src/extpay.js

# 2. set your id
#    src/license.js, line 10:
const EXTPAY_ID = "your-extension-id-here";
```

And add it to `manifest.json` so the popup and worker can see it:

```json
"background": { "service_worker": "src/background.js" },
```
becomes
```json
"background": { "service_worker": "src/background.js" },
"content_security_policy": { "extension_pages": "script-src 'self'; object-src 'self'" },
```
then in `src/popup.html`, add `<script src="extpay.js"></script>` **above** `license.js`,
and in `src/background.js` change the first line to:
```js
importScripts("extpay.js", "license.js");
```

Reload the unpacked extension. The badge should now say Free and clicking it should open your real checkout page.

## 3 · Host the privacy policy — 5 min, free

Chrome requires a public URL. The fastest free option:

- Go to https://gist.github.com
- Paste `store/privacy-policy.md`, name it `gridpick-privacy.md`, create a **public** gist
- Copy the URL

## 4 · Screenshots — 10 min

The store wants at least one 1280×800 image; five is better. Easiest honest way:

- Load the extension, open a real page with a good product grid
- Screenshot the popup open over the page, at 1280×800
- Captions are already written in `store/listing.md`

## 5 · Package and submit — 15 min

```bash
cd products/gridpick
zip -r ../gridpick-1.0.0.zip . -x "test/*" "store/*" "*.md" "icons/make-icons.py" "icons/icon.svg" ".*"
```

In the developer console: **New item** → upload the zip → fill the listing from `store/listing.md`. Every field it asks for is already written there, including the permission justifications and the data-disclosure answers, which are the two places submissions usually get bounced.

Set visibility to **Public**, then **Submit for review**.

**Review takes 1–5 working days**, sometimes longer for a first submission from a new account. Extensions that request few permissions — like this one — clear faster.

---

## After that

Nothing. No server, no renewal, no maintenance. Google hosts it, ExtensionPay bills it, Stripe pays you.

Worth doing once a month, ten minutes:

- Read the reviews. The first three reviews decide the next hundred installs.
- If people ask for a site that doesn't extract properly, send me the URL and I'll fix the detector.

---

## What to expect, honestly

Nobody can promise you numbers on this. What is true:

- The store gives you free distribution, but discovery is competitive and slow to start.
- Most extensions earn nothing. The ones that earn do it because they answer a search someone types with a problem in mind — which is why the listing leads with "table to csv" rather than the product name.
- Realistic good case in month one is a few pounds. The realistic *purpose* of month one is reviews and install count, which is what makes month six possible.
- The cost of finding out is £4 and one evening.

If it earns nothing after 90 days, it cost you a fiver and you own a working product. Delete it or hand it to someone else.
