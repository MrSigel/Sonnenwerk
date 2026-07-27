import { z } from "zod";

/**
 * Analytics-Ereignisse — bewusst OHNE Personenbezug (§DSGVO).
 *
 * Es werden ausschließlich aggregierte Zähler gespeichert: keine Cookies, keine
 * IP-Adressen, keine Sitzungs-IDs, keine Einzelprofile. Aus den Daten lässt sich
 * nachvollziehen, WIE die Seite genutzt wird — nicht, WER sie genutzt hat.
 */

/** Scrolltiefe in Prozent — feste Stufen, damit die Zählerzahl klein bleibt. */
export const SCROLL_BUCKETS = [25, 50, 75, 100] as const;

/** Verweildauer-Stufen (Sekunden-Obergrenze; letzte Stufe = darüber). */
export const DWELL_BUCKETS = [
  { key: "0-10s", maxSec: 10 },
  { key: "10-30s", maxSec: 30 },
  { key: "30-60s", maxSec: 60 },
  { key: "1-3min", maxSec: 180 },
  { key: "3min+", maxSec: Infinity },
] as const;

export function dwellBucket(seconds: number): string {
  return (DWELL_BUCKETS.find((b) => seconds <= b.maxSec) ?? DWELL_BUCKETS.at(-1)!).key;
}

/** Schritte des Anfrage-Formulars für die Abbruch-Analyse. */
export const FUNNEL_STEPS = ["form_view", "step1", "step2", "submit"] as const;

/** Interaktionen mit dem Exit-Intent-Banner. */
export const EXIT_ACTIONS = ["shown", "read", "clicked", "dismissed"] as const;

const path = z
  .string()
  .max(120)
  // Nur Pfad, nie Query-String (dort könnten personenbezogene Daten stehen).
  .transform((p) => (p.split("?")[0] || "/").slice(0, 120));

export const trackPayload = z.object({
  path,
  /** Gerätetyp, grob. */
  device: z.enum(["mobile", "desktop"]).optional(),
  /** Herkunft: nur der Host der verweisenden Seite, nie die volle URL. */
  source: z.string().max(60).optional(),
  /** Höchste erreichte Scrollstufe. */
  scroll: z.number().int().min(0).max(100).optional(),
  /** Verweildauer in Sekunden (gedeckelt gegen Ausreißer). */
  dwellSec: z.number().int().min(0).max(3600).optional(),
  /** Sichtbarkeitsdauer je Sektion in Sekunden. */
  sections: z.record(z.string().max(40), z.number().int().min(0).max(3600)).optional(),
  /** Erreichte Formularschritte. */
  funnel: z.array(z.enum(FUNNEL_STEPS)).max(8).optional(),
  /** Exit-Banner-Interaktionen. */
  exit: z.array(z.enum(EXIT_ACTIONS)).max(8).optional(),
  /** Erste Erfassung dieser Seitenansicht (zählt den Seitenaufruf). */
  first: z.boolean().optional(),
});

export type TrackPayload = z.infer<typeof trackPayload>;
