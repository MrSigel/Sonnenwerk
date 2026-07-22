import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type LeadRow = {
  id: string;
  vorname: string;
  name: string;
  strasse: string;
  hausnummer: string;
  plz: string;
  ort: string;
  telefon: string;
  email: string;
  hauseigentuemer: boolean;
  solar_interesse: boolean;
  newsletter_opt_in: boolean;
  newsletter_confirmed: boolean;
  datenschutz_akzeptiert: boolean;
  quelle: string;
  created_at: string;
};

/**
 * Liest alle Leads (neueste zuerst) über den Service-Role-Client.
 * Der Zugriff ist bereits durch die Session-Prüfung der Seite geschützt (§17.7).
 */
export async function fetchLeads(): Promise<LeadRow[]> {
  const admin = getSupabaseAdmin();
  if (!admin) return [];
  const { data, error } = await admin
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[admin] fetchLeads failed:", error.message);
    return [];
  }
  return (data as LeadRow[]) ?? [];
}

export async function fetchLead(id: string): Promise<LeadRow | null> {
  const admin = getSupabaseAdmin();
  if (!admin) return null;
  const { data, error } = await admin.from("leads").select("*").eq("id", id).maybeSingle();
  if (error) {
    console.error("[admin] fetchLead failed:", error.message);
    return null;
  }
  return (data as LeadRow) ?? null;
}
