import { ImageResponse } from "next/og";

/**
 * Branded Social-/Open-Graph-Vorschaubild (1200×630).
 * Wird von Next automatisch als og:image (und via twitter-image für Twitter/X)
 * eingebunden. Jägergrün/Weiß, im Marken-Look.
 */
export const alt = "Sonnenwerk – Geprüfte Solar-Angebote aus Ihrer Region.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#1F4A38",
          color: "#FFFFFF",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Wortmarke mit aufgehender Sonne */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <svg width="72" height="60" viewBox="0 0 72 60">
            <line x1="4" y1="46" x2="68" y2="46" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
            <path d="M16 46 A20 20 0 0 1 56 46 Z" fill="#FFFFFF" />
            <g stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round">
              <line x1="36" y1="4" x2="36" y2="14" />
              <line x1="14" y1="12" x2="19" y2="20" />
              <line x1="58" y1="12" x2="53" y2="20" />
            </g>
          </svg>
          <span style={{ fontSize: 40, fontWeight: 700, letterSpacing: "0.02em" }}>
            Sonnenwerk
          </span>
        </div>

        {/* Headline — je ein Satz pro Zeile (konsistent mit dem Hero) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <span style={{ fontSize: 66, fontWeight: 700, lineHeight: 1.12 }}>
            Ihre Solaranlage.
          </span>
          <span style={{ fontSize: 66, fontWeight: 700, lineHeight: 1.12 }}>
            Mehrere Angebote.
          </span>
          <span style={{ fontSize: 66, fontWeight: 700, lineHeight: 1.12 }}>
            Eine Anfrage.
          </span>
        </div>

        {/* Slogan / USP */}
        <div style={{ display: "flex", fontSize: 30, color: "rgba(255,255,255,0.82)" }}>
          Geprüfte Fachbetriebe aus Ihrer Region · kostenlos · in 24–48 Stunden
        </div>
      </div>
    ),
    { ...size }
  );
}
