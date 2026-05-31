// v0.1 — /cookies
// Plain-English cookie statement. We don't use tracking cookies today; this
// page tells the truth about what's actually set, satisfying PECR transparency.
import type { Metadata } from "next";
import { PageHeader } from "@/components/sections/PageHeader";
import { Footer } from "@/components/sections/Footer";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/seo";
import { brand } from "@/config/brand.config";
import { legal } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Cookies",
  description: `Cookie statement for ${brand.client.name}.`,
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  const tracksAny = legal.cookies.usesNonEssentialCookies;

  return (
    <main>
      <PageHeader
        eyebrow="Legal"
        title="Cookies"
        subtitle={`Effective ${legal.effectiveDate}.`}
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Cookies" }]}
      />

      <article className="border-b border-line py-16 md:py-24">
        <div className="container-x mx-auto max-w-3xl space-y-12 text-white/85">
          <Section title="What's a cookie?">
            <p>A cookie is a small text file a website saves on your device to remember things — like that you've already dismissed a banner, or that you're logged in.</p>
          </Section>

          <Section title="What this site uses">
            {tracksAny ? (
              <>
                <p>This site sets the following cookies:</p>
                <table className="mt-3 w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-line text-left text-muted">
                      <th className="py-2 pr-3">Name</th>
                      <th className="py-2 pr-3">Purpose</th>
                      <th className="py-2 pr-3">Duration</th>
                      <th className="py-2">Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {legal.cookies.list.map((c) => (
                      <tr key={c.name} className="border-b border-line/60">
                        <td className="py-2 pr-3 font-mono text-xs">{c.name}</td>
                        <td className="py-2 pr-3">{c.purpose}</td>
                        <td className="py-2 pr-3">{c.duration}</td>
                        <td className="py-2">{c.category}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            ) : (
              <>
                <p>
                  <strong className="text-white">We don't set any tracking, advertising or analytics cookies on this site.</strong>
                </p>
                <p>
                  The Google Maps embed on the Contact page may set functional cookies once you interact with it (to remember zoom level, accept-language etc.) — those are set by Google, not by us. Their cookie policy is here:{" "}
                  <a href="https://policies.google.com/technologies/cookies" target="_blank" rel="noreferrer" className="text-accent underline">policies.google.com/technologies/cookies</a>.
                </p>
                <p>
                  If we add analytics in future, we'll add a consent banner first and update this page.
                </p>
              </>
            )}
          </Section>

          <Section title="Controlling cookies">
            <p>
              You can block or delete cookies through your browser settings. Browser support pages: {" "}
              <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noreferrer" className="text-accent underline">Chrome</a> ·{" "}
              <a href="https://support.apple.com/en-gb/guide/safari/sfri11471/mac" target="_blank" rel="noreferrer" className="text-accent underline">Safari</a> ·{" "}
              <a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noreferrer" className="text-accent underline">Firefox</a>.
            </p>
          </Section>
        </div>
      </article>

      <Footer />
      <JsonLd data={breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Cookies", path: "/cookies" },
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
