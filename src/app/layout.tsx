import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BRAND } from "@/lib/content";
import { siteUrl } from "@/lib/env";
import { ConsentProvider } from "@/components/consent/ConsentProvider";
import { ConsentBanner } from "@/components/consent/ConsentBanner";
import { MetaPixel } from "@/components/consent/MetaPixel";
import { Tracker } from "@/components/analytics/Tracker";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { ExitIntentBanner } from "@/components/marketing/ExitIntentBanner";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${BRAND.name} – ${BRAND.slogan}`,
    template: `%s · ${BRAND.name}`,
  },
  description:
    "Wir holen für Sie unterschiedliche Angebote von geprüften Solar-Fachbetrieben aus Ihrer Region ein – kostenlos, unverbindlich und innerhalb von 24–48 Stunden.",
  applicationName: BRAND.name,
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: BRAND.name,
    title: `${BRAND.name} – ${BRAND.slogan}`,
    description:
      "Ihre Solaranlage. Mehrere Angebote. Eine Anfrage. Geprüfte Fachbetriebe aus Ihrer Region.",
  },
};

export const viewport: Viewport = {
  themeColor: "#1F4A38",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className={inter.variable}>
      <body>
        <ConsentProvider>
          {children}
          <ScrollToTop />
          <ExitIntentBanner />
          <ConsentBanner />
          <MetaPixel />
          <Tracker />
        </ConsentProvider>
      </body>
    </html>
  );
}
