import "server-only";
import { getSupabaseAdmin } from "./supabase/admin";
import type { LeadInput } from "./schema";

/**
 * Persistiert einen validierten Lead in Supabase (`leads`, §17.3).
 * Rückgabe:
 *  - { stored: true }              → erfolgreich gespeichert
 *  - { stored: false, configured } → nicht gespeichert; `configured` sagt, ob
 *    Supabase überhaupt eingerichtet ist. Ist es eingerichtet und schlägt der
 *    Insert fehl, gilt das als Fehler (Route → 500).
 */
export async function insertLead(
  lead: LeadInput
): Promise<{ stored: boolean; configured: boolean; error?: string }> {
  const admin = getSupabaseAdmin();
  if (!admin) return { stored: false, configured: false };

  const { error } = await admin.from("leads").insert({
    vorname: lead.vorname,
    name: lead.name,
    strasse: lead.strasse,
    hausnummer: lead.hausnummer,
    plz: lead.plz,
    ort: lead.ort,
    telefon: lead.telefon,
    email: lead.email,
    hauseigentuemer: lead.hauseigentuemer === "Ja",
    solar_interesse: lead.solar_interesse === "Ja",
    newsletter_opt_in: Boolean(lead.newsletter),
    newsletter_confirmed: false,
    datenschutz_akzeptiert: true,
    quelle: "Sonnenwerk-Landingpage",
  });

  if (error) return { stored: false, configured: true, error: error.message };
  return { stored: true, configured: true };
}

/** Setzt newsletter_confirmed=true für eine E-Mail (DOI-Verify, §8A). */
export async function confirmNewsletter(email: string): Promise<void> {
  const admin = getSupabaseAdmin();
  if (!admin) return;
  await admin
    .from("leads")
    .update({ newsletter_confirmed: true })
    .eq("email", email.toLowerCase().trim());
}
