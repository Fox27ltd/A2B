// v0.2 — <ScrollScrubber>
// Pinned, full-viewport canvas that plays an image sequence as the user scrolls.
// Now supports timed overlay "stops" — each stop maps to a scroll progress range
// and fades its content in/out. This lets the hero layer a caption, then a
// review, then a CTA across the scrub instead of a single static caption.
"use client";

import { useRef } from "react";
import { motion, useTransform, useScroll, useReducedMotion } from "framer-motion";
import { useScrollScrubber } from "@/hooks/useScrollScrubber";
import { cn } from "@/lib/cn";

export type ScrubStop = {
  /** Scroll progress 0..1 — fade in slightly before this. */
  from: number;
  /** Scroll progress 0..1 — fade out at this point. */
  to: number;
  content: React.ReactNode;
};

type Props = {
  framesPath: string;
  frameCount: number;
  height?: number;
  ext?: "webp" | "jpg" | "png";
  pad?: number;
  /** Optional single caption — kept for backwards-compat. */
  caption?: string;
  /** Layered stops timed to scroll progress through the scrub. */
  stops?: ScrubStop[];
  children?: React.ReactNode;
  className?: string;
};

export function ScrollScrubber({
  framesPath,
  frameCount,
  height = 3,
  caption,
  stops,
  ext = "webp",
  pad = 4,
  children,
  className,
}: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  const { loadProgress, ready, progress } = useScrollScrubber(
    sectionRef,
    canvasRef,
    { framesPath, frameCount, ext, pad }
  );

  // Back-compat: a plain `caption` becomes a single centre-of-scrub stop.
  const effectiveStops: ScrubStop[] =
    stops ??
    (caption
      ? [
          {
            from: 0.25,
            to: 0.75,
            content: (
              <p className="font-display text-3xl tracking-tightish text-white md:text-5xl">
                {caption}
              </p>
            ),
          },
        ]
      : []);

  return (
    <section
      ref={sectionRef}
      className={cn("relative w-full", className)}
      style={{ height: `${height * 100}vh` }}
      aria-label="Dashboard warning lights scroll animation"
      data-scrub-progress={progress.toFixed(3)}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

        {/* Vignette so overlays read */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(15,20,25,0.92)_100%)]" />

        {/* Preloader */}
        {!ready && (
          <div className="absolute inset-0 grid place-items-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-1 w-40 overflow-hidden rounded-full bg-line">
                <div
                  className="h-full bg-accent transition-[width] duration-150"
                  style={{ width: `${Math.round(loadProgress * 100)}%` }}
                />
              </div>
              <p className="font-mono text-xs uppercase tracking-widest text-muted">
                Loading {Math.round(loadProgress * 100)}%
              </p>
            </div>
          </div>
        )}

        {/* Stops */}
        {effectiveStops.map((stop, i) => (
          <Stop key={i} stop={stop} sectionRef={sectionRef} reduce={!!reduce} />
        ))}

        {/* Persistent overlay slot */}
        {children && (
          <div className="pointer-events-none absolute inset-0 z-30">
            <div className="pointer-events-auto h-full">{children}</div>
          </div>
        )}
      </div>
    </section>
  );
}

function Stop({
  stop,
  sectionRef,
  reduce,
}: {
  stop: ScrubStop;
  sectionRef: React.RefObject<HTMLElement>;
  reduce: boolean;
}) {
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const lead = 0.05;
  const opacity = useTransform(
    scrollYProgress,
    [
      Math.max(0, stop.from - lead),
      stop.from,
      stop.to,
      Math.min(1, stop.to + lead),
    ],
    [0, 1, 1, 0]
  );
  const y = useTransform(
    scrollYProgress,
    [Math.max(0, stop.from - lead), stop.from],
    reduce ? [0, 0] : [16, 0]
  );

  return (
    <motion.div
      style={{ opacity, y }}
      className="pointer-events-none absolute inset-x-0 bottom-[14%] z-20 mx-auto max-w-3xl px-6 text-center"
    >
      <div className="pointer-events-auto">{stop.content}</div>
    </motion.div>
  );
}
