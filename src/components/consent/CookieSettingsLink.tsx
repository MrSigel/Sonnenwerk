"use client";

import { useConsent } from "./ConsentProvider";

/**
 * Dezenter „Cookie-Einstellungen"-Link (§14): öffnet das Consent-Banner erneut.
 */
export function CookieSettingsLink({ className }: { className?: string }) {
  const { openBanner } = useConsent();
  return (
    <button type="button" onClick={openBanner} className={className}>
      Cookie-Einstellungen
    </button>
  );
}
