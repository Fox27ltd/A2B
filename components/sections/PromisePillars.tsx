// v0.1 — PromisePillars
// Three pillars driving the A2B brand promise. Used on /about and homepage.
"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Users, Wrench } from "lucide-react";
import { brand } from "@/config/brand.config";

const icons = [ShieldCheck, Users, Wrench];

export function PromisePillars() {
  return (
    <section className="border-b border-line py-20 md:py-28">
      <div className="container-x">
        <div className="mb-12 max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
            {brand.promise.tagline}
          </p>
          <h2 className="mt-3 font-display text-4xl leading-tight tracking-tighter2 text-white md:text-5xl">
            {brand.promise.title}
          </h2>
          <p className="mt-4 text-muted">{brand.promise.establishedCopy}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {brand.promise.pillars.map((p, i) => {
            const Icon = icons[i] ?? ShieldCheck;
            return (
              <motion.article
                key={p.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="rounded-2xl border border-line bg-surface/40 p-6 md:p-8"
              >
                <Icon className="h-6 w-6 text-accent" />
                <h3 className="mt-6 font-display text-xl tracking-tightish text-white">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/80">{p.body}</p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
