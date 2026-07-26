"use client";

/**
 * Meta-Pixel — sauber & consent-gated (§15).
 * - Pixel-ID aus NEXT_PUBLIC_META_PIXEL_ID.
 * - Lädt NUR, wenn Consent „Marketing" = true (kein Load im initialen HTML).
 * - PageView nach Consent auf allen Seiten.
 * - Das `Lead`-Event feuert genau einmal auf `/danke` (siehe trackLead()).
 * - `/admin/*` ist vom Tracking ausgenommen.
 */

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useConsent } from "./ConsentProvider";

// Nur die öffentliche Pixel-ID direkt lesen (kein Import des Server-ENV-Moduls,
// damit keine serverseitigen Variablennamen ins Client-Bundle gelangen).
const PIXEL_ID = (process.env.NEXT_PUBLIC_META_PIXEL_ID || "").trim();
// Zweiter Pixel — feuert ausschließlich auf der Danke-/Conversion-Seite.
const DANKE_PIXEL_ID = (process.env.NEXT_PUBLIC_META_PIXEL_ID_DANKE || "").trim();

export function MetaPixel() {
  const { marketingAllowed } = useConsent();
  const pathname = usePathname();
  const initialized = useRef(false);
  const dankeInitialized = useRef(false);

  const isAdmin = pathname?.startsWith("/admin");
  const active = Boolean(PIXEL_ID) && marketingAllowed && !isAdmin;

  // PageView bei Navigationen (nach erstmaliger Initialisierung).
  useEffect(() => {
    if (!active) return;
    if (!initialized.current) return; // erste PageView macht das Init-Script
    if (typeof window !== "undefined" && typeof window.fbq === "function") {
      window.fbq("track", "PageView");
    }
  }, [pathname, active]);

  // Zweiter Pixel nur auf /danke: einmalig initialisieren und dort eine eigene
  // PageView senden (trackSingle → zählt ausschließlich auf diesen Pixel).
  useEffect(() => {
    if (!active || !DANKE_PIXEL_ID) return;
    if (pathname !== "/danke") return;
    if (dankeInitialized.current) return;

    let tries = 0;
    const id = setInterval(() => {
      if (typeof window !== "undefined" && typeof window.fbq === "function") {
        clearInterval(id);
        dankeInitialized.current = true;
        window.fbq("init", DANKE_PIXEL_ID);
        window.fbq("trackSingle", DANKE_PIXEL_ID, "PageView");
      } else if (++tries > 40) {
        clearInterval(id); // Pixel-Script nicht verfügbar (z. B. Blocker)
      }
    }, 150);
    return () => clearInterval(id);
  }, [pathname, active]);

  if (!active) return null;

  return (
    <Script
      id="meta-pixel"
      strategy="afterInteractive"
      onLoad={() => {
        initialized.current = true;
      }}
      dangerouslySetInnerHTML={{
        __html: `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${PIXEL_ID}');
          fbq('track', 'PageView');
        `,
      }}
    />
  );
}
