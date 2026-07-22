/**
 * Kurzlebiger Transport der Absende-Zusammenfassung zur `/danke`-Seite (§8.1).
 * Verhindert Deep-Link-Missbrauch: ohne frischen, gültigen Eintrag zeigt /danke
 * keine „Conversion" und feuert kein Lead-Event.
 */

export type PendingLead = {
  vorname: string;
  name: string;
  strasse: string;
  hausnummer: string;
  plz: string;
  ort: string;
  telefon: string;
  email: string;
  hauseigentuemer: "Ja" | "Nein";
  solar_interesse: "Ja" | "Nein";
  newsletter: boolean;
};

const KEY = "sw_pending_lead";
const MAX_AGE_MS = 5 * 60 * 1000; // 5 Minuten gültig

type Stored = { at: number; data: PendingLead };

export function storePendingLead(data: PendingLead): void {
  if (typeof window === "undefined") return;
  try {
    const payload: Stored = { at: Date.now(), data };
    window.sessionStorage.setItem(KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

/** Liest die Zusammenfassung einmalig aus und entfernt sie danach. */
export function consumePendingLead(): PendingLead | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return null;
    window.sessionStorage.removeItem(KEY);
    const parsed = JSON.parse(raw) as Stored;
    if (!parsed?.at || Date.now() - parsed.at > MAX_AGE_MS) return null;
    return parsed.data;
  } catch {
    return null;
  }
}
