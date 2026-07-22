"use client";

/**
 * Consent-/Cookie-Banner (§14).
 * - „Alle akzeptieren" und „Ablehnen" gleichwertig (gleiche Größe/Gewicht).
 * - Marketing standardmäßig AUS; Einstellungen-Ansicht optional.
 * - Dezent, im Jägergrün/Weiß-System, nicht bildschirmfüllend.
 */

import { useState } from "react";
import Link from "next/link";
import { useConsent } from "./ConsentProvider";

export function ConsentBanner() {
  const { bannerOpen, acceptAll, rejectAll, save, consent } = useConsent();
  const [showDetails, setShowDetails] = useState(false);
  const [marketing, setMarketing] = useState(consent.marketing);

  if (!bannerOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Cookie-Einstellungen"
      className="fixed inset-x-0 bottom-0 z-50 flex justify-center p-3 sm:p-4"
    >
      <div className="card w-full max-w-2xl p-5 shadow-[0_8px_40px_-12px_rgba(15,26,21,0.25)] sm:p-6">
        <h2 className="text-h3 font-semibold text-ink">Datenschutz-Einstellungen</h2>
        <p className="mt-2 text-small text-ink-soft">
          Wir verwenden notwendige Cookies für die Funktion dieser Seite. Mit Ihrer
          Einwilligung setzen wir zusätzlich Marketing-Cookies (Meta-Pixel), um den
          Erfolg unserer Anzeigen zu messen. Sie können Ihre Auswahl jederzeit über
          „Cookie-Einstellungen" im Fußbereich ändern. Mehr dazu in unserer{" "}
          <Link href="/datenschutz" className="text-accent underline underline-offset-2">
            Datenschutzerklärung
          </Link>
          .
        </p>

        {showDetails && (
          <div className="mt-4 space-y-3">
            <div className="flex items-start justify-between gap-4 rounded-xl border border-line px-4 py-3">
              <div>
                <p className="text-small font-semibold text-ink">Notwendig</p>
                <p className="text-small text-ink-soft">
                  Für Formularfunktion und Speicherung Ihrer Auswahl. Umfasst die
                  Adress-Autovervollständigung über Photon (OpenStreetMap, EU) – dabei wird
                  nur Ihre Eingabe zur Vorschlagssuche übermittelt. Immer aktiv.
                </p>
              </div>
              <span className="mt-1 text-small font-medium text-ink-soft">Immer an</span>
            </div>
            <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-line px-4 py-3">
              <div>
                <p className="text-small font-semibold text-ink">Marketing</p>
                <p className="text-small text-ink-soft">
                  Meta-Pixel zur Reichweiten- und Conversion-Messung. Standardmäßig aus.
                </p>
              </div>
              <input
                type="checkbox"
                className="mt-1 h-5 w-5 accent-accent"
                checked={marketing}
                onChange={(e) => setMarketing(e.target.checked)}
              />
            </label>
          </div>
        )}

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => setShowDetails((v) => !v)}
            className="text-small font-medium text-ink-soft underline underline-offset-2 hover:text-ink"
          >
            {showDetails ? "Weniger anzeigen" : "Einstellungen"}
          </button>

          <div className="flex flex-col gap-2 sm:flex-row">
            {showDetails ? (
              <button type="button" className="btn-ghost" onClick={() => save(marketing)}>
                Auswahl speichern
              </button>
            ) : (
              <button type="button" className="btn-ghost" onClick={rejectAll}>
                Ablehnen
              </button>
            )}
            <button type="button" className="btn-primary" onClick={acceptAll}>
              Alle akzeptieren
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
