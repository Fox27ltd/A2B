/** @type {import('next').NextConfig} */
// v0.2 — Fox27 agency template baseline
// Security headers applied globally. These hit the relevant OWASP / NCSC
// recommendations for a small-business marketing site.
//
// CSP notes:
//   - 'self' for almost everything.
//   - Google Maps embed needs maps.google.com + maps.gstatic.com frames + images.
//   - data: URIs allowed for images (lucide / next/og output).
//   - Inline scripts allowed (Next.js requires this; we use a nonce-less default
//     because static export + edge OG is a closed system here).

const ContentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.gstatic.com https://*.googleusercontent.com",
  "font-src 'self' data:",
  "connect-src 'self' https://vitals.vercel-insights.com",
  "frame-src 'self' https://www.google.com https://maps.google.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self' mailto:",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy",   value: ContentSecurityPolicy },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options",    value: "nosniff" },
  { key: "X-Frame-Options",           value: "DENY" },
  { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy",        value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "X-DNS-Prefetch-Control",    value: "on" },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // remove the X-Powered-By: Next.js fingerprint
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
    ];
  },
};

export default nextConfig;
