// v0.1 — Single source of truth per client. Swap this file to retheme.
// Owner: Fox27. Client: A2B Autocentre.

export const brand = {
  // ---------- Identity ----------
  client: {
    name: "A2B Autocentre",
    legalName: "A2B Autocentre",
    tagline: "Going the Extra Mile",
    shortDescription:
      "Family-run, RAC Approved independent garage in Rainham, London.",
    yearEstablished: "2016",
    // Logos — using the clean transparent artwork since the site bg is dark.
    // Filenames are cache-bust safe; rename again if you swap the source.
    logo: "/brand/logo-clean.webp",          // 1080w — Footer / hero / OG
    logoNav: "/brand/logo-clean-nav.webp",   // 420w — Nav
    logoBlueBadge: "/brand/logo.webp",       // backup blue-bg badge (OG fallback)
    favicon: "/brand/favicon.ico",
  },

  // ---------- Contact ----------
  contact: {
    phone: "01708 521 818",
    phoneE164: "+441708521818",
    email: "a2bautocentre@gmail.com",
    address: {
      line1: "95-103 Upminster Road South",
      city: "Rainham",
      region: "London",
      postcode: "RM13 9AA",
      country: "GB",
    },
    mapsQuery: "A2B Autocentre, 95-103 Upminster Road South, Rainham, RM13 9AA",
    // Embed URL is generated dynamically from mapsQuery in the FindUs section.
  },

  // ---------- Hours ----------
  hours: [
    { day: "Monday",    open: "08:00", close: "18:00" },
    { day: "Tuesday",   open: "08:00", close: "18:00" },
    { day: "Wednesday", open: "08:00", close: "18:00" },
    { day: "Thursday",  open: "08:00", close: "18:00" },
    { day: "Friday",    open: "08:00", close: "18:00" },
    { day: "Saturday",  open: "08:00", close: "17:00" },
    { day: "Sunday",    open: null,    close: null    },
  ],

  // ---------- Colours (industrial premium) ----------
  colors: {
    ink: "#0F1419",      // deep charcoal base
    surface: "#15191F",  // panel surface
    muted: "#9AA3AD",    // muted body text on dark
    line: "#252B33",     // hairline borders
    accent: "#F39C12",   // amber, diagnostic warning light
  },

  // ---------- Type ----------
  fonts: {
    display: "Space Grotesk",
    body: "Inter",
    mono: "JetBrains Mono",
  },

  // ---------- Trust strip ----------
  trust: [
    "RAC Approved",
    "5-Star RAC Reviews",
    "Family-Run",
    "Rainham, London",
  ],

  // ---------- Services ----------
  servicing: {
    title: "Servicing",
    blurb:
      "Three service levels to match your mileage and budget — every job logged and explained.",
    tiers: [
      {
        id: "bronze",
        name: "Bronze Service",
        recommended: "Interim service, ideal between full services.",
        // TBD — replace with the checklist file the client provides.
        checklist: [
          "Engine oil & filter replacement",
          "Top-up of essential fluids",
          "Visual safety inspection",
          "Tyre condition & pressure check",
          "Lights, wipers & washers check",
        ],
      },
      {
        id: "silver",
        name: "Silver Service",
        recommended: "Annual service for most drivers.",
        checklist: [
          "Everything in Bronze",
          "Air filter replacement",
          "Brake inspection (pads, discs, lines)",
          "Battery & charging system test",
          "Suspension & steering check",
          "Exhaust system inspection",
        ],
      },
      {
        id: "gold",
        name: "Gold Service",
        recommended: "Full service — recommended every 24 months / 24k miles.",
        checklist: [
          "Everything in Silver",
          "Spark plug replacement (petrol)",
          "Fuel filter replacement (where applicable)",
          "Coolant system check & top-up",
          "Cabin / pollen filter replacement",
          "Comprehensive diagnostic scan",
        ],
      },
    ],
  },

  repairs: [
    {
      id: "mot",
      name: "MOT",
      summary: "Class 4 MOT testing from £35.",
      detail:
        "Full MOT to DVSA standards. We explain every advisory and only recommend work that's needed.",
      priceFrom: "£35",
      icon: "ShieldCheck",
    },
    {
      id: "engine-repair",
      name: "Engine Repair & Rebuilds",
      summary: "From timing issues to full rebuilds.",
      detail:
        "Diagnosis, head gasket work, timing chains, complete rebuilds — all carried out by qualified mechanics.",
      icon: "Wrench",
    },
    {
      id: "diagnostics",
      name: "Engine Diagnostics",
      summary: "ECU fault code reading & live data.",
      detail:
        "We read manufacturer-level codes, interpret live sensor data, and explain the root cause before any work begins.",
      icon: "Activity",
    },
    {
      id: "gearbox",
      name: "Gearbox Repairs",
      summary: "Manual & automatic gearbox work.",
      detail:
        "Clutch replacement, gearbox repairs and overhauls. Honest advice on repair vs replace.",
      icon: "Cog",
    },
    {
      id: "cambelt",
      name: "Cambelt Replacement",
      summary: "Replaced to manufacturer interval.",
      detail:
        "Cambelt failure can destroy an engine. We replace to manufacturer schedule with genuine or OEM-quality parts.",
      icon: "Settings2",
    },
    {
      id: "batteries",
      name: "Car Batteries",
      summary: "Test, replace & dispose responsibly.",
      detail:
        "Battery health testing, supply and fit, plus environmentally responsible disposal of your old unit.",
      icon: "BatteryCharging",
    },
    {
      id: "body",
      name: "Car Body Repairs",
      summary: "Bumper scuffs, scratches, dents, kerbed alloys.",
      detail:
        "Cosmetic body repair without the cost of a full panel respray. Perfect for lease returns and tidy-ups.",
      icon: "Sparkles",
    },
    {
      id: "exhausts",
      name: "Exhausts",
      summary: "Supply & fit, full system or section.",
      detail:
        "Full system replacement, section repairs, and emissions investigation.",
      icon: "Wind",
    },
    {
      id: "aircon",
      name: "Air Conditioning",
      summary: "Regas recommended every 2 years.",
      detail:
        "A/C regas, leak detection, and full system service to keep you cool and demist quickly in winter.",
      icon: "Snowflake",
    },
  ],

  // ---------- Featured offer ----------
  offer: {
    badge: "Featured",
    name: "RAC MOT Check & Repair Plan",
    headline: "£750 of repair cover — free with every service.",
    body:
      "Service your car with A2B and you're automatically covered by the RAC MOT Check & Repair Plan: up to £750 towards eligible repairs identified at MOT. Real peace of mind, no extra cost.",
    cta: { label: "Book your service", href: "/contact" },
  },

  // ---------- Reviews ----------
  // Sources we display: RAC Approved Garage Network + Google Reviews.
  // The Google block is wired for future Places API ingestion — see lib/reviews.ts.
  // For now we ship the 3 confirmed RAC reviews as seed content.
  reviewSources: ["RAC Approved Garage Network", "Google Reviews"] as const,
  googlePlaces: {
    enabled: false, // flip to true once Places API key is wired in Phase 7+
    placeId: "TBD", // populate from Google Business Profile
    cacheMinutes: 60,
  },
  reviews: [
    {
      author: "T.A.",
      source: "RAC Approved Garage Network",
      rating: 4.5,
      body: "Great communication, excellent customer service.",
    },
    {
      author: "N.Y.",
      source: "RAC Approved Garage Network",
      rating: 5,
      body:
        "Very professional, helpful, explained the fault and showed me the faulty part prior to paying. Used them for MOT.",
    },
    {
      author: "S.T.",
      source: "RAC Approved Garage Network",
      rating: 5,
      body: "Great service and accommodating, very knowledgeable.",
    },
  ],

  // ---------- Promise / About ----------
  promise: {
    title: "The A2B Promise",
    tagline: "Going the Extra Mile",
    establishedCopy:
      "A2B Autocentre has been looking after drivers in Rainham and the surrounding area since 2016.",
    pillars: [
      {
        title: "RAC Approved since 2016",
        body:
          "We meet the RAC's standards for workmanship, transparency and customer service — independently checked.",
      },
      {
        title: "Family-run, Rainham-based",
        body:
          "A local independent garage. The same people answer the phone, do the work, and hand you the keys.",
      },
      {
        title: "Qualified mechanics, plain English",
        body:
          "We explain the fault, show you the part, and quote before we start. No jargon, no surprises.",
      },
    ],
  },

  // ---------- Primary CTAs ----------
  ctas: {
    primary: { label: "Book MOT — from £35", href: "/contact" },
    secondary: { label: "Call 01708 521 818", href: "tel:+441708521818" },
  },

  // ---------- SEO ----------
  seo: {
    siteTitle: "A2B Autocentre — RAC Approved Garage in Rainham, London",
    siteDescription:
      "Family-run, RAC Approved garage in Rainham. MOT from £35, servicing, diagnostics, repairs. Call 01708 521 818.",
    keywords: [
      "MOT Rainham",
      "car service Rainham",
      "garage Rainham",
      "MOT Upminster",
      "RAC approved garage London",
      "car repairs RM13",
    ],
    ogImage: "/og/default.png",
    locale: "en_GB",
  },
} as const;

export type Brand = typeof brand;
