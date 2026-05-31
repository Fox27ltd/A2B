import type { Config } from "tailwindcss";
import { brand } from "./config/brand.config";

// v0.1 — Reads tokens from brand.config so per-client retheming is one file.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: brand.colors.ink,
        accent: brand.colors.accent,
        surface: brand.colors.surface,
        muted: brand.colors.muted,
        line: brand.colors.line,
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        tightish: "-0.01em",
        tighter2: "-0.03em",
      },
      maxWidth: {
        container: "1280px",
      },
    },
  },
  plugins: [],
};
export default config;
