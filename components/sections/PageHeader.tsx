// v0.1 — Sub-page header band
// Compact hero for non-home pages. Title, subtitle, optional eyebrow, breadcrumb.
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  breadcrumb?: { label: string; href?: string }[];
  bgImage?: string;
};

export function PageHeader({ eyebrow, title, subtitle, breadcrumb, bgImage }: Props) {
  return (
    <section className="relative overflow-hidden border-b border-line">
      {bgImage && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25"
            style={{ backgroundImage: `url(${bgImage})` }}
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/70 to-ink" />
        </>
      )}

      <div className="container-x relative z-10 pb-16 pt-32 md:pb-24 md:pt-40">
        {breadcrumb && (
          <ol className="mb-6 flex flex-wrap items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
            {breadcrumb.map((b, i) => (
              <li key={i} className="flex items-center gap-1.5">
                {b.href ? (
                  <Link href={b.href} className="hover:text-accent">{b.label}</Link>
                ) : (
                  <span>{b.label}</span>
                )}
                {i < breadcrumb.length - 1 && <ChevronRight className="h-3 w-3" />}
              </li>
            ))}
          </ol>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {eyebrow && (
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
              {eyebrow}
            </p>
          )}
          <h1 className="mt-3 max-w-4xl font-display text-5xl leading-[1.04] tracking-tighter2 text-white md:text-6xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-5 max-w-2xl text-lg text-muted">{subtitle}</p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
