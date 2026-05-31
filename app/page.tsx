// v0.3 — Homepage. Hero scrub + trust strip + quote/contact + map + footer.
import { Hero } from "@/components/sections/Hero";
import { TrustStrip } from "@/components/sections/TrustStrip";
import { QuoteContact } from "@/components/sections/QuoteContact";
import { FindUs } from "@/components/sections/FindUs";
import { Footer } from "@/components/sections/Footer";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <TrustStrip />
      <QuoteContact />
      <FindUs />
      <Footer />
    </main>
  );
}
