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
        // Admin-Bereich und Danke-Seite nie indexieren
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/danke",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
