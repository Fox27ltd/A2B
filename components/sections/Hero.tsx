// v0.2 — Homepage Hero
// Intro panel → pinned dashboard scrub with three layered overlays:
//   1) Tagline caption
//   2) 5★ RAC review (N.Y. — most descriptive)
//   3) RAC Approved card + "Get a quote" CTA
"use client";

import Link from "next/link";
import { Phone, ArrowRight, Star, ShieldCheck } from "lucide-react";
import { ScrollScrubber, type ScrubStop } from "@/components/scrubber/ScrollScrubber";
import { brand } from "@/config/brand.config";

const featuredReview = brand.reviews[1];

const stops: ScrubStop[] = [
  {
    from: 0.05,
    to: 0.30,
    content: (
      <p className="font-display text-3xl leading-tight tracking-tightish text-white md:text-5xl">
        We understand every part of your car.
      </p>
    ),
  },
  {
    from: 0.36,
    to: 0.62,
    content: (
      <figure className="mx-auto max-w-2xl rounded-2xl border border-line/80 bg-surface/80 p-6 backdrop-blur md:p-8">
        <div className="flex items-center justify-center gap-1 text-accent">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-current" />
          ))}
        </div>
        <blockquote className="mt-4 font-display text-xl leading-snug tracking-tightish text-white md:text-2xl">
          “{featuredReview.body}”
        </blockquote>
        <figcaption className="mt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
          {featuredReview.author} · {featuredReview.source}
        </figcaption>
      </figure>
    ),
  },
  {
    from: 0.68,
    to: 0.98,
    content: (
      <div className="mx-auto max-w-2xl rounded-2xl border border-accent/40 bg-surface/85 p-6 backdrop-blur md:p-8">
        <div className="flex items-center justify-center gap-2 text-accent">
          <ShieldCheck className="h-5 w-5" />
          <span className="font-mono text-[11px] uppercase tracking-[0.2em]">
            RAC Approved Garage
          </span>
        </div>
        <p className="mt-4 font-display text-2xl leading-snug tracking-tightish text-white md:text-3xl">
          Independently checked workmanship. Honest pricing. No surprises.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="#quote"
            className="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-medium text-ink transition hover:bg-amber-400"
          >
            Get a quote
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
          <a
            href={brand.ctas.secondary.href}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-ink/40 px-6 py-3 font-medium text-white backdrop-blur transition hover:border-accent/60"
          >
            <Phone className="h-4 w-4" />
            {brand.contact.phone}
          </a>
        </div>
      </div>
    ),
  },
];

export function Hero() {
  return (
    <>
      <section className="relative min-h-[90vh] overflow-hidden border-b border-line">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60"
          style={{ backgroundImage: "url(/brand/dashboard/frame-01.webp)" }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/60 to-ink" />

        <div className="container-x relative z-10 flex min-h-[90vh] flex-col justify-end pb-16 pt-32 md:pb-24 md:pt-40">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
            RAC Approved · Rainham, London · Est. {brand.client.yearEstablished}
          </p>
          <h1 className="mt-4 max-w-4xl font-display text-5xl leading-[1.02] tracking-tighter2 text-white md:text-7xl">
            Independent garage.
            <br />
            <span className="text-accent">Going the extra mile.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted">
            Family-run, RAC Approved, no jargon. MOT, servicing and repairs for drivers in Rainham and across east London.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="#quote"
              className="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-medium text-ink transition hover:bg-amber-400"
            >
              {brand.ctas.primary.label}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <a
              href={brand.ctas.secondary.href}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/60 px-6 py-3 font-medium text-white backdrop-blur transition hover:border-accent/60"
            >
              <Phone className="h-4 w-4" />
              {brand.ctas.secondary.label}
            </a>
          </div>

          <p className="mt-10 font-mono text-[11px] uppercase tracking-widest text-muted">
            Scroll ↓ Diagnose
          </p>
        </div>
      </section>

      <ScrollScrubber
        framesPath="/brand/dashboard"
        frameCount={11}
        ext="webp"
        pad={2}
        height={3.5}
        stops={stops}
      />
    </>
  );
}
