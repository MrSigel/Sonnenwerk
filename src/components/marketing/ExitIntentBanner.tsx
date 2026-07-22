"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Check } from "@/components/ui/Check";

/**
 * Exit-Intent-Banner — gewinnt abspringende Besucher zurück (typisch für
 * Meta-Ads-Landingpages). Nur auf der Startseite, einmal pro Sitzung, leicht
 * schließbar (kein Dark Pattern). Sammelt selbst KEINE Daten und setzt keine
 * Cookies – nur ein freundlicher Hinweis mit Sprung zum Formular.
 *
 * Trigger: Desktop = Maus verlässt das Fenster nach oben; Touch = nach tiefem
 * Scrollen wieder zurück nach ganz oben (Verlassen-Absicht).
 */
export function ExitIntentBanner() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const shown = useRef(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pathname !== "/") return;
    if (typeof window === "undefined") return;
    try {
      if (sessionStorage.getItem("sw_exit_shown")) return;
    } catch {
      /* ignore */
    }

    const trigger = () => {
      if (shown.current) return;
      shown.current = true;
      try {
        sessionStorage.setItem("sw_exit_shown", "1");
      } catch {
        /* ignore */
      }
      setOpen(true);
    };

    const canHover = window.matchMedia?.("(hover: hover)").matches;

    const onMouseOut = (e: MouseEvent) => {
      if (e.clientY <= 0 && !e.relatedTarget) trigger();
    };

    let wentDeep = false;
    const onScroll = () => {
      if (window.scrollY > 900) wentDeep = true;
      else if (wentDeep && window.scrollY < 140) trigger();
    };

    if (canHover) {
      document.addEventListener("mouseout", onMouseOut);
    } else {
      window.addEventListener("scroll", onScroll, { passive: true });
    }
    return () => {
      document.removeEventListener("mouseout", onMouseOut);
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname]);

  // Escape schließt; Fokus beim Öffnen ins Dialogfeld.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    dialogRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-title"
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="wizard-step card relative w-full max-w-md p-6 shadow-[0_30px_80px_-20px_rgba(15,26,21,0.5)] outline-none sm:p-8"
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Schließen"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-paper-sunk hover:text-ink"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <p className="eyebrow">Kostenlos &amp; unverbindlich</p>
        <h2 id="exit-title" className="mt-2 text-h2 font-bold tracking-tight text-ink">
          Einen Moment noch!
        </h2>
        <p className="mt-3 text-body text-ink-soft">
          Sichern Sie sich Ihre unterschiedlichen Solar-Angebote von geprüften Fachbetrieben –
          in nur 60 Sekunden ausgefüllt, Rückmeldung in 24–48 Stunden.
        </p>

        <ul className="mt-5 space-y-2.5">
          {["100 % kostenlos & unverbindlich", "Nur geprüfte, regionale Fachbetriebe", "Mehrere Angebote, eine Anfrage"].map(
            (t) => (
              <li key={t} className="flex items-start gap-3 text-small text-ink">
                <Check className="mt-0.5 h-4 w-4" />
                {t}
              </li>
            )
          )}
        </ul>

        <a href="#anfrage" onClick={() => setOpen(false)} className="btn-primary group mt-6 w-full">
          Jetzt kostenlos anfragen
          <svg viewBox="0 0 20 20" fill="none" className="btn-arrow h-4 w-4">
            <path d="M4 10h11M11 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="mt-3 w-full text-center text-small text-ink-soft underline-offset-2 hover:text-ink hover:underline"
        >
          Nein danke, später
        </button>
      </div>
    </div>
  );
}
