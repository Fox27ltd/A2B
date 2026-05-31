// v0.1 — /about
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Calendar, MapPin } from "lucide-react";
import { PageHeader } from "@/components/sections/PageHeader";
import { PromisePillars } from "@/components/sections/PromisePillars";
import { FindUs } from "@/components/sections/FindUs";
import { Footer } from "@/components/sections/Footer";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/seo";
import { brand } from "@/config/brand.config";

export const metadata: Metadata = {
  title: "About A2B Autocentre",
  description:
    "Family-run, RAC Approved garage in Rainham, London. Serving east London drivers since 2016. Honest pricing, qualified mechanics.",
  alternates: { canonical: "/about" },
};

const stats = [
  { Icon: Calendar,    label: "Est.",      value: brand.client.yearEstablished },
  { Icon: ShieldCheck, label: "Standard",  value: "RAC Approved" },
  { Icon: MapPin,      label: "Based in",  value: "Rainham, London" },
];

export default function AboutPage() {
  return (
    <main>
      <PageHeader
        eyebrow="About"
        title="Independent. Family-run. Rainham."
        subtitle="A2B Autocentre is an RAC Approved independent garage on Upminster Road South. We've been keeping east London drivers on the road since 2016."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "About" }]}
        bgImage="/brand/dashboard/frame-01.webp"
      />

      <section className="border-b border-line py-20 md:py-28">
        <div className="container-x grid gap-12 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Our story</p>
            <h2 className="mt-3 font-display text-4xl leading-tight tracking-tighter2 text-white md:text-5xl">
              A garage that explains itself.
            </h2>
            <div className="prose-invert mt-6 space-y-5 text-base leading-relaxed text-white/85">
              <p>
                We started A2B Autocentre in 2016 with a simple idea: motoring should be honest. No upsells.
                No mystery line items. Show the customer the part, explain the fault, quote before the work starts.
              </p>
              <p>
                A decade in, that's still how we run. We've earned RAC Approved status by independent inspection,
                we work to manufacturer schedules, and the same people answer the phone, do the work and hand you the keys.
              </p>
              <p className="text-muted">
                {/* TBD — owner name(s) and bio: see docs/client_questions.md */}
                Owner profile coming soon. We're family-run and based on Upminster Road South in Rainham, RM13.
              </p>
            </div>

            <Link
              href="/contact#quote"
              className="group mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-medium text-ink transition hover:bg-amber-400"
            >
              Get a quote
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
          </div>

          <aside className="lg:col-span-2">
            <div className="grid gap-3">
              {stats.map(({ Icon, label, value }) => (
                <div key={label} className="flex items-center gap-4 rounded-2xl border border-line bg-surface/40 p-5">
                  <Icon className="h-6 w-6 text-accent" />
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">{label}</p>
                    <p className="font-display text-xl tracking-tightish text-white">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <PromisePillars />
      <FindUs />
      <Footer />
      <JsonLd data={breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "About", path: "/about" },
      ])} />
    </main>
  );
}
