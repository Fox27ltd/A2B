// Forecourt — local-visibility audit engine for independent garages.
//
// Public data only. No credentials, no client accounts, no scraping of anything
// a customer with a browser couldn't see. One homepage fetch, robots.txt, and a
// capped sample of linked assets to weigh the page.
//
// Zero dependencies on purpose: this has to run on Callum's laptop with nothing
// installed but Node.

const DEFAULTS = {
  timeoutMs: 15000,
  maxAssets: 40,
  concurrency: 6,
  userAgent:
    "Fox27ForecourtAudit/1.0 (+local garage web audit; contact callumcorrigan27@gmail.com)",
};

// ---------- weights ----------
// Pillar weight = how much of the overall grade it carries.
const PILLAR_WEIGHT = { found: 0.4, trusted: 0.35, fast: 0.25 };
const PILLAR_LABEL = {
  found: "Found",
  trusted: "Trusted",
  fast: "Fast",
};
const PILLAR_BLURB = {
  found: "Whether Google can put you in front of someone searching right now.",
  trusted: "Whether the person who lands on the page believes you and calls.",
  fast: "Whether the page loads before they give up — on a phone, on 4G.",
};

const SCORE_OF = { pass: 1, warn: 0.5, fail: 0, info: null, skip: null };

// ---------- small helpers ----------

const stripTags = (html) =>
  html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();

const attr = (tag, name) => {
  const m = tag.match(
    new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i")
  );
  if (!m) return null;
  return (m[2] ?? m[3] ?? m[4] ?? "").trim();
};

const tagsOf = (html, tagName) =>
  html.match(new RegExp(`<${tagName}\\b[^>]*>`, "gi")) || [];

const metaContent = (html, key, kind = "name") => {
  for (const tag of tagsOf(html, "meta")) {
    const k = attr(tag, kind);
    if (k && k.toLowerCase() === key.toLowerCase()) return attr(tag, "content");
  }
  return null;
};

const bytesHuman = (n) => {
  if (n == null) return "unknown";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
};

function normaliseUrl(input) {
  let u = String(input || "").trim();
  if (!u) throw new Error("No URL given");
  if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
  const parsed = new URL(u);
  if (!parsed.pathname) parsed.pathname = "/";
  return parsed;
}

async function timedFetch(url, opts = {}, cfg = DEFAULTS) {
  const started = Date.now();
  const controller = AbortSignal.timeout(cfg.timeoutMs);
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: controller,
      headers: { "user-agent": cfg.userAgent, accept: "*/*", ...(opts.headers || {}) },
      method: opts.method || "GET",
    });
    return { res, ms: Date.now() - started, error: null };
  } catch (err) {
    return { res: null, ms: Date.now() - started, error: err.message || String(err) };
  }
}

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const i = cursor++;
      out[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return out;
}

// ---------- robots ----------

async function readRobots(origin, cfg) {
  const { res, error } = await timedFetch(`${origin}/robots.txt`, {}, cfg);
  if (error || !res || !res.ok) return { present: false, body: "", blocksUs: false };
  const body = await res.text();
  // Only care about a blanket disallow that would cover the homepage.
  const groups = body.split(/^user-agent:/gim).slice(1);
  let blocksUs = false;
  for (const g of groups) {
    const [agentLine, ...rest] = g.split("\n");
    const agent = agentLine.trim().toLowerCase();
    if (agent !== "*" && !agent.includes("forecourt")) continue;
    for (const line of rest) {
      const m = line.match(/^\s*disallow:\s*(\S*)\s*$/i);
      if (m && (m[1] === "/" || m[1] === "")) blocksUs = m[1] === "/";
    }
  }
  return { present: true, body, blocksUs };
}

// ---------- asset weighing ----------

function collectAssets(html, baseUrl, max) {
  const urls = new Map(); // url -> kind
  const add = (raw, kind) => {
    if (!raw) return;
    if (/^(data:|mailto:|tel:|javascript:|#)/i.test(raw)) return;
    try {
      const abs = new URL(raw, baseUrl).toString().split("#")[0];
      if (!/^https?:/i.test(abs)) return;
      if (!urls.has(abs)) urls.set(abs, kind);
    } catch {
      /* unparseable href, skip */
    }
  };

  for (const tag of tagsOf(html, "link")) {
    const rel = (attr(tag, "rel") || "").toLowerCase();
    if (rel.includes("stylesheet")) add(attr(tag, "href"), "css");
  }
  for (const tag of tagsOf(html, "script")) add(attr(tag, "src"), "js");
  for (const tag of tagsOf(html, "img")) {
    add(attr(tag, "src"), "img");
    const srcset = attr(tag, "srcset");
    if (srcset) add(srcset.split(",")[0].trim().split(/\s+/)[0], "img");
  }
  for (const tag of tagsOf(html, "source")) add(attr(tag, "src"), "media");
  for (const tag of tagsOf(html, "video")) add(attr(tag, "src"), "media");

  return [...urls.entries()].slice(0, max).map(([url, kind]) => ({ url, kind }));
}

async function weighAssets(assets, cfg) {
  return mapLimit(assets, cfg.concurrency, async (asset) => {
    let { res, error } = await timedFetch(asset.url, { method: "HEAD" }, cfg);
    let bytes = null;
    if (res && res.ok) {
      const len = res.headers.get("content-length");
      if (len) bytes = Number(len);
    }
    if (bytes == null) {
      // Some servers lie about HEAD. Fall back to a capped GET.
      const got = await timedFetch(asset.url, {}, cfg);
      if (got.res && got.res.ok) {
        try {
          const buf = await got.res.arrayBuffer();
          bytes = buf.byteLength;
        } catch {
          bytes = null;
        }
      }
      error = got.error;
    }
    return { ...asset, bytes, error };
  });
}

// ---------- the checks ----------

function runChecks(ctx) {
  const c = [];
  const push = (pillar, id, label, weight, status, detail, fix) =>
    c.push({ pillar, id, label, weight, status, detail, fix });

  const {
    html,
    text,
    finalUrl,
    startUrl,
    headers,
    ttfbMs,
    htmlBytes,
    assets,
    robots,
    town,
    httpRedirects,
  } = ctx;

  const lower = text.toLowerCase();
  const htmlLower = html.toLowerCase();
  const townLower = (town || "").toLowerCase();

  // ===== FOUND =====

  const isHttps = finalUrl.protocol === "https:";
  push(
    "found",
    "https",
    "Secure connection (HTTPS)",
    10,
    isHttps ? "pass" : "fail",
    isHttps
      ? "The site is served over HTTPS."
      : "The site is served over plain HTTP. Chrome shows a 'Not secure' warning in the address bar.",
    "Install an SSL certificate. It is free via Let's Encrypt and included with any modern host."
  );

  if (isHttps) {
    push(
      "found",
      "http-redirect",
      "http:// visitors get sent to https://",
      3,
      httpRedirects === true ? "pass" : httpRedirects === false ? "warn" : "info",
      httpRedirects === true
        ? "Typing the address without https:// still lands on the secure version."
        : httpRedirects === false
        ? "The insecure http:// address serves its own copy of the site instead of redirecting. Google treats that as a duplicate."
        : "Could not test the http:// version.",
      "Add a permanent (301) redirect from http:// to https:// at the host."
    );
  }

  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? stripTags(titleMatch[1]) : "";
  const titleStatus = !title
    ? "fail"
    : title.length < 15 || title.length > 65
    ? "warn"
    : "pass";
  push(
    "found",
    "title",
    "Page title",
    9,
    titleStatus,
    title
      ? `"${title}" (${title.length} characters)`
      : "No page title at all — Google will invent one from the page content.",
    "One line, 40-60 characters, in the format: What you do + town + business name. e.g. 'MOT & Servicing in " +
      (town || "your town") +
      " — Your Garage'."
  );

  if (town) {
    const titleHasTown = title.toLowerCase().includes(townLower);
    push(
      "found",
      "title-town",
      `Town name in the page title`,
      8,
      titleHasTown ? "pass" : "fail",
      titleHasTown
        ? `The title mentions ${town}.`
        : `The title never says ${town}. Searches like "MOT ${town}" are the ones that turn into phone calls, and this is the single strongest signal for them.`,
      `Put ${town} in the title tag.`
    );
  }

  const desc = metaContent(html, "description");
  const descStatus = !desc ? "fail" : desc.length < 60 || desc.length > 170 ? "warn" : "pass";
  push(
    "found",
    "meta-description",
    "Search result description",
    5,
    descStatus,
    desc
      ? `${desc.length} characters: "${desc.slice(0, 120)}${desc.length > 120 ? "…" : ""}"`
      : "Missing. Google will scrape a random sentence off the page to use as the sales pitch in search results.",
    "Write 140-160 characters that read like an advert, ending in a reason to call."
  );

  const h1s = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi) || [];
  const h1Status = h1s.length === 1 ? "pass" : h1s.length === 0 ? "fail" : "warn";
  push(
    "found",
    "h1",
    "Main heading (H1)",
    5,
    h1Status,
    h1s.length === 0
      ? "No H1 heading on the page."
      : h1s.length === 1
      ? `One H1: "${stripTags(h1s[0]).slice(0, 80)}"`
      : `${h1s.length} H1 headings. Search engines want exactly one.`,
    "Exactly one H1, saying what you do and where."
  );

  const ldBlocks = html.match(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi) || [];
  let schemaTypes = [];
  let schemaFields = { address: false, telephone: false, hours: false, geo: false };
  for (const block of ldBlocks) {
    const body = block.replace(/^[\s\S]*?>/, "").replace(/<\/script>$/i, "");
    try {
      const parsed = JSON.parse(body);
      const nodes = Array.isArray(parsed) ? parsed : parsed["@graph"] || [parsed];
      for (const n of nodes) {
        if (!n || typeof n !== "object") continue;
        const t = n["@type"];
        if (t) schemaTypes.push(...(Array.isArray(t) ? t : [t]));
        if (n.address) schemaFields.address = true;
        if (n.telephone) schemaFields.telephone = true;
        if (n.openingHours || n.openingHoursSpecification) schemaFields.hours = true;
        if (n.geo) schemaFields.geo = true;
      }
    } catch {
      schemaTypes.push("(unparseable)");
    }
  }
  const localTypes = ["AutoRepair", "LocalBusiness", "AutomotiveBusiness", "Organization"];
  const hasLocal = schemaTypes.some((t) => localTypes.includes(t));
  const schemaComplete = hasLocal && schemaFields.address && schemaFields.telephone && schemaFields.hours;
  push(
    "found",
    "schema",
    "Business data Google can read (structured data)",
    9,
    schemaComplete ? "pass" : hasLocal ? "warn" : "fail",
    !ldBlocks.length
      ? "None. Google has to guess your address, phone number and opening hours from the page text — and it often guesses wrong or not at all."
      : schemaComplete
      ? `Found ${[...new Set(schemaTypes)].join(", ")} with address, phone and hours.`
      : `Found ${[...new Set(schemaTypes)].join(", ")} but missing: ${[
          !schemaFields.address && "address",
          !schemaFields.telephone && "phone",
          !schemaFields.hours && "opening hours",
        ]
          .filter(Boolean)
          .join(", ")}.`,
    "Add AutoRepair JSON-LD with address, telephone, openingHoursSpecification and geo coordinates. This is what feeds the 'open now' and map results."
  );

  push(
    "found",
    "schema-geo",
    "Map coordinates in structured data",
    3,
    schemaFields.geo ? "pass" : "warn",
    schemaFields.geo
      ? "Latitude and longitude are published."
      : "No coordinates published. Google has to geocode your address itself, which is where garages on industrial estates get pinned in the wrong place.",
    "Add geo latitude/longitude to the business schema."
  );

  const canonical = tagsOf(html, "link").find(
    (t) => (attr(t, "rel") || "").toLowerCase() === "canonical"
  );
  push(
    "found",
    "canonical",
    "Canonical URL",
    3,
    canonical ? "pass" : "warn",
    canonical
      ? `Set to ${attr(canonical, "href")}`
      : "Not set. If the site answers on more than one address (with/without www, with/without trailing slash), Google splits the credit between them.",
    "Add a canonical link tag on every page."
  );

  push(
    "found",
    "robots-txt",
    "robots.txt",
    2,
    robots.blocksUs ? "fail" : robots.present ? "pass" : "warn",
    robots.blocksUs
      ? "robots.txt blocks crawlers from the whole site. Nothing will be indexed."
      : robots.present
      ? "Present and not blocking."
      : "No robots.txt. Not fatal, but it is where the sitemap should be advertised.",
    "Publish a robots.txt that allows crawling and points at the sitemap."
  );

  push(
    "found",
    "sitemap",
    "XML sitemap",
    3,
    ctx.sitemapFound ? "pass" : "warn",
    ctx.sitemapFound
      ? `Found at ${ctx.sitemapUrl}`
      : "None found at /sitemap.xml and none advertised in robots.txt.",
    "Publish /sitemap.xml and reference it from robots.txt."
  );

  const ogTitle = metaContent(html, "og:title", "property") || metaContent(html, "og:title");
  const ogImage = metaContent(html, "og:image", "property") || metaContent(html, "og:image");
  const ogOk = !!(ogTitle && ogImage);
  push(
    "found",
    "og",
    "Facebook / WhatsApp share card",
    4,
    ogOk ? "pass" : ogTitle || ogImage ? "warn" : "fail",
    ogOk
      ? "Sharing the link shows a proper title and image."
      : "When a customer pastes your link into a WhatsApp group or a local Facebook page, it shows as a bare grey link with no picture. Local recommendations spread that way.",
    "Add og:title, og:description and a 1200x630 og:image."
  );

  const services = ["mot", "servic", "diagnostic", "brake", "clutch", "cambelt", "tyre", "repair"];
  const hits = services.filter((s) => lower.includes(s));
  push(
    "found",
    "service-words",
    "Services named in the page text",
    5,
    hits.length >= 5 ? "pass" : hits.length >= 3 ? "warn" : "fail",
    `Homepage text mentions ${hits.length} of ${services.length} common garage search terms${
      hits.length ? ` (${hits.join(", ")})` : ""
    }.`,
    "Name every service you sell in words on the page. Images of a price list do not count — Google cannot read them."
  );

  if (town) {
    const townCount = (lower.match(new RegExp(townLower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || [])
      .length;
    push(
      "found",
      "town-body",
      `"${town}" in the page text`,
      5,
      townCount >= 3 ? "pass" : townCount >= 1 ? "warn" : "fail",
      townCount
        ? `Mentioned ${townCount} time${townCount === 1 ? "" : "s"}.`
        : `Never mentioned. The site does not tell Google what town it serves.`,
      `Mention ${town} and two or three neighbouring towns naturally through the copy.`
    );
  }

  push(
    "found",
    "lang",
    "Page language declared",
    1,
    /<html[^>]+lang\s*=/i.test(html) ? "pass" : "warn",
    /<html[^>]+lang\s*=/i.test(html)
      ? "Declared."
      : "No lang attribute on the html tag. Minor, but screen readers and Google both use it.",
    'Add lang="en-GB" to the html tag.'
  );

  // ===== TRUSTED =====

  const telLinks = (html.match(/href\s*=\s*["']tel:[^"']+["']/gi) || []).length;
  push(
    "trusted",
    "click-to-call",
    "Tap-to-call phone number",
    10,
    telLinks > 0 ? "pass" : "fail",
    telLinks > 0
      ? `${telLinks} tap-to-call link${telLinks === 1 ? "" : "s"} on the page.`
      : "The phone number is not tappable. On a phone, the customer has to memorise it, leave the site, and dial by hand. Most of them do not.",
    'Wrap every phone number in <a href="tel:+44...">.'
  );

  const phoneVisible = /(\+44\s?\d|\b0\d{3,4}[\s-]?\d{3}[\s-]?\d{3,4}\b)/.test(text);
  push(
    "trusted",
    "phone-visible",
    "Phone number visible on the homepage",
    7,
    phoneVisible ? "pass" : "fail",
    phoneVisible
      ? "A UK phone number appears in the page text."
      : "No phone number found in the homepage text. If it only exists inside an image or on a Contact page, you are losing the impatient half of your visitors.",
    "Put the phone number in the header, visible without scrolling, on every page."
  );

  const hasForm = /<form\b/i.test(html) || /href\s*=\s*["']mailto:/i.test(html);
  push(
    "trusted",
    "enquiry-form",
    "Enquiry or quote form",
    8,
    hasForm ? "pass" : "fail",
    hasForm
      ? "There is a way to send an enquiry without picking up the phone."
      : "No form and no email link. Every enquiry outside opening hours is lost — and evenings are when people book cars in.",
    "Add a short quote form: name, phone, registration, what's wrong. Delivered straight to your inbox."
  );

  const postcodeRe = /\b[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}\b/i;
  const hasPostcode = postcodeRe.test(text);
  push(
    "trusted",
    "address",
    "Full address on the homepage",
    6,
    hasPostcode ? "pass" : "fail",
    hasPostcode
      ? "A UK postcode appears on the page."
      : "No postcode on the homepage. This is also the field Google cross-checks against your Business Profile — a mismatch or an absence weakens the map listing.",
    "Publish the full address including postcode in the footer of every page."
  );

  const hasMap =
    /google\.com\/maps|maps\.google|goo\.gl\/maps|maps\.app\.goo\.gl|openstreetmap/i.test(html);
  push(
    "trusted",
    "map",
    "Map or directions link",
    4,
    hasMap ? "pass" : "warn",
    hasMap
      ? "There is a map embed or a directions link."
      : "No map. Every 'how do I find you' phone call is a call you did not need to take.",
    "Embed a map with a one-tap 'Get directions' button."
  );

  const hoursWords = /(mon|tue|wed|thu|fri|sat|sun)[a-z]*\s*[-–:]?\s*(mon|tue|wed|thu|fri|sat|sun|\d)/i;
  const hasHours = hoursWords.test(text) || /opening (hours|times)/i.test(text);
  push(
    "trusted",
    "hours",
    "Opening hours on the page",
    5,
    hasHours ? "pass" : "fail",
    hasHours
      ? "Opening hours are published."
      : "No opening hours found. 'Are they open now' is the most common reason someone opens a garage website at 7pm.",
    "Publish opening hours in the footer and in the business schema."
  );

  const reviewWords = /(review|testimonial|what our customers|5 star|five star|rated)/i.test(text);
  push(
    "trusted",
    "reviews",
    "Customer reviews shown",
    6,
    reviewWords ? "pass" : "fail",
    reviewWords
      ? "The page shows or references customer reviews."
      : "No reviews anywhere on the page. Choosing a garage is a trust decision made by a stranger who has been quoted a big number before.",
    "Put three to five real reviews with names on the homepage, and link to the Google profile."
  );

  const accreds = [
    "rac",
    "trust my garage",
    "good garage scheme",
    "bosch",
    "dvsa",
    "aa approved",
    "unipart",
    "motor ombudsman",
  ];
  const accredHits = accreds.filter((a) => lower.includes(a));
  push(
    "trusted",
    "accreditation",
    "Accreditations shown",
    5,
    accredHits.length ? "pass" : "warn",
    accredHits.length
      ? `Mentions: ${accredHits.join(", ")}.`
      : "No trade accreditation mentioned. If you hold one and are not showing it, you are paying for a badge you never spend.",
    "Show the badge above the fold and repeat it in the footer."
  );

  const priceIndicators = /£\s?\d/.test(text);
  push(
    "trusted",
    "prices",
    "Prices or 'from' prices shown",
    4,
    priceIndicators ? "pass" : "warn",
    priceIndicators
      ? "At least one price is published."
      : "No prices at all. A published 'MOT from £35' pre-qualifies the caller and kills the tyre-kicker calls.",
    "Publish 'from' prices for MOT and the service tiers."
  );

  // ===== FAST =====

  const hasViewport = !!metaContent(html, "viewport");
  push(
    "fast",
    "viewport",
    "Built for phones",
    12,
    hasViewport ? "pass" : "fail",
    hasViewport
      ? "The page declares a mobile viewport."
      : "No mobile viewport tag. On a phone this renders as a shrunk-down desktop page that has to be pinched and zoomed. Most local garage traffic is mobile.",
    'Add <meta name="viewport" content="width=device-width, initial-scale=1">.'
  );

  const totalAssetBytes = assets.reduce((sum, a) => sum + (a.bytes || 0), 0);
  const totalBytes = htmlBytes + totalAssetBytes;
  const weightStatus = totalBytes > 3_500_000 ? "fail" : totalBytes > 1_800_000 ? "warn" : "pass";
  push(
    "fast",
    "page-weight",
    "Page weight",
    10,
    weightStatus,
    `About ${bytesHuman(totalBytes)} across ${assets.length + 1} files (sampled). ${
      weightStatus === "pass"
        ? "That will load comfortably on 4G."
        : weightStatus === "warn"
        ? "That is heavy for a phone on a weak signal."
        : "That is very heavy — several seconds of blank screen on 4G, and visitors leave."
    }`,
    "Compress and resize images, serve WebP, and drop unused scripts. Target under 1.5 MB for the homepage."
  );

  const ttfbStatus = ttfbMs > 1500 ? "fail" : ttfbMs > 700 ? "warn" : "pass";
  push(
    "fast",
    "ttfb",
    "Server response time",
    6,
    ttfbStatus,
    `The server took ${ttfbMs} ms to return the homepage HTML.`,
    "Slow first-byte usually means cheap shared hosting or an unoptimised CMS. A static host fixes it for free."
  );

  const images = assets.filter((a) => a.kind === "img");
  const biggest = images.slice().sort((a, b) => (b.bytes || 0) - (a.bytes || 0))[0];
  const bigImages = images.filter((a) => (a.bytes || 0) > 400_000);
  push(
    "fast",
    "images",
    "Image sizes",
    8,
    bigImages.length > 2 ? "fail" : bigImages.length ? "warn" : "pass",
    images.length
      ? `${images.length} images sampled${
          biggest && biggest.bytes ? `, largest ${bytesHuman(biggest.bytes)}` : ""
        }. ${bigImages.length} over 400 KB.`
      : "No images found on the homepage — unusual for a garage; photos of the workshop build trust.",
    "Resize photos to the size they actually display at and export as WebP. A workshop photo should be 100-250 KB, not 4 MB straight off a phone."
  );

  const modernFormats = images.filter((a) => /\.(webp|avif)(\?|$)/i.test(a.url)).length;
  push(
    "fast",
    "image-format",
    "Modern image formats",
    3,
    images.length === 0
      ? "info"
      : modernFormats / images.length > 0.5
      ? "pass"
      : modernFormats > 0
      ? "warn"
      : "fail",
    images.length
      ? `${modernFormats} of ${images.length} images use WebP or AVIF.`
      : "No images to assess.",
    "WebP is typically 30% smaller than JPEG at the same quality and is supported everywhere."
  );

  const imgTags = tagsOf(html, "img");
  const missingAlt = imgTags.filter((t) => !attr(t, "alt")).length;
  push(
    "fast",
    "alt-text",
    "Image alt text",
    3,
    imgTags.length === 0
      ? "info"
      : missingAlt === 0
      ? "pass"
      : missingAlt / imgTags.length > 0.5
      ? "fail"
      : "warn",
    imgTags.length
      ? `${missingAlt} of ${imgTags.length} images have no alt text.`
      : "No images to assess.",
    "Alt text is both an accessibility requirement and a place Google reads the words 'MOT' and your town."
  );

  const blockingJs = tagsOf(html, "script").filter(
    (t) => attr(t, "src") && !attr(t, "async") && !attr(t, "defer") && !/module/i.test(attr(t, "type") || "")
  ).length;
  push(
    "fast",
    "blocking-js",
    "Render-blocking scripts",
    5,
    blockingJs > 6 ? "fail" : blockingJs > 2 ? "warn" : "pass",
    `${blockingJs} script${blockingJs === 1 ? "" : "s"} block the page from drawing until they finish downloading.`,
    "Add defer or async to scripts, or remove the ones nobody uses."
  );

  const mixed = isHttps && /(src|href)\s*=\s*["']http:\/\//i.test(html);
  push(
    "fast",
    "mixed-content",
    "Insecure assets on a secure page",
    4,
    mixed ? "fail" : "pass",
    mixed
      ? "The secure page loads at least one file over plain http://. Browsers block these silently — usually it is an image or a map that has quietly stopped showing."
      : "All assets load securely.",
    "Change every http:// asset reference to https://."
  );

  const favicon = tagsOf(html, "link").some((t) => /icon/i.test(attr(t, "rel") || ""));
  push(
    "fast",
    "favicon",
    "Browser tab icon",
    1,
    favicon ? "pass" : "warn",
    favicon ? "Present." : "No favicon. The tab shows a blank page icon.",
    "Add a favicon built from the logo."
  );

  // Platform sniff — informational, drives the sales conversation not the score.
  let platform = "unknown";
  if (/wp-content|wp-includes/i.test(htmlLower)) platform = "WordPress";
  else if (/wix\.com|wixstatic/i.test(htmlLower)) platform = "Wix";
  else if (/squarespace/i.test(htmlLower)) platform = "Squarespace";
  else if (/godaddy|websitebuilder/i.test(htmlLower)) platform = "GoDaddy builder";
  else if (/shopify/i.test(htmlLower)) platform = "Shopify";
  else if (/_next\/static/i.test(htmlLower)) platform = "Next.js";
  else if (/webflow/i.test(htmlLower)) platform = "Webflow";
  push(
    "fast",
    "platform",
    "Built with",
    0,
    "info",
    platform === "unknown" ? "Could not identify the platform." : platform,
    ""
  );

  const server = headers["server"] || null;
  if (server) push("fast", "server", "Web server", 0, "info", server, "");

  return c;
}

// ---------- scoring ----------

function score(checks) {
  const pillars = {};
  for (const key of Object.keys(PILLAR_WEIGHT)) {
    const set = checks.filter((c) => c.pillar === key && SCORE_OF[c.status] !== null && c.weight > 0);
    const max = set.reduce((s, c) => s + c.weight, 0);
    const got = set.reduce((s, c) => s + c.weight * SCORE_OF[c.status], 0);
    pillars[key] = {
      key,
      label: PILLAR_LABEL[key],
      blurb: PILLAR_BLURB[key],
      score: max ? Math.round((got / max) * 100) : 0,
      passed: set.filter((c) => c.status === "pass").length,
      total: set.length,
    };
  }
  const overall = Math.round(
    Object.entries(PILLAR_WEIGHT).reduce((s, [k, w]) => s + pillars[k].score * w, 0)
  );
  const grade =
    overall >= 85 ? "A" : overall >= 70 ? "B" : overall >= 55 ? "C" : overall >= 40 ? "D" : "F";
  return { pillars, overall, grade };
}

function headline(checks) {
  // The three biggest, most fixable losses — what goes on page one of the report.
  return checks
    .filter((c) => c.status === "fail" && c.weight >= 4)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3);
}

// ---------- the audit ----------

export async function auditSite(opts) {
  const cfg = { ...DEFAULTS, ...opts };
  const startUrl = normaliseUrl(opts.url);
  const started = new Date();

  const first = await timedFetch(startUrl.toString(), {}, cfg);
  if (first.error || !first.res) {
    return {
      ok: false,
      business: { name: opts.name || startUrl.hostname, town: opts.town || null },
      url: startUrl.toString(),
      error: first.error || "No response",
      generatedAt: started.toISOString(),
    };
  }

  const res = first.res;
  const finalUrl = new URL(res.url || startUrl.toString());
  const html = await res.text();
  const htmlBytes = Buffer.byteLength(html, "utf8");
  const headers = Object.fromEntries(res.headers.entries());

  const robots = await readRobots(finalUrl.origin, cfg);

  // Sitemap: /sitemap.xml, or whatever robots.txt advertises.
  let sitemapUrl = `${finalUrl.origin}/sitemap.xml`;
  const advertised = robots.body.match(/^\s*sitemap:\s*(\S+)\s*$/im);
  if (advertised) sitemapUrl = advertised[1];
  const sitemapRes = await timedFetch(sitemapUrl, { method: "HEAD" }, cfg);
  const sitemapFound = !!(sitemapRes.res && sitemapRes.res.ok);

  // Does http:// redirect to https://?
  let httpRedirects = null;
  if (finalUrl.protocol === "https:") {
    const httpProbe = await timedFetch(`http://${finalUrl.host}/`, {}, cfg);
    if (httpProbe.res) httpRedirects = new URL(httpProbe.res.url).protocol === "https:";
  }

  const assets = robots.blocksUs
    ? []
    : await weighAssets(collectAssets(html, finalUrl.toString(), cfg.maxAssets), cfg);

  const text = stripTags(html);
  const checks = runChecks({
    html,
    text,
    finalUrl,
    startUrl,
    headers,
    ttfbMs: first.ms,
    htmlBytes,
    assets,
    robots,
    sitemapFound,
    sitemapUrl,
    town: opts.town || null,
    httpRedirects,
  });

  const scored = score(checks);

  return {
    ok: true,
    generatedAt: started.toISOString(),
    business: {
      name: opts.name || finalUrl.hostname.replace(/^www\./, ""),
      town: opts.town || null,
    },
    url: startUrl.toString(),
    finalUrl: finalUrl.toString(),
    ttfbMs: first.ms,
    htmlBytes,
    assetCount: assets.length,
    totalBytes: htmlBytes + assets.reduce((s, a) => s + (a.bytes || 0), 0),
    ...scored,
    headline: headline(checks),
    checks,
  };
}

export { PILLAR_LABEL, PILLAR_WEIGHT, bytesHuman };
