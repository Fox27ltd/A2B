// v0.1 — TrustStrip
// Compact band of credibility markers, four cells separated by hairlines.
"use client";

import { ShieldCheck, Star, Users, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { brand } from "@/config/brand.config";

const icons = [ShieldCheck, Star, Users, MapPin];

export function TrustStrip() {
  return (
    <section className="border-y border-line bg-surface/50">
      <div className="container-x grid grid-cols-2 md:grid-cols-4">
        {brand.trust.map((label, i) => {
          const Icon = icons[i] ?? ShieldCheck;
          return (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="flex items-center gap-3 border-line py-5 md:py-6 md:[&:not(:last-child)]:border-r md:px-6 [&:nth-child(odd)]:border-r [&:nth-child(-n+2)]:border-b md:[&:nth-child(-n+2)]:border-b-0"
            >
              <Icon className="h-5 w-5 text-accent" />
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-white">
                {label}
              </span>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
