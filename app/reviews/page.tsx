// v0.1 — /reviews
import type { Metadata } from "next";
import { PageHeader } from "@/components/sections/PageHeader";
import { ReviewsList } from "@/components/sections/ReviewsList";
import { QuoteContact } from "@/components/sections/QuoteContact";
import { Footer } from "@/components/sections/Footer";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Reviews — A2B Autocentre",
  description:
    "Verified reviews of A2B Autocentre, Rainham, from the RAC Approved Garage Network. Google reviews coming soon.",
  alternates: { canonical: "/reviews" },
};

export default function ReviewsPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Reviews"
        title="The receipts."
        subtitle="Verified from the RAC Approved Garage Network. Google reviews syncing soon."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Reviews" }]}
        bgImage="/brand/dashboard/frame-01.webp"
      />
      <ReviewsList />
      <QuoteContact />
      <Footer />
      <JsonLd data={breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Reviews", path: "/reviews" },
      ])} />
    </main>
  );
}
