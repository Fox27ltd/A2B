// v0.1 — /repairs
import type { Metadata } from "next";
import { PageHeader } from "@/components/sections/PageHeader";
import { RepairsGrid } from "@/components/sections/RepairsGrid";
import { QuoteContact } from "@/components/sections/QuoteContact";
import { Footer } from "@/components/sections/Footer";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Car Repairs — Rainham, London",
  description:
    "Engine, gearbox, cambelt, diagnostics, batteries, exhausts, air-con and body repairs in Rainham — RAC Approved.",
  alternates: { canonical: "/repairs" },
};

export default function RepairsPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Repairs"
        title="From a warning light to a full rebuild."
        subtitle="Engine, gearbox, diagnostics, exhausts, cambelt, batteries, body work and air-con — all under one RAC Approved roof in Rainham."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Repairs" }]}
        bgImage="/brand/dashboard/frame-05.webp"
      />
      <RepairsGrid excludeIds={["mot"]} />
      <QuoteContact />
      <Footer />
      <JsonLd data={breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Repairs", path: "/repairs" },
      ])} />
    </main>
  );
}
