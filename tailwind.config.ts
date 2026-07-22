import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Design-Tokens §3 — Jägergrün + Weiß, sonst nichts
        paper: "#FFFFFF", // reines Weiß, Haupthintergrund
        "paper-sunk": "#F4F7F5", // minimal kühl abgesetzte Flächen
        ink: "#0F1A15", // fast-schwarze, grünstichige Tinte (Haupttext)
        "ink-soft": "#47514B", // Sekundärtext
        line: "#E3E8E4", // Hairline-Rahmen / Divider
        accent: "#1F4A38", // JÄGERGRÜN — der einzige Akzent
        "accent-hover": "#183B2C",
        "accent-ink": "#FFFFFF", // Text auf Jägergrün-Flächen
      },
      fontFamily: {
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontSize: {
        // Type-Scale §3
        "hero-h1": [
          "clamp(2.5rem, 5vw, 4.25rem)",
          { lineHeight: "1.03", letterSpacing: "-0.02em", fontWeight: "700" },
        ],
        h2: [
          "clamp(1.75rem, 3vw, 2.5rem)",
          { lineHeight: "1.1", letterSpacing: "-0.015em", fontWeight: "700" },
        ],
        h3: ["1.25rem", { lineHeight: "1.25", fontWeight: "600" }],
        body: ["1.0625rem", { lineHeight: "1.6", fontWeight: "400" }],
        small: ["0.9375rem", { lineHeight: "1.5" }],
      },
      borderRadius: {
        card: "14px",
      },
      maxWidth: {
        content: "1320px",
      },
    },
  },
  plugins: [],
};

export default config;
