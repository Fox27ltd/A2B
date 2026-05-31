// v0.1 — Site Nav
// Sticky top bar. Logotype left, primary links centre (desktop), phone + CTA right.
// Mobile: hamburger toggles a panel. Adds a hairline border once scrolled past 8px.
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Phone, Menu, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { brand } from "@/config/brand.config";

const links = [
  { href: "/servicing", label: "Servicing" },
  { href: "/repairs",   label: "Repairs"   },
  { href: "/mot",       label: "MOT"       },
  { href: "/reviews",   label: "Reviews"   },
  { href: "/about",     label: "About"     },
  { href: "/contact",   label: "Contact"   },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile panel on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-all duration-300",
        scrolled
          ? "border-b border-line bg-ink/80 backdrop-blur"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="container-x flex h-20 items-center justify-between md:h-24">
        <Link href="/" aria-label={brand.client.name} className="flex shrink-0 items-center">
          <Image
            src={brand.client.logoNav}
            alt={brand.client.name}
            width={340}
            height={116}
            priority
            className="h-14 w-auto md:h-16"
          />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "font-mono text-[11px] uppercase tracking-[0.18em] transition",
                  active ? "text-accent" : "text-muted hover:text-white"
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href={brand.ctas.secondary.href}
            className="flex items-center gap-2 text-sm text-white hover:text-accent"
          >
            <Phone className="h-4 w-4 text-accent" />
            {brand.contact.phone}
          </a>
          <Link
            href="/contact#quote"
            className="group inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-ink transition hover:bg-amber-400"
          >
            Get a quote
            <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
          </Link>
        </div>

        <button
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="rounded-full border border-line bg-surface/60 p-2 text-white backdrop-blur md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile panel */}
      {open && (
        <div className="border-t border-line bg-ink/95 backdrop-blur md:hidden">
          <div className="container-x py-4">
            <ul className="grid gap-1">
              {links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className={cn(
                      "block rounded-lg px-3 py-3 font-display text-lg tracking-tightish",
                      pathname === l.href ? "bg-surface text-accent" : "text-white hover:bg-surface/60"
                    )}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4 grid gap-2 border-t border-line pt-4">
              <a
                href={brand.ctas.secondary.href}
                className="flex items-center gap-2 rounded-full border border-line bg-surface/60 px-4 py-3 text-white"
              >
                <Phone className="h-4 w-4 text-accent" />
                {brand.contact.phone}
              </a>
              <Link
                href="/contact#quote"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-4 py-3 font-medium text-ink"
              >
                Get a quote
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
