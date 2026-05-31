// v0.1 — /sitemap.xml (Next 14 file-based)
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

const paths = [
  { path: "/",          priority: 1.0, changeFrequency: "weekly"  as const },
  { path: "/servicing", priority: 0.9, changeFrequency: "monthly" as const },
  { path: "/repairs",   priority: 0.9, changeFrequency: "monthly" as const },
  { path: "/mot",       priority: 0.9, changeFrequency: "monthly" as const },
  { path: "/reviews",   priority: 0.7, changeFrequency: "weekly"  as const },
  { path: "/about",     priority: 0.6, changeFrequency: "yearly"  as const },
  { path: "/contact",   priority: 0.8, changeFrequency: "yearly"  as const },
  { path: "/privacy",   priority: 0.3, changeFrequency: "yearly"  as const },
  { path: "/terms",     priority: 0.3, changeFrequency: "yearly"  as const },
  { path: "/cookies",   priority: 0.3, changeFrequency: "yearly"  as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return paths.map((p) => ({
    url: `${SITE_URL}${p.path}`,
    lastModified,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));
}
