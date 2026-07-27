/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Next.js Dev-Tools-Indicator (rundes dunkles „N"-Badge unten links) ausblenden.
  // Erscheint ohnehin nur bei `next dev`, hier zusätzlich komplett deaktiviert.
  devIndicators: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        // Danke-Seite nie indexieren
        source: "/danke",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        // Analytics-Bereich nie indexieren und nicht zwischenspeichern
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Cache-Control", value: "no-store, max-age=0" },
        ],
      },
    ];
  },
};

export default nextConfig;
