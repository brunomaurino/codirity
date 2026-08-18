import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

// Generated 1200x630 Open Graph image (also used as the Twitter card fallback).
// Monthly Club palette (redesign v3, HANDOFF-redesign-v3 §1.1): forest-to-green
// blob-style gradient background, white title, gold accent dot, mint tagline.
export const alt = "Codirity — your AI & automation team, on subscription";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #0B4E30 0%, #189656 60%, #1CAE6B 100%)",
          padding: "96px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "22px" }}>
          <div
            style={{
              fontSize: 96,
              fontWeight: 800,
              color: "#FFFFFF",
              letterSpacing: "-0.03em",
            }}
          >
            {SITE_NAME}
          </div>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: "9999px",
              background: "#E8A93D",
            }}
          />
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 44,
            lineHeight: 1.25,
            color: "#DFF6E9",
            maxWidth: 900,
            fontWeight: 500,
          }}
        >
          Your AI &amp; automation team, on subscription. Unlimited requests,
          one flat monthly rate.
        </div>
        <div
          style={{
            marginTop: 44,
            fontSize: 26,
            color: "#7CE3B2",
            fontWeight: 600,
            letterSpacing: "0.02em",
          }}
        >
          codirity.com
        </div>
      </div>
    ),
    { ...size }
  );
}
