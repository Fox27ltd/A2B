// v0.1 — Legal config
// All legal text reads from this file so per-client overrides are one place.
// TBD values must be confirmed with the client BEFORE going live.
import { brand } from "@/config/brand.config";

export const legal = {
  // ---------- Data controller ----------
  // Confirm with client whether they are sole trader, partnership, or Ltd.
  // For Ltd: registration number + registered office are required by Companies Act.
  controller: {
    name: brand.client.legalName,
    structure: "TBD",            // "Sole trader" | "Partnership" | "Limited company"
    companyNumber: "TBD",        // only if Ltd
    registeredOffice: "TBD",     // only if Ltd
    placeOfRegistration: "TBD",  // e.g. "England and Wales" — only if Ltd
    icoNumber: "TBD",            // Information Commissioner's Office registration
    icoUrl: "https://ico.org.uk/ESDWebPages/Search",
    contactEmail: brand.contact.email,
    contactPhone: brand.contact.phone,
  },

  // ---------- Data we collect via the quote form ----------
  formData: [
    { field: "Name",        purpose: "To address you in reply"        },
    { field: "Phone",       purpose: "To call you with the quote"      },
    { field: "Email",       purpose: "To email you with the quote (alternate)" },
    { field: "Vehicle reg", purpose: "To look up your vehicle's MOT history and identify the model" },
    { field: "Service",     purpose: "To route your enquiry to the right mechanic" },
    { field: "Message",     purpose: "To understand the issue and prepare a quote" },
  ],

  // ---------- Retention ----------
  retention: {
    quoteEnquiries: "6 months from last contact",
    serviceRecords: "7 years (HMRC business-records requirement)",
    websiteLogs: "30 days (Vercel default access logs, IP truncated)",
  },

  // ---------- Lawful basis (UK GDPR Art.6) ----------
  lawfulBasis: [
    {
      basis: "Article 6(1)(b) — performance of a contract / pre-contractual steps",
      what: "Quote requests and bookings: we use your details to prepare a quote and carry out the work.",
    },
    {
      basis: "Article 6(1)(f) — legitimate interests",
      what: "Operating and securing our website. We balance this against your privacy and use the minimum data necessary.",
    },
    {
      basis: "Article 6(1)(c) — legal obligation",
      what: "Tax and statutory record-keeping (HMRC, DVSA MOT records).",
    },
  ],

  // ---------- Third-party processors we share data with ----------
  // Update list if you wire Formspree / Resend / Analytics later.
  processors: [
    { name: "Vercel Inc.", purpose: "Website hosting", country: "USA (DPF compliant)", url: "https://vercel.com/legal/privacy-policy" },
    { name: "Google Maps", purpose: "Map embed showing our location", country: "USA",   url: "https://policies.google.com/privacy" },
    { name: "Google Fonts", purpose: "Web fonts (Inter, Space Grotesk, JetBrains Mono) — fonts are self-hosted at build time, no runtime tracking", country: "—", url: "https://policies.google.com/privacy" },
  ],

  // ---------- Cookies ----------
  // Today the site sets ZERO non-essential cookies. Update this when analytics added.
  cookies: {
    usesNonEssentialCookies: false,
    list: [
      // Add entries here when you turn on analytics, e.g.
      // { name: "_ga", purpose: "Google Analytics — measures site usage", duration: "2 years", category: "analytics" },
    ],
  },

  // ---------- Effective date ----------
  effectiveDate: "30 May 2026", // bump on any material change
} as const;
