// v0.1 — ReviewsList
// Grid of review cards. Source pill prepared for both RAC and Google.
"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { brand } from "@/config/brand.config";

export function ReviewsList() {
  return (
    <section className="border-b border-line py-20 md:py-28">
      <div className="container-x">
        <div className="mb-12 max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Reviews</p>
          <h2 className="mt-3 font-display text-4xl leading-tight tracking-tighter2 text-white md:text-5xl">
            What drivers say.
          </h2>
          <p className="mt-4 text-muted">
            Verified reviews from the RAC Approved Garage Network. Google reviews syncing soon.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {brand.reviews.map((r, i) => {
            const full = Math.floor(r.rating);
            const half = r.rating - full >= 0.5;
            return (
              <motion.figure
                key={i}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="flex flex-col rounded-2xl border border-line bg-surface/50 p-6"
              >
                <div className="flex items-center gap-1 text-accent">
                  {Array.from({ length: 5 }).map((_, k) => (
                    <Star
                      key={k}
                      className={`h-4 w-4 ${
                        k < full ? "fill-current" : k === full && half ? "fill-current opacity-50" : "opacity-30"
                      }`}
                    />
                  ))}
                  <span className="ml-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                    {r.rating.toFixed(1)}
                  </span>
                </div>
                <blockquote className="mt-5 font-display text-lg leading-snug tracking-tightish text-white">
                  “{r.body}”
                </blockquote>
                <figcaption className="mt-6 flex items-center justify-between border-t border-line pt-4 font-mono text-[11px] uppercase tracking-[0.18em]">
                  <span className="text-white">{r.author}</span>
                  <span className="text-muted">{r.source}</span>
                </figcaption>
              </motion.figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
