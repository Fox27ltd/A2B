// v0.1 — ServicingTiers
// Three tier cards (Bronze / Silver / Gold) with checklist + recommendation.
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { brand } from "@/config/brand.config";

const tierStyles: Record<string, string> = {
  bronze: "from-amber-700/30 to-transparent",
  silver: "from-zinc-400/25 to-transparent",
  gold:   "from-accent/30 to-transparent",
};

export function ServicingTiers() {
  const { tiers, blurb } = brand.servicing;
  return (
    <section className="border-b border-line py-20 md:py-28">
      <div className="container-x">
        <div className="mb-12 max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Servicing</p>
          <h2 className="mt-3 font-display text-4xl leading-tight tracking-tighter2 text-white md:text-5xl">
            Three service levels.
          </h2>
          <p className="mt-4 text-muted">{blurb}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {tiers.map((tier, i) => (
            <motion.article
              key={tier.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface/40 p-6 md:p-8"
            >
              <div className={`pointer-events-none absolute inset-0 bg-gradient-to-b ${tierStyles[tier.id] ?? ""}`} aria-hidden />
              <div className="relative">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
                  Tier {String.fromCharCode(0x2160 + i) /* I, II, III */}
                </p>
                <h3 className="mt-2 font-display text-2xl tracking-tightish text-white">{tier.name}</h3>
                <p className="mt-2 text-sm text-muted">{tier.recommended}</p>

                <ul className="mt-6 space-y-2.5">
                  {tier.checklist.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-white/90">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/contact#quote"
                  className="group mt-8 inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-amber-300"
                >
                  Book {tier.name}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>

        <p className="mt-8 max-w-2xl font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
          Checklists shown are indicative. Final scope confirmed against your vehicle's manufacturer schedule.
        </p>
      </div>
    </section>
  );
}
