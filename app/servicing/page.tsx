// v0.1 — /servicing
import type { Metadata } from "next";
import { PageHeader } from "@/components/sections/PageHeader";
import { ServicingTiers } from "@/components/sections/ServicingTiers";
import { QuoteContact } from "@/components/sections/QuoteContact";
import { Footer } from "@/components/sections/Footer";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Servicing — Bronze, Silver & Gold",
  description:
    "Three service levels at A2B Autocentre, Rainham. Manufacturer-schedule car servicing with checklists and honest pricing. RAC Approved.",
  alternates: { canonical: "/servicing" },
};

export default function ServicingPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Servicing"
        title="Three service levels. One standard of work."
        subtitle="Bronze interim, Silver annual, or Gold full service — all carried out by qualified mechanics to manufacturer schedule. RAC Approved."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Servicing" }]}
        bgImage="/brand/dashboard/frame-01.webp"
      />
      <ServicingTiers />
      <QuoteContact />
      <Footer />
      <JsonLd data={breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Servicing", path: "/servicing" },
      ])} />
    </main>
  );
}
