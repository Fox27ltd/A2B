// v0.2 — Dynamic OG image for the homepage (1200x630).
// Top-right: brand logo badge. Rest: tagline, credentials, NAP line.
// Reused for Twitter cards via the layout config.
import { ImageResponse } from "next/og";
import { brand } from "@/config/brand.config";
import { SITE_URL } from "@/lib/seo";

export const runtime = "edge";
export const alt = `${brand.client.name} — ${brand.seo.siteDescription}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG() {
  // Fetch the brand logo so we can embed it in the OG card.
  let logoSrc: string | null = null;
  try {
    const res = await fetch(new URL("/brand/logo-clean.png", SITE_URL));
    if (res.ok) {
      const buf = await res.arrayBuffer();
      const b64 = Buffer.from(buf).toString("base64");
      logoSrc = `data:image/png;base64,${b64}`;
    }
  } catch {
    // If unreachable (e.g. first preview deploy), fall back to text mark.
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background:
            "radial-gradient(ellipse at 80% 20%, rgba(243,156,18,0.18), transparent 60%), #0F1419",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{ width: 12, height: 12, borderRadius: 999, background: "#F39C12" }}
            />
            <div
              style={{
                fontSize: 18,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: "#F39C12",
              }}
            >
              RAC Approved · Rainham, London · Est. {brand.client.yearEstablished}
            </div>
          </div>
          {logoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoSrc} alt="" width={320} height={110} />
          ) : null}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ fontSize: 96, lineHeight: 1.02, fontWeight: 700, letterSpacing: -2 }}>
            {brand.client.name}
          </div>
          <div style={{ fontSize: 44, lineHeight: 1.1, color: "#F39C12", fontWeight: 600 }}>
            {brand.client.tagline}.
          </div>
          <div style={{ fontSize: 26, color: "#9AA3AD", maxWidth: 900 }}>
            MOT from £35 · Servicing · Diagnostics · Repairs
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 22,
            color: "#9AA3AD",
            borderTop: "1px solid #252B33",
            paddingTop: 24,
          }}
        >
          <div>{brand.contact.phone}</div>
          <div>
            {brand.contact.address.line1}, {brand.contact.address.city}, {brand.contact.address.postcode}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
