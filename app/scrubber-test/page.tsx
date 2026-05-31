// v0.1 — /scrubber-test
// Phase 2 verification page. Uses 10 generated placeholder frames stored at
// public/frames/_placeholder/. Confirms preload, pin, scrub, caption, and the
// ‘no frames yet’ fallback still renders the preloader.
import { ScrollScrubber } from "@/components/scrubber/ScrollScrubber";

export default function ScrubberTestPage() {
  return (
    <main>
      <section className="container-x py-24">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          phase 2 / scrubber test
        </p>
        <h1 className="font-display text-4xl tracking-tighter2 mt-2">
          Scroll down to scrub →
        </h1>
        <p className="text-muted mt-3 max-w-prose">
          10 placeholder frames preload, then map to scroll progress. The pinned
          canvas releases when the section scrolls past.
        </p>
      </section>

      <ScrollScrubber
        framesPath="/frames/_placeholder"
        frameCount={10}
        ext="png"
        pad={2}
        height={3}
        caption="We understand every part of your car."
      />

      <section className="container-x py-24">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          section after scrub
        </p>
        <h2 className="font-display text-3xl tracking-tighter2 mt-2">
          Pin released. Page flow resumes.
        </h2>
      </section>
    </main>
  );
}
