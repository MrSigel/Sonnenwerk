import { NextResponse } from "next/server";
import { rateLimit, LIMITS, clientIp } from "@/lib/rateLimit";
import type { GeoSuggestion } from "@/lib/geo";

/**
 * Adress-Autovervollständigung via Photon (OpenStreetMap) — serverseitiger Proxy.
 * - Kostenlos, kein API-Key, DSGVO-freundlich (EU/OSM-Datenbasis).
 * - Als Proxy: Die IP des Nutzers wird NICHT an Photon übermittelt, nur der
 *   getippte Suchtext. Auf Deutschland gefiltert (lang=de + DE-Bounding-Box).
 * - Fehler still abfangen → leere Liste, manuelle Eingabe bleibt möglich.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PHOTON_URL = "https://photon.komoot.io/api/";
// Bounding-Box Deutschland (minLon,minLat,maxLon,maxLat).
const DE_BBOX = "5.8663,47.2701,15.0419,55.0581";

export async function GET(req: Request) {
  const ip = clientIp(req.headers);
  const rl = await rateLimit(ip, LIMITS.geo);
  if (!rl.success) return NextResponse.json({ suggestions: [] }, { status: 429 });

  const q = (new URL(req.url).searchParams.get("q") || "").trim();
  if (q.length < 3) return NextResponse.json({ suggestions: [] });

  const url = `${PHOTON_URL}?q=${encodeURIComponent(
    q
  )}&lang=de&limit=8&bbox=${DE_BBOX}`;

  try {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { "User-Agent": "Sonnenwerk-Landingpage" },
    });
    clearTimeout(timeout);
    if (!res.ok) return NextResponse.json({ suggestions: [] });
    const data = (await res.json()) as { features?: PhotonFeature[] };
    return NextResponse.json({ suggestions: mapFeatures(data.features || []) });
  } catch {
    // Dienst-Ausfall/Timeout: still bleiben, Formular funktioniert manuell weiter.
    return NextResponse.json({ suggestions: [] });
  }
}

type PhotonFeature = {
  properties?: {
    osm_type?: string;
    osm_id?: number;
    osm_key?: string;
    type?: string;
    name?: string;
    street?: string;
    housenumber?: string;
    postcode?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    district?: string;
    state?: string;
    countrycode?: string;
  };
};

function mapFeatures(features: PhotonFeature[]): GeoSuggestion[] {
  const out: GeoSuggestion[] = [];
  const seen = new Set<string>();

  for (const f of features) {
    const p = f.properties || {};
    if (p.countrycode && p.countrycode !== "DE") continue;

    const type = p.type || "";
    let strasse: string | undefined;
    if (p.street) strasse = p.street;
    else if (type === "street" || type === "house") strasse = p.name;

    const hausnummer = p.housenumber || undefined;
    const plz = p.postcode || undefined;

    let ort = p.city || p.town || p.village || p.municipality || undefined;
    if (
      !ort &&
      (p.osm_key === "place" || ["city", "district", "locality", "other"].includes(type))
    ) {
      ort = p.name;
    }

    let primary: string;
    let secondary: string;
    if (strasse) {
      primary = hausnummer ? `${strasse} ${hausnummer}` : strasse;
      secondary = [plz, ort].filter(Boolean).join(" ");
    } else {
      primary = [plz, ort].filter(Boolean).join(" ") || p.name || "";
      secondary = p.state || "";
    }
    if (!primary) continue;

    const dedupe = `${primary}|${secondary}`;
    if (seen.has(dedupe)) continue;
    seen.add(dedupe);

    out.push({
      key: `${p.osm_type || ""}${p.osm_id || ""}-${hausnummer || ""}-${primary}`,
      primary,
      secondary,
      strasse,
      hausnummer,
      plz,
      ort,
    });
    if (out.length >= 6) break;
  }

  return out;
}
