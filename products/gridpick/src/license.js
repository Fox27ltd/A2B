// Gridpick — the free/Pro gate.
//
// Deliberately thin. ExtensionPay (extensionpay.com) handles Stripe, checkout,
// subscription state and the customer portal; this file is the only place that
// knows about it, so swapping to Lemon Squeezy or Paddle later touches one file.
//
// Until extpay.js is dropped in and EXTPAY_ID is set, everything runs in free
// mode, which is a complete, useful product on its own.

const EXTPAY_ID = ""; // <- your extensionpay.com extension id. See SETUP.md.

const FREE = {
  tables: true,          // real <table> elements
  formats: ["csv"],
  lists: false,          // product grids, search results, any repeated structure
  pick: false,           // click-to-pick
  multiPage: false,
  maxRows: 100,
};

const PRO = {
  tables: true,
  formats: ["csv", "tsv", "json", "markdown"],
  lists: true,
  pick: true,
  multiPage: true,
  maxRows: Infinity,
};

let extpay = null;

function client() {
  if (extpay) return extpay;
  if (!EXTPAY_ID || typeof ExtPay !== "function") return null;
  extpay = ExtPay(EXTPAY_ID);
  return extpay;
}

// Cache the answer so a dropped network doesn't lock a paying customer out of
// the thing they paid for.
async function isPro() {
  const c = client();
  if (!c) return false;
  try {
    const user = await c.getUser();
    const paid = !!user.paid || (user.paidAt && !user.subscriptionCancelledAt);
    await chrome.storage.local.set({ proCache: { paid: !!paid, at: Date.now() } });
    return !!paid;
  } catch {
    const { proCache } = await chrome.storage.local.get("proCache");
    // Trust a cached "paid" for a week offline; never cache a "not paid".
    if (proCache && proCache.paid && Date.now() - proCache.at < 7 * 864e5) return true;
    return false;
  }
}

async function limits() {
  return (await isPro()) ? PRO : FREE;
}

function openCheckout() {
  const c = client();
  if (c) return c.openPaymentPage();
  return chrome.tabs.create({ url: "https://extensionpay.com" });
}

function configured() {
  return !!EXTPAY_ID && typeof ExtPay === "function";
}

if (typeof globalThis !== "undefined") {
  globalThis.GridpickLicense = { isPro, limits, openCheckout, configured, FREE, PRO };
}
