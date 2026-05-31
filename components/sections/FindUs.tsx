// v0.1 — FindUs
// Google Maps embed (no API key needed for the public embed URL) + address card.
"use client";

import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Navigation } from "lucide-react";
import { brand } from "@/config/brand.config";

const { address, mapsQuery, phone, email } = brand.contact;
const mapEmbed = `https://www.google.com/maps?q=${encodeURIComponent(mapsQuery)}&output=embed`;
const mapDirections = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapsQuery)}`;

export function FindUs() {
  return (
    <section id="find-us" className="border-b border-line bg-surface/40 py-20 md:py-28">
      <div className="container-x">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Find us</p>
          <h2 className="mt-3 font-display text-4xl leading-tight tracking-tighter2 text-white md:text-5xl">
            On Upminster Road South, Rainham.
          </h2>
          <p className="mt-4 text-muted">
            Free customer parking. Two minutes from the A1306. Walk-ins welcome during opening hours.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 lg:grid-cols-5">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-3"
          >
            <div className="overflow-hidden rounded-2xl border border-line">
              <iframe
                title="A2B Autocentre location"
                src={mapEmbed}
                width="100%"
                height="440"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="block h-[360px] w-full md:h-[440px]"
              />
            </div>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="flex h-full flex-col rounded-2xl border border-line bg-ink p-6">
              <div className="flex items-start gap-3">
                <MapPin className="mt-1 h-5 w-5 text-accent" />
                <address className="not-italic text-white">
                  <div className="font-display text-xl tracking-tightish">{brand.client.name}</div>
                  <div className="mt-1 text-muted">{address.line1}</div>
                  <div className="text-muted">
                    {address.city}, {address.region} {address.postcode}
                  </div>
                </address>
              </div>

              <div className="mt-6 space-y-3 text-sm">
                <a href={brand.ctas.secondary.href} className="flex items-center gap-3 text-white hover:text-accent">
                  <Phone className="h-4 w-4 text-accent" />
                  {phone}
                </a>
                <a href={`mailto:${email}`} className="flex items-center gap-3 text-white hover:text-accent">
                  <Mail className="h-4 w-4 text-accent" />
                  {email}
                </a>
              </div>

              <a
                href={mapDirections}
                target="_blank"
                rel="noreferrer"
                className="group mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 font-medium text-ink transition hover:bg-amber-400"
              >
                <Navigation className="h-4 w-4" />
                Get directions
              </a>
            </div>
          </motion.aside>
        </div>
      </div>
    </section>
  );
}
