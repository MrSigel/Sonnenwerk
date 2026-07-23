import "server-only";
import crypto from "node:crypto";
import { env, hasBitrix } from "./env";
import type { LeadInput } from "./schema";

/**
 * Lead-Weiterleitung an den LIMITBREAKERS-/Bitrix-Webhook (n8n) — Format 1:1
 * nach "Lead-Datenformat-Spezifikation" v1.0.
 *
 * WICHTIG: Die Spezifikation ist für Telefonakquise-Leads (mit Werber-
 * Sprachaufnahme) ausgelegt. Ein Web-Formular liefert mehrere Pflichtfelder
 * NICHT (recording.call_audio_url, customer.timeframe, building.type,
 * building.roof_shape). Wir mappen alles Vorhandene, setzen für die enum-
 * Pflichtfelder ohne "Keine Angabe" neutrale Defaults ("Sonstiges") und lassen
 * die Sprachaufnahme-URL bewusst weg (liegt bei Web-Leads nicht vor).
 *
 * Auth: Der Token steckt bereits im Webhook-Pfad → kein zusätzlicher Header.
 * Optionale, nicht erhobene Felder werden weggelassen (kein null / "").
 */

export type BitrixResult = {
  ok: boolean;
  skipped?: boolean;
  status?: number;
  error?: string;
  supplierLeadId?: string;
  isTest?: boolean;
};

export function buildBitrixPayload(lead: LeadInput, submittedAt: string) {
  // Test-Modus automatisch an der Test-Webhook-URL erkennen (Doku: Test-Leads
  // tragen supplier_lead_id mit Präfix "TEST-").
  const isTest = env.BITRIX_WEBHOOK_URL.includes("/webhook-test/");
  const supplierLeadId = `${isTest ? "TEST-" : "SW-"}${crypto.randomUUID()}`;

  const street = [lead.strasse, lead.hausnummer].filter(Boolean).join(" ").trim();

  const payload = {
    supplier_lead_id: supplierLeadId,
    submitted_at: submittedAt,
    lead_source: "Online-Formular Solar-Landingpage",
    contact: {
      first_name: lead.vorname,
      last_name: lead.name,
      phone: lead.telefon,
      email: lead.email,
      address: {
        street,
        postal_code: lead.plz,
        city: lead.ort,
        country: "Deutschland",
      },
    },
    customer: {
      is_owner: lead.hauseigentuemer, // "Ja" | "Nein"
      product_interest: lead.product_interest, // PV | Wärmepumpe | PV und Wärmepumpe
      timeframe: lead.timeframe, // sofort | 1-3 Monate | 3-6 Monate | Keine Angabe
    },
    building: {
      type: lead.building_type,
      roof_shape: lead.roof_shape,
    },
    // recording.call_audio_url: Pflicht laut Doku – wird ergänzt, sobald die
    //   Aufzeichnungs-/Hosting-Lösung festgelegt ist (noch offen).
  };

  return { payload, supplierLeadId, isTest };
}

export async function sendToBitrix(
  lead: LeadInput,
  submittedAt: string
): Promise<BitrixResult> {
  if (!hasBitrix()) return { ok: false, skipped: true };

  const { payload, supplierLeadId, isTest } = buildBitrixPayload(lead, submittedAt);

  try {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(env.BITRIX_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) {
      return { ok: false, status: res.status, supplierLeadId, isTest };
    }
    return { ok: true, status: res.status, supplierLeadId, isTest };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "send-failed",
      supplierLeadId,
      isTest,
    };
  }
}
