// v0.1 — RepairsGrid
// 8-card grid driven by brand.repairs. Icons resolved from lucide via string key.
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { brand } from "@/config/brand.config";

type LucideIcon = React.ComponentType<{ className?: string }>;

export function RepairsGrid({ excludeIds = [] }: { excludeIds?: string[] }) {
  const items = brand.repairs.filter((r) => !excludeIds.includes(r.id));
  return (
    <section className="border-b border-line bg-surface/30 py-20 md:py-28">
      <div className="container-x">
        <div className="mb-12 max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Repairs</p>
          <h2 className="mt-3 font-display text-4xl leading-tight tracking-tighter2 text-white md:text-5xl">
            Diagnose. Explain. Fix.
          </h2>
          <p className="mt-4 text-muted">
            Qualified mechanics, manufacturer-grade diagnostics, and a quote before we start.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((r, i) => {
            const Icon = ((Icons as unknown) as Record<string, LucideIcon>)[r.icon] ?? Icons.Wrench;
            // Only some repair items declare priceFrom — narrow via `in`.
            const priceFrom = "priceFrom" in r ? r.priceFrom : undefined;
            return (
              <motion.article
                key={r.id}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: (i % 6) * 0.05 }}
                className="group flex flex-col rounded-2xl border border-line bg-ink p-6 transition hover:border-accent/60"
              >
                <div className="flex items-start justify-between">
                  <Icon className="h-6 w-6 text-accent" />
                  {priceFrom ? (
                    <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                      from {priceFrom}
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-6 font-display text-xl tracking-tightish text-white">{r.name}</h3>
                <p className="mt-2 text-sm text-muted">{r.summary}</p>
                <p className="mt-4 text-sm leading-relaxed text-white/80">{r.detail}</p>
                <Link
                  href="/contact#quote"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-accent group-hover:text-amber-300"
                >
                  Get a quote
                  <Icons.ArrowRight className="h-4 w-4" />
                </Link>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
