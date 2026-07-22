import { z } from "zod";

/**
 * Gemeinsames Zod-Schema (§7) — identisch client- UND serverseitig verwendet.
 * Format-Validierung, keine externen Lookup-APIs.
 */

const jaNein = z.enum(["Ja", "Nein"], {
  errorMap: () => ({ message: "Bitte treffen Sie eine Auswahl." }),
});

// RFC-nahe E-Mail-Prüfung mit valider Domain-Struktur.
const emailRegex =
  /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export const leadSchema = z.object({
  // PERSÖNLICHE DATEN
  vorname: z.string().trim().min(2, "Bitte geben Sie Ihren Vornamen an (min. 2 Zeichen)."),
  name: z.string().trim().min(2, "Bitte geben Sie Ihren Namen an (min. 2 Zeichen)."),

  // ADRESSE
  strasse: z.string().trim().min(1, "Bitte geben Sie Ihre Straße an."),
  hausnummer: z.string().trim().min(1, "Bitte geben Sie Ihre Hausnummer an."),
  plz: z
    .string()
    .trim()
    .regex(/^\d{5}$/, "Bitte geben Sie eine 5-stellige Postleitzahl an."),
  ort: z.string().trim().min(1, "Bitte geben Sie Ihren Ort an."),

  // KONTAKT
  telefon: z
    .string()
    .trim()
    .regex(
      /^[+]?[0-9\s/()-]{6,20}$/,
      "Bitte geben Sie eine gültige Telefonnummer an."
    ),
  email: z
    .string()
    .trim()
    .regex(emailRegex, "Bitte geben Sie eine gültige E-Mail-Adresse an."),

  // QUALIFIZIERUNG
  hauseigentuemer: jaNein,
  solar_interesse: jaNein,

  // Pflicht-Datenschutz-Häkchen
  datenschutz: z.literal(true, {
    errorMap: () => ({
      message: "Bitte stimmen Sie der Datenschutzerklärung zu, um fortzufahren.",
    }),
  }),

  // Optionaler Newsletter (kein Pflichtfeld)
  newsletter: z.boolean().default(false),

  // Spam-Schutz (§9): unsichtbares Honeypot-Feld — muss leer sein.
  company: z.string().max(0).optional().default(""),

  // Zeitfalle (§9): Client-Zeitstempel des Formular-Renderings (ms).
  formLoadedAt: z.number().int().nonnegative().optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;

/** Feldbeschriftungen (für Mail-Ausgabe & Admin, §8.3). */
export const LEAD_FIELD_LABELS: Record<string, string> = {
  vorname: "Vorname",
  name: "Name",
  strasse: "Straße",
  hausnummer: "Hausnummer",
  plz: "Postleitzahl",
  ort: "Ort",
  telefon: "Telefonnummer",
  email: "E-Mail",
  hauseigentuemer: "Hauseigentümer",
  solar_interesse: "Solar-Interesse",
  newsletter: "Newsletter",
};
