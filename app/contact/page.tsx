// v0.1 — /contact
import type { Metadata } from "next";
import { PageHeader } from "@/components/sections/PageHeader";
import { QuoteContact } from "@/components/sections/QuoteContact";
import { FindUs } from "@/components/sections/FindUs";
import { Footer } from "@/components/sections/Footer";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Contact A2B Autocentre — Rainham",
  description:
    "Call 01708 521 818 or send a quote request. RAC Approved garage at 95-103 Upminster Road South, Rainham RM13 9AA.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Contact"
        title="Get a quote. Or just give us a ring."
        subtitle="Phone is the fastest. The form works too — we typically reply same working day."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Contact" }]}
        bgImage="/brand/dashboard/frame-01.webp"
      />
      <QuoteContact />
      <FindUs />
      <Footer />
      <JsonLd data={breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Contact", path: "/contact" },
      ])} />
    </main>
  );
}
