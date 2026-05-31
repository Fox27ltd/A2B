// v0.1 — /mot
import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, ArrowRight, Phone, FileCheck2, Eye, CarFront } from "lucide-react";
import { PageHeader } from "@/components/sections/PageHeader";
import { QuoteContact } from "@/components/sections/QuoteContact";
import { Footer } from "@/components/sections/Footer";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/seo";
import { brand } from "@/config/brand.config";

export const metadata: Metadata = {
  title: "MOT in Rainham — from £35",
  description:
    "Class 4 MOT testing at A2B Autocentre, Rainham. From £35. RAC Approved. Same-day slots and advisories explained in plain English.",
  alternates: { canonical: "/mot" },
};

const checklist = [
  { Icon: FileCheck2, title: "Class 4 MOT to DVSA standards", body: "Cars, small vans up to 3,000kg. Issued same day where possible." },
  { Icon: Eye,        title: "Advisories explained in plain English", body: "We walk you through the test sheet — no jargon, no pressure." },
  { Icon: ShieldCheck, title: "RAC MOT Check & Repair Plan", body: "Service your car with us and get up to £750 of MOT repair cover, free." },
  { Icon: CarFront,   title: "Walk-in or pre-book", body: "Same-day slots when available. Call to confirm a time that suits you." },
];

export default function MotPage() {
  return (
    <main>
      <PageHeader
        eyebrow="MOT testing"
        title="MOT from £35. RAC Approved."
        subtitle="Class 4 MOT testing at A2B Autocentre — book a slot or walk in. We explain every advisory before any work is quoted."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "MOT" }]}
        bgImage="/brand/dashboard/frame-01.webp"
      />

      {/* MOT explainer */}
      <section className="border-b border-line py-20 md:py-28">
        <div className="container-x grid gap-10 md:grid-cols-2">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">What you get</p>
            <h2 className="mt-3 font-display text-4xl leading-tight tracking-tighter2 text-white md:text-5xl">
              The honest MOT.
            </h2>
            <p className="mt-4 max-w-prose text-muted">
              An MOT is a safety and emissions test, not a service. We test to DVSA standards, share the results with
              you transparently, and only quote for advisories you actually need fixed — when you need them fixed.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/contact#quote"
                className="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-medium text-ink transition hover:bg-amber-400"
              >
                Book MOT — from £35
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
              <a
                href={brand.ctas.secondary.href}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/60 px-6 py-3 font-medium text-white hover:border-accent/60"
              >
                <Phone className="h-4 w-4" />
                {brand.contact.phone}
              </a>
            </div>
          </div>

          <ul className="grid gap-4">
            {checklist.map(({ Icon, title, body }, i) => (
              <li key={title} className="flex gap-4 rounded-2xl border border-line bg-surface/40 p-5">
                <Icon className="mt-0.5 h-6 w-6 shrink-0 text-accent" />
                <div>
                  <h3 className="font-display text-lg tracking-tightish text-white">{title}</h3>
                  <p className="mt-1 text-sm text-muted">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* RAC offer banner */}
      <section className="border-b border-line bg-surface/60 py-16 md:py-20">
        <div className="container-x">
          <div className="rounded-2xl border border-accent/40 bg-ink p-8 md:p-12">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">{brand.offer.badge}</p>
            <h3 className="mt-3 font-display text-3xl leading-tight tracking-tighter2 text-white md:text-4xl">
              {brand.offer.name}
            </h3>
            <p className="mt-3 max-w-2xl text-muted">{brand.offer.body}</p>
            <Link
              href={brand.offer.cta.href}
              className="group mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-medium text-ink transition hover:bg-amber-400"
            >
              {brand.offer.cta.label}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>

      <QuoteContact />
      <Footer />
      <JsonLd data={breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "MOT", path: "/mot" },
      ])} />
    </main>
  );
}
