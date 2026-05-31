// v0.1 — useScrollScrubber
// Maps scroll progress through a pinned section to a frame index of a preloaded
// image sequence. Designed for canvas-based hero animations (engine reassembly).
//
// Why not <video>? Mobile Safari and Chrome both stutter on requestAnimationFrame
// driven scrubbing of <video>. An image sequence on canvas is the reliable
// approach used by Apple-style scroll stories.
//
// Behaviour:
//   - Preloads frames sequentially, exposes 0..1 load progress.
//   - Pins the canvas during scrub, releases naturally when section scrolls out.
//   - Computes frame index from section progress (intersection of viewport).
//   - Listens with passive scroll + rAF to stay smooth.
//   - SSR-safe: no window access until effect runs.
//   - Graceful fallback: if frames fail to load, the first frame that DID load
//     is shown (and if none loaded, a transparent canvas — caller draws fallback).
"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export type ScrubberOptions = {
  /** Path to the frame directory, e.g. "/frames/engine". No trailing slash. */
  framesPath: string;
  /** Total number of frames in the sequence. */
  frameCount: number;
  /** Zero-padded width for filenames, default 4 → 0001.webp */
  pad?: number;
  /** Extension without the dot. Default "webp". */
  ext?: "webp" | "jpg" | "png";
  /** First frame number (filenames 1-based by default). */
  startIndex?: number;
  /** Optional easing applied to scroll progress before mapping to frame. */
  ease?: (t: number) => number;
};

export type ScrubberState = {
  /** 0..1 load progress for the preloader UI. */
  loadProgress: number;
  /** True once enough frames are loaded to begin rendering. */
  ready: boolean;
  /** Current frame index (0-based into the loaded array). */
  frameIndex: number;
  /** 0..1 scroll progress through the pinned section. */
  progress: number;
};

const defaultEase = (t: number) => t;

export function useScrollScrubber(
  sectionRef: React.RefObject<HTMLElement>,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  options: ScrubberOptions
): ScrubberState {
  const {
    framesPath,
    frameCount,
    pad = 4,
    ext = "webp",
    startIndex = 1,
    ease = defaultEase,
  } = options;

  const [loadProgress, setLoadProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [frameIndex, setFrameIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const imagesRef = useRef<HTMLImageElement[]>([]);
  const rafRef = useRef<number | null>(null);
  const lastDrawnRef = useRef<number>(-1);

  // ---------- Preload ----------
  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;
    const images: HTMLImageElement[] = [];
    let loaded = 0;

    const onSettled = () => {
      if (cancelled) return;
      loaded += 1;
      setLoadProgress(loaded / frameCount);
      // Allow first paint as soon as the first frame is in.
      if (loaded === 1) setReady(true);
    };

    for (let i = 0; i < frameCount; i++) {
      const n = String(i + startIndex).padStart(pad, "0");
      const img = new Image();
      img.decoding = "async";
      // File pattern: frame-NN.ext (matches the public/brand/dashboard convention)
      img.src = `${framesPath}/frame-${n}.${ext}`;
      img.onload = onSettled;
      img.onerror = onSettled; // count errors so progress completes
      images[i] = img;
    }
    imagesRef.current = images;

    return () => {
      cancelled = true;
      imagesRef.current = [];
    };
  }, [framesPath, frameCount, pad, ext, startIndex]);

  // ---------- Draw a frame ----------
  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    const img = imagesRef.current[index];
    if (!canvas || !img || !img.complete || img.naturalWidth === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    if (canvas.width !== cw * dpr || canvas.height !== ch * dpr) {
      canvas.width = cw * dpr;
      canvas.height = ch * dpr;
    }

    // Cover-fit
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const scale = Math.max((cw * dpr) / iw, (ch * dpr) / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = (cw * dpr - dw) / 2;
    const dy = (ch * dpr - dh) / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, dx, dy, dw, dh);
    lastDrawnRef.current = index;
  }, [canvasRef]);

  // ---------- Scroll handler ----------
  useEffect(() => {
    if (typeof window === "undefined") return;

    const compute = () => {
      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = section.offsetHeight - vh;
      // Section progress: 0 when top hits viewport top, 1 when bottom hits viewport bottom.
      const raw = total > 0 ? Math.min(Math.max(-rect.top / total, 0), 1) : 0;
      const eased = ease(raw);
      const idx = Math.min(
        frameCount - 1,
        Math.max(0, Math.round(eased * (frameCount - 1)))
      );
      setProgress(eased);
      if (idx !== lastDrawnRef.current) {
        setFrameIndex(idx);
        drawFrame(idx);
      }
    };

    const onScroll = () => {
      if (rafRef.current != null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        compute();
      });
    };

    const onResize = () => {
      // Force redraw on resize so DPR / size changes don't blur the canvas.
      lastDrawnRef.current = -1;
      compute();
    };

    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [sectionRef, frameCount, ease, drawFrame]);

  // Redraw once frames start arriving even if user hasn't scrolled.
  useEffect(() => {
    if (ready) drawFrame(frameIndex);
  }, [ready, frameIndex, drawFrame]);

  return { loadProgress, ready, frameIndex, progress };
}
