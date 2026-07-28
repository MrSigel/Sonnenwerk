"use client";

import { useLayoutEffect } from "react";

/**
 * Springt beim Aufruf der Startseite sofort zum Anfrage-Formular (#anfrage),
 * damit Besucher direkt dort landen statt im Hero-Bereich.
 *
 * Bewusst zurückhaltend:
 * - Nur wenn KEIN Anker in der URL steht (z. B. /#faq bleibt unangetastet).
 * - Nur wenn die Seite ganz oben startet — bei „Zurück" behält der Browser
 *   seine wiederhergestellte Position.
 * - Ohne Animation, damit die übersprungenen Abschnitte nicht vorbeifliegen.
 */
export function ScrollToForm() {
  useLayoutEffect(() => {
    if (window.location.hash) return;
    if (window.scrollY > 0) return;

    const jump = () => {
      const el = document.getElementById("anfrage");
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top, behavior: "auto" });
    };

    // Zweimal ausführen: einmal sofort, einmal nachdem Bilder und Schriften
    // geladen sind — sonst verschiebt sich die Zielposition nachträglich.
    jump();
    const raf = requestAnimationFrame(jump);

    let onLoad: (() => void) | null = null;
    if (document.readyState !== "complete") {
      onLoad = () => jump();
      window.addEventListener("load", onLoad, { once: true });
    }

    return () => {
      cancelAnimationFrame(raf);
      if (onLoad) window.removeEventListener("load", onLoad);
    };
  }, []);

  return null;
}
