"use client";

/**
 * Consent-Verwaltung (§14). Leichtgewichtig, First-Party.
 * Speichert die Auswahl in einem Cookie `sw_consent` (6 Monate) + localStorage.
 * Stellt den Status global bereit, damit der Meta-Pixel (§15) nur nach
 * ausdrücklicher Marketing-Einwilligung lädt.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type ConsentValue = {
  necessary: true; // immer an, nicht abwählbar
  marketing: boolean; // Meta-Pixel etc. — Default AUS
};

type ConsentState = {
  /** Auswahl getroffen? (Banner sonst anzeigen) */
  decided: boolean;
  consent: ConsentValue;
  marketingAllowed: boolean;
  bannerOpen: boolean;
  openBanner: () => void;
  closeBanner: () => void;
  acceptAll: () => void;
  rejectAll: () => void;
  save: (marketing: boolean) => void;
};

const COOKIE_NAME = "sw_consent";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30 * 6; // ~6 Monate

const ConsentContext = createContext<ConsentState | null>(null);

function writeCookie(value: ConsentValue) {
  if (typeof document === "undefined") return;
  const payload = encodeURIComponent(JSON.stringify(value));
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE_NAME}=${payload}; Max-Age=${MAX_AGE_SECONDS}; Path=/; SameSite=Lax${secure}`;
}

function clearMarketingCookies() {
  if (typeof document === "undefined") return;
  // Bekannte Meta-Pixel-Cookies bei Widerruf entfernen.
  for (const name of ["_fbp", "_fbc"]) {
    document.cookie = `${name}=; Max-Age=0; Path=/`;
  }
}

function readStored(): ConsentValue | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(COOKIE_NAME);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { necessary: true, marketing: Boolean(parsed?.marketing) };
    }
  } catch {
    /* ignore */
  }
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`)
  );
  if (match) {
    try {
      const parsed = JSON.parse(decodeURIComponent(match[1]));
      return { necessary: true, marketing: Boolean(parsed?.marketing) };
    } catch {
      /* ignore */
    }
  }
  return null;
}

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [decided, setDecided] = useState(false);
  const [consent, setConsent] = useState<ConsentValue>({
    necessary: true,
    marketing: false,
  });
  const [bannerOpen, setBannerOpen] = useState(false);

  useEffect(() => {
    const stored = readStored();
    if (stored) {
      setConsent(stored);
      setDecided(true);
    } else {
      setBannerOpen(true);
    }
  }, []);

  const persist = useCallback((value: ConsentValue) => {
    setConsent(value);
    setDecided(true);
    setBannerOpen(false);
    writeCookie(value);
    try {
      window.localStorage.setItem(COOKIE_NAME, JSON.stringify(value));
    } catch {
      /* ignore */
    }
    if (!value.marketing) clearMarketingCookies();
  }, []);

  const acceptAll = useCallback(
    () => persist({ necessary: true, marketing: true }),
    [persist]
  );
  const rejectAll = useCallback(
    () => persist({ necessary: true, marketing: false }),
    [persist]
  );
  const save = useCallback(
    (marketing: boolean) => persist({ necessary: true, marketing }),
    [persist]
  );

  const value = useMemo<ConsentState>(
    () => ({
      decided,
      consent,
      marketingAllowed: decided && consent.marketing,
      bannerOpen,
      openBanner: () => setBannerOpen(true),
      closeBanner: () => setBannerOpen(false),
      acceptAll,
      rejectAll,
      save,
    }),
    [decided, consent, bannerOpen, acceptAll, rejectAll, save]
  );

  return (
    <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
  );
}

export function useConsent(): ConsentState {
  const ctx = useContext(ConsentContext);
  if (!ctx) {
    throw new Error("useConsent muss innerhalb von <ConsentProvider> genutzt werden");
  }
  return ctx;
}
