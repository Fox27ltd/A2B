// v0.3 — Root layout: fonts, base meta, global Nav, AutoRepair JSON-LD.
import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { brand } from "@/config/brand.config";
import { Nav } from "@/components/sections/Nav";
import { JsonLd } from "@/components/JsonLd";
import { autoRepairSchema, SITE_URL } from "@/lib/seo";
import "./globals.css";

const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });
const body = Inter({ subsets: ["latin"], variable: "--font-body" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: brand.seo.siteTitle, template: `%s — ${brand.client.name}` },
  description: brand.seo.siteDescription,
  keywords: [...brand.seo.keywords],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: brand.seo.locale,
    title: brand.seo.siteTitle,
    description: brand.seo.siteDescription,
    siteName: brand.client.name,
    url: SITE_URL,
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: brand.seo.siteTitle,
    description: brand.seo.siteDescription,
    images: ["/opengraph-image"],
  },
  icons: {
    icon: [
      { url: "/brand/favicon.ico", sizes: "any" },
      { url: "/brand/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/brand/favicon-192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: "/brand/apple-touch-icon.png",
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  authors: [{ name: brand.client.name }],
  category: "automotive",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <Nav />
        {children}
        <JsonLd data={autoRepairSchema()} />
      </body>
    </html>
  );
}
