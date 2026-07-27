"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Anonyme Nutzungsmessung (§Analytics).
 *
 * Erfasst ausschließlich Verhaltensmuster — Scrolltiefe, Verweildauer, welche
 * Abschnitte betrachtet wurden, Formularschritte und Exit-Banner. Es werden
 * KEINE Cookies gesetzt, keine IDs vergeben und keine personenbezogenen Daten
 * übertragen. Deshalb ist die Messung nicht einwilligungspflichtig.
 *
 * Andere Komponenten melden Ereignisse per `trackEvent()` (siehe unten).
 */

type Pending = {
  funnel: string[];
  exit: string[];
};

const BUFFER: Pending = { funnel: [], exit: [] };

/** Formularschritt oder Exit-Banner-Interaktion melden. */
export function trackEvent(kind: "funnel" | "exit", name: string): void {
  if (typeof window === "undefined") return;
  const list = BUFFER[kind];
  // Jede Stufe nur einmal pro Seitenansicht zählen.
  if (!list.includes(name)) list.push(name);
}

function sourceHost(): string | undefined {
  try {
    if (!document.referrer) return "direct";
    const url = new URL(document.referrer);
    if (url.host === location.host) return undefined; // interne Navigation
    return url.host.replace(/^www\./, "");
  } catch {
    return undefined;
  }
}

export function Tracker() {
  const pathname = usePathname();
  const started = useRef(0);
  const maxScroll = useRef(0);
  const sentFirst = useRef(false);
  const sectionTime = useRef<Record<string, number>>({});
  const visibleSince = useRef<Record<string, number>>({});

  useEffect(() => {
    started.current = Date.now();
    maxScroll.current = 0;
    sentFirst.current = false;
    sectionTime.current = {};
    visibleSince.current = {};
    BUFFER.funnel = [];
    BUFFER.exit = [];

    const path = pathname || "/";
    const device: "mobile" | "desktop" =
      window.matchMedia("(max-width: 767px)").matches ? "mobile" : "desktop";

    // ── Scrolltiefe ──────────────────────────────────────────────
    const onScroll = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      const pct =
        scrollable <= 0 ? 100 : Math.round(((window.scrollY || 0) / scrollable) * 100);
      if (pct > maxScroll.current) maxScroll.current = Math.min(100, pct);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // ── Sichtbarkeit der Abschnitte ──────────────────────────────
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("main section[id], section[id]")
    );
    const observer = new IntersectionObserver(
      (entries) => {
        const now = Date.now();
        for (const entry of entries) {
          const id = entry.target.id;
          if (!id) continue;
          if (entry.isIntersecting) {
            visibleSince.current[id] = now;
          } else if (visibleSince.current[id]) {
            sectionTime.current[id] =
              (sectionTime.current[id] ?? 0) + (now - visibleSince.current[id]);
            delete visibleSince.current[id];
          }
        }
      },
      { threshold: 0.5 }
    );
    for (const s of sections) observer.observe(s);

    // ── Übermittlung ─────────────────────────────────────────────
    const buildPayload = (final: boolean) => {
      const now = Date.now();
      // Noch sichtbare Abschnitte mitrechnen.
      const sectionsOut: Record<string, number> = {};
      for (const [id, ms] of Object.entries(sectionTime.current)) {
        const extra = visibleSince.current[id] ? now - visibleSince.current[id] : 0;
        const sec = Math.round((ms + extra) / 1000);
        if (sec > 0) sectionsOut[id] = Math.min(3600, sec);
      }
      for (const [id, since] of Object.entries(visibleSince.current)) {
        if (sectionsOut[id] !== undefined) continue;
        const sec = Math.round((now - since) / 1000);
        if (sec > 0) sectionsOut[id] = Math.min(3600, sec);
      }

      return {
        path,
        first: !sentFirst.current,
        ...(!sentFirst.current ? { device, source: sourceHost() } : {}),
        scroll: maxScroll.current,
        ...(final
          ? { dwellSec: Math.min(3600, Math.round((now - started.current) / 1000)) }
          : {}),
        ...(Object.keys(sectionsOut).length ? { sections: sectionsOut } : {}),
        ...(BUFFER.funnel.length ? { funnel: [...BUFFER.funnel] } : {}),
        ...(BUFFER.exit.length ? { exit: [...BUFFER.exit] } : {}),
      };
    };

    const send = (final: boolean) => {
      const payload = buildPayload(final);
      const body = JSON.stringify(payload);
      try {
        if (final && navigator.sendBeacon) {
          navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
        } else {
          void fetch("/api/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body,
            keepalive: true,
          });
        }
        sentFirst.current = true;
        // Bereits gemeldete Ereignisse nicht doppelt zählen.
        BUFFER.funnel = [];
        BUFFER.exit = [];
        sectionTime.current = {};
        const now = Date.now();
        for (const id of Object.keys(visibleSince.current)) visibleSince.current[id] = now;
      } catch {
        /* ignorieren */
      }
    };

    // Erste Übermittlung nach kurzer Verweildauer (echte Besucher, keine Bots).
    const initial = window.setTimeout(() => send(false), 5000);

    const onHide = () => {
      if (document.visibilityState === "hidden") send(true);
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", () => send(true));

    return () => {
      window.clearTimeout(initial);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onHide);
      observer.disconnect();
      send(true);
    };
  }, [pathname]);

  return null;
}
