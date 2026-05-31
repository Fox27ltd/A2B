// v0.1 — SEO helpers shared across pages
import { brand } from "@/config/brand.config";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://a2bautocentre.example.com";

const dayMap: Record<string, string> = {
  Monday: "Monday",
  Tuesday: "Tuesday",
  Wednesday: "Wednesday",
  Thursday: "Thursday",
  Friday: "Friday",
  Saturday: "Saturday",
  Sunday: "Sunday",
};

/**
 * AutoRepair schema for the business. Validated against schema.org.
 * Use schema.org's structured-data testing tool to verify before launch.
 */
export function autoRepairSchema() {
  const ratings = brand.reviews.map((r) => r.rating);
  const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
  const openingHoursSpecification = brand.hours
    .filter((h) => h.open && h.close)
    .map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: dayMap[h.day],
      opens: h.open!,
      closes: h.close!,
    }));

  return {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    "@id": `${SITE_URL}/#autorepair`,
    name: brand.client.name,
    description: brand.seo.siteDescription,
    url: SITE_URL,
    image: `${SITE_URL}${brand.seo.ogImage}`,
    logo: `${SITE_URL}${brand.client.logo}`,
    telephone: brand.contact.phoneE164,
    email: brand.contact.email,
    priceRange: "££",
    foundingDate: brand.client.yearEstablished,
    address: {
      "@type": "PostalAddress",
      streetAddress: brand.contact.address.line1,
      addressLocality: brand.contact.address.city,
      addressRegion: brand.contact.address.region,
      postalCode: brand.contact.address.postcode,
      addressCountry: brand.contact.address.country,
    },
    // geo: { "@type": "GeoCoordinates", latitude, longitude } — see client_questions.md
    openingHoursSpecification,
    areaServed: ["Rainham", "Upminster", "Hornchurch", "Dagenham", "London"],
    makesOffer: brand.repairs.map((r) => {
      // Only some repair items declare priceFrom — narrow with `in` so TS allows access.
      const priceFrom = "priceFrom" in r ? r.priceFrom : undefined;
      return {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: r.name, description: r.summary },
        ...(priceFrom
          ? {
              priceSpecification: {
                "@type": "PriceSpecification",
                priceCurrency: "GBP",
                minPrice: Number(priceFrom.replace(/[^\d.]/g, "")),
              },
            }
          : {}),
      };
    }),
    award: "RAC Approved Garage",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: avg.toFixed(1),
      reviewCount: brand.reviews.length,
      bestRating: 5,
      worstRating: 1,
    },
    review: brand.reviews.map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.author },
      reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
      reviewBody: r.body,
      publisher: { "@type": "Organization", name: r.source },
    })),
    sameAs: [
      // Add Facebook/Instagram/etc once provided — see client_questions.md
    ],
  };
}

/**
 * BreadcrumbList for a sub-page. Pass crumbs from root to current.
 */
export function breadcrumbSchema(crumbs: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${SITE_URL}${c.path}`,
    })),
  };
}

/** Canonical for a given path. */
export function canonical(path: string) {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
