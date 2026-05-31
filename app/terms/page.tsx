// v0.1 — /terms
// Website Terms of Use. NOT terms for the garage's repair work — those live
// on the workshop counter / signed work authorisation. These cover use of
// THIS WEBSITE: quote enquiries, content, liability, IP.
import type { Metadata } from "next";
import { PageHeader } from "@/components/sections/PageHeader";
import { Footer } from "@/components/sections/Footer";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/seo";
import { brand } from "@/config/brand.config";
import { legal } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: `Website terms for ${brand.client.name}.`,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Legal"
        title="Terms of Use"
        subtitle={`Effective ${legal.effectiveDate}. These terms cover use of this website only.`}
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Terms" }]}
      />

      <article className="border-b border-line py-16 md:py-24">
        <div className="container-x mx-auto max-w-3xl space-y-12 text-white/85">
          <Section title="1. Who runs this site">
            <p>
              This website is operated by {legal.controller.name} (“we”, “us”), trading from {brand.contact.address.line1}, {brand.contact.address.city}, {brand.contact.address.postcode}.
              By using the site you accept these terms.
            </p>
          </Section>

          <Section title="2. Quotes and bookings">
            <p>
              Any price shown on this site (including “MOT from £35”) is indicative and not a binding offer.
              We will provide a written quote before any work begins. Quotes are valid for 30 days unless stated otherwise.
              No contract is formed until you authorise the work in writing or in person at our premises.
            </p>
          </Section>

          <Section title="3. Use of the site">
            <p>The site is provided free of charge for personal, non-commercial use. You must not:</p>
            <ul className="list-disc space-y-1 pl-6">
              <li>Use the site to submit false, misleading or unlawful information</li>
              <li>Attempt to gain unauthorised access to any systems or data</li>
              <li>Interfere with the operation of the site, including via automated scraping or denial-of-service attempts</li>
              <li>Copy or reproduce the site's content (text, images, code) without our written permission</li>
            </ul>
          </Section>

          <Section title="4. Intellectual property">
            <p>
              All content on this site — including text, images, photography, logo, layout, and code — is owned by {legal.controller.name} or its licensors and is protected by UK and international copyright.
              The “RAC Approved” mark is a trademark of RAC Motoring Services and is used under licence.
            </p>
          </Section>

          <Section title="5. Accuracy">
            <p>
              We make reasonable efforts to keep prices, opening hours and service information up to date.
              Information on the site is provided on an “as is” basis. We may correct errors at any time without notice.
            </p>
          </Section>

          <Section title="6. Liability">
            <p>
              We do not exclude or limit liability for death or personal injury caused by negligence, fraud, or any other liability that cannot be excluded under UK law.
              Subject to the above, our maximum liability arising from your use of this website is limited to £100.
            </p>
            <p>
              The site contains links to third-party sites (e.g. Google Maps, the RAC). We are not responsible for the content or privacy practices of those sites.
            </p>
          </Section>

          <Section title="7. Privacy">
            <p>
              Your data is handled in accordance with our <a href="/privacy" className="text-accent underline">Privacy Policy</a>.
            </p>
          </Section>

          <Section title="8. Governing law">
            <p>
              These terms are governed by the laws of England and Wales. Any dispute will be subject to the exclusive jurisdiction of the courts of England and Wales.
            </p>
          </Section>

          <Section title="9. Contact">
            <p>
              {legal.controller.contactEmail} · {legal.controller.contactPhone}
            </p>
          </Section>
        </div>
      </article>

      <Footer />
      <JsonLd data={breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Terms", path: "/terms" },
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
