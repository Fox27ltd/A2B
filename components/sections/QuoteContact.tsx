// v0.2 — QuoteContact
// Phone-first quote section. Form submits via mailto: pre-filled to a2b inbox
// until Formspree / Resend / server action is wired (see client_questions.md #11).
//
// Anti-spam (Phase 7b):
//   - Honeypot field "company" hidden from humans (CSS + tabIndex + aria-hidden).
//     Bots tend to fill every input; if "company" is non-empty we silently abort.
//   - Minimum render-to-submit time of 1.5s — instant submits are bots.
//   - Privacy notice + consent below the submit button (PECR/GDPR clarity).
"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Phone, Mail, Clock, Send, CheckCircle2 } from "lucide-react";
import { brand } from "@/config/brand.config";

const services = brand.repairs.map(r => r.name);
const MIN_MS_TO_SUBMIT = 1500;

const services_with_fallback = [...services, "Not sure — please advise"];

export function QuoteContact() {
  const [sent, setSent] = useState(false);
  const mountedAt = useRef<number>(Date.now());

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);

    // Honeypot — bots fill this; humans never see it.
    if (String(data.get("company") || "").trim() !== "") return;

    // Too-fast submit guard
    if (Date.now() - mountedAt.current < MIN_MS_TO_SUBMIT) return;

    const name    = String(data.get("name") || "");
    const phone   = String(data.get("phone") || "");
    const reg     = String(data.get("reg") || "");
    const service = String(data.get("service") || "");
    const message = String(data.get("message") || "");
    const subject = `Quote request — ${service || "general"}${reg ? ` (${reg.toUpperCase()})` : ""}`;
    const body = [
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Vehicle reg: ${reg}`,
      `Service: ${service}`,
      "",
      "Details:",
      message,
      "",
      "— sent via a2bautocentre.com",
    ].join("\n");
    const url = `mailto:${brand.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
    setSent(true);
  }

  return (
    <section id="quote" className="relative border-b border-line bg-ink py-20 md:py-28">
      <div className="container-x grid gap-10 md:grid-cols-5">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="md:col-span-3"
        >
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
            Get a quote
          </p>
          <h2 className="mt-3 font-display text-4xl leading-tight tracking-tighter2 text-white md:text-5xl">
            Tell us what your car needs.
          </h2>
          <p className="mt-4 max-w-prose text-muted">
            Fastest answer is a call — {" "}
            <a href={brand.ctas.secondary.href} className="text-white underline decoration-accent/60 underline-offset-4 hover:text-accent">
              {brand.contact.phone}
            </a>
            . Or fill this in and we'll come back to you. No obligation, no upsell.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 grid gap-4 sm:grid-cols-2" noValidate>
            {/* Honeypot — hidden from humans + assistive tech */}
            <div aria-hidden className="hidden">
              <label>
                Company (leave blank)
                <input type="text" name="company" tabIndex={-1} autoComplete="off" />
              </label>
            </div>

            <Field name="name" label="Your name" required autoComplete="name" />
            <Field name="phone" label="Phone" type="tel" required autoComplete="tel" />
            <Field name="reg" label="Vehicle reg (optional)" placeholder="e.g. AB12 CDE" autoComplete="off" />
            <SelectField name="service" label="Service" options={services_with_fallback} />
            <div className="sm:col-span-2">
              <Field
                name="message"
                label="What's the issue or job?"
                as="textarea"
                placeholder="e.g. MOT due 14 June, clutch feels heavy, warning light came on…"
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-medium text-ink transition hover:bg-amber-400"
              >
                {sent ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Opened in your mail app
                  </>
                ) : (
                  <>
                    Send request
                    <Send className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
              <p className="mt-3 text-xs text-muted">
                Submitting opens your mail app pre-filled — we typically reply same working day.
                By sending, you agree to our{" "}
                <Link href="/privacy" className="underline decoration-accent/50 underline-offset-2 hover:text-accent">Privacy Policy</Link>.
              </p>
            </div>
          </form>
        </motion.div>

        <motion.aside
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="md:col-span-2"
        >
          <div className="rounded-2xl border border-line bg-surface/60 p-6">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
              Opening hours
            </p>
            <div className="mt-4 divide-y divide-line">
              {brand.hours.map((row) => (
                <div key={row.day} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="text-white">{row.day}</span>
                  <span className={row.open ? "font-mono text-muted" : "font-mono text-accent/80"}>
                    {row.open ? `${row.open} – ${row.close}` : "Closed"}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3 border-t border-line pt-6 text-sm">
              <a href={brand.ctas.secondary.href} className="flex items-center gap-3 text-white hover:text-accent">
                <Phone className="h-4 w-4 text-accent" />
                {brand.contact.phone}
              </a>
              <a href={`mailto:${brand.contact.email}`} className="flex items-center gap-3 text-white hover:text-accent">
                <Mail className="h-4 w-4 text-accent" />
                {brand.contact.email}
              </a>
              <p className="flex items-start gap-3 text-muted">
                <Clock className="mt-0.5 h-4 w-4 text-accent" />
                Walk-ins welcome during opening hours.
              </p>
            </div>
          </div>
        </motion.aside>
      </div>
    </section>
  );
}

/* ----- Inputs ----- */

function Field({
  name,
  label,
  type = "text",
  required,
  placeholder,
  as,
  autoComplete,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  as?: "textarea";
  autoComplete?: string;
}) {
  const common =
    "w-full rounded-xl border border-line bg-surface/40 px-4 py-3 text-white placeholder:text-muted/70 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30";
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
        {label}
        {required && <span className="text-accent"> *</span>}
      </span>
      {as === "textarea" ? (
        <textarea
          name={name}
          rows={4}
          required={required}
          placeholder={placeholder}
          className={common}
        />
      ) : (
        <input
          name={name}
          type={type}
          required={required}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={common}
        />
      )}
    </label>
  );
}

function SelectField({
  name,
  label,
  options,
}: {
  name: string;
  label: string;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
        {label}
      </span>
      <select
        name={name}
        className="w-full rounded-xl border border-line bg-surface/40 px-4 py-3 text-white focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        defaultValue=""
      >
        <option value="" disabled>Choose a service…</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}
