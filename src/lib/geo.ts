/** Geteilte Typen/Helfer für die Adress-Autovervollständigung (Client + Server). */

export type GeoSuggestion = {
  key: string;
  primary: string; // Hauptzeile (z. B. „Musterstraße 42")
  secondary: string; // Nebenzeile (z. B. „10115 Berlin")
  strasse?: string;
  hausnummer?: string;
  plz?: string;
  ort?: string;
};

/**
 * Fragt den eigenen Proxy `/api/geo` ab (der wiederum Photon/OSM anspricht).
 * Fehler werden still abgefangen → leere Liste, manuelle Eingabe bleibt möglich.
 */
export async function fetchAddressSuggestions(
  q: string,
  signal?: AbortSignal
): Promise<GeoSuggestion[]> {
  const query = q.trim();
  if (query.length < 3) return [];
  try {
    const res = await fetch(`/api/geo?q=${encodeURIComponent(query)}`, { signal });
    if (!res.ok) return [];
    const data = (await res.json()) as { suggestions?: GeoSuggestion[] };
    return Array.isArray(data.suggestions) ? data.suggestions : [];
  } catch {
    return []; // Dienst-Ausfall / Abbruch: niemals blockieren.
  }
}

/** Gängige (v. a. deutsche) E-Mail-Provider, verbreitetste zuerst (§ Vorgabe). */
export const EMAIL_DOMAINS = [
  "gmail.com",
  "web.de",
  "gmx.de",
  "t-online.de",
  "outlook.de",
  "hotmail.de",
  "yahoo.de",
  "icloud.com",
  "freenet.de",
  "mail.de",
  "gmx.net",
  "online.de",
] as const;
