// v0.1 — /privacy
// UK GDPR-compliant Privacy Policy. Content driven from lib/legal.ts so it
// stays in sync with the form fields, retention, processors, etc.
import type { Metadata } from "next";
import { PageHeader } from "@/components/sections/PageHeader";
import { Footer } from "@/components/sections/Footer";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/seo";
import { brand } from "@/config/brand.config";
import { legal } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${brand.client.name} handles your personal data under UK GDPR.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Legal"
        title="Privacy Policy"
        subtitle={`How we handle your personal data. Effective ${legal.effectiveDate}.`}
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Privacy" }]}
      />

      <article className="border-b border-line py-16 md:py-24">
        <div className="container-x mx-auto max-w-3xl space-y-12 text-white/85">
          <Section title="1. Who we are">
            <p>
              {legal.controller.name} (“we”, “us”) is the data controller for personal information you provide through this website.
              Our trading address is {brand.contact.address.line1}, {brand.contact.address.city}, {brand.contact.address.postcode}.
            </p>
            <p className="text-muted">
              Business structure: {legal.controller.structure}.{" "}
              {legal.controller.companyNumber !== "TBD" && (
                <>Registered in {legal.controller.placeOfRegistration} under company number {legal.controller.companyNumber}, registered office {legal.controller.registeredOffice}. </>
              )}
              {legal.controller.icoNumber !== "TBD" && (
                <>ICO registration number {legal.controller.icoNumber}.</>
              )}
            </p>
          </Section>

          <Section title="2. What we collect, and why">
            <p>When you submit a quote request through this site, we ask for:</p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              {legal.formData.map((d) => (
                <li key={d.field}><strong>{d.field}</strong> — {d.purpose}.</li>
              ))}
            </ul>
            <p>We do not knowingly collect any other personal data from this website. We do not sell or rent personal data.</p>
          </Section>

          <Section title="3. Lawful basis for processing (UK GDPR)">
            <ul className="space-y-3">
              {legal.lawfulBasis.map((b) => (
                <li key={b.basis}>
                  <p className="font-medium text-white">{b.basis}</p>
                  <p className="text-muted">{b.what}</p>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="4. How long we keep it">
            <ul className="list-disc space-y-1 pl-6">
              <li>Quote enquiries: <strong>{legal.retention.quoteEnquiries}</strong>.</li>
              <li>Service / repair records: <strong>{legal.retention.serviceRecords}</strong> (statutory).</li>
              <li>Website access logs: <strong>{legal.retention.websiteLogs}</strong>.</li>
            </ul>
          </Section>

          <Section title="5. Who we share it with">
            <p>We use the following processors to operate the site and respond to your enquiries:</p>
            <ul className="mt-2 list-disc space-y-2 pl-6">
              {legal.processors.map((p) => (
                <li key={p.name}>
                  <strong>{p.name}</strong> — {p.purpose}. Location: {p.country}.{" "}
                  <a href={p.url} target="_blank" rel="noreferrer" className="text-accent underline decoration-accent/40 underline-offset-2">Privacy policy</a>.
                </li>
              ))}
            </ul>
            <p>We do not share your data with anyone else without your consent, except where required by law.</p>
          </Section>

          <Section title="6. Cookies">
            {legal.cookies.usesNonEssentialCookies ? (
              <>
                <p>This site uses the following non-essential cookies. You can withdraw consent at any time via the cookie banner.</p>
                <ul className="mt-2 list-disc space-y-1 pl-6">
                  {legal.cookies.list.map((c) => (
                    <li key={c.name}><code>{c.name}</code> — {c.purpose}. Duration: {c.duration}. Category: {c.category}.</li>
                  ))}
                </ul>
              </>
            ) : (
              <p>
                This site does <strong>not</strong> use tracking cookies, advertising cookies, or third-party analytics cookies.
                The map embed on the Contact page is served from <code>google.com/maps?output=embed</code> which sets functional cookies only when you interact with it.
                Fonts are bundled at build time and do not load from a third party at runtime.
              </p>
            )}
          </Section>

          <Section title="7. Your rights">
            <p>Under UK GDPR you have the right to:</p>
            <ul className="list-disc space-y-1 pl-6">
              <li>Access the personal data we hold about you</li>
              <li>Have inaccurate data corrected</li>
              <li>Request erasure of your data (subject to statutory record-keeping)</li>
              <li>Restrict or object to processing</li>
              <li>Receive a copy of your data in a portable format</li>
              <li>Withdraw consent at any time (where consent is the lawful basis)</li>
              <li>Lodge a complaint with the Information Commissioner's Office (<a href="https://ico.org.uk" target="_blank" rel="noreferrer" className="text-accent underline">ico.org.uk</a> · 0303 123 1113)</li>
            </ul>
            <p>
              To exercise any of these rights, email <a href={`mailto:${legal.controller.contactEmail}`} className="text-accent underline">{legal.controller.contactEmail}</a> or call {legal.controller.contactPhone}. We respond within one month.
            </p>
          </Section>

          <Section title="8. Security">
            <p>The site is served over HTTPS (TLS). Hosting is provided by Vercel, who operate ISO 27001-certified infrastructure with DDoS protection and edge-network filtering. We use strict transport security, content-security-policy and other standard security headers.</p>
          </Section>

          <Section title="9. Changes to this policy">
            <p>We may update this policy from time to time. The “effective” date above shows when it was last reviewed. Material changes will be announced on the homepage for 30 days.</p>
          </Section>

          <Section title="10. Contact us">
            <p>
              By email: <a href={`mailto:${legal.controller.contactEmail}`} className="text-accent underline">{legal.controller.contactEmail}</a><br />
              By phone: {legal.controller.contactPhone}<br />
              By post: {brand.contact.address.line1}, {brand.contact.address.city}, {brand.contact.address.postcode}
            </p>
          </Section>
        </div>
      </article>

      <Footer />
      <JsonLd data={breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Privacy", path: "/privacy" },
      ])} />
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-2xl tracking-tightish text-white">{title}</h2>
      <div className="mt-3 space-y-3 leading-relaxed">{children}</div>
    </section>
  );
}
