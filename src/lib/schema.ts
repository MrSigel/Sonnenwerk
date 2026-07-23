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

  // QUALIFIZIERUNG (Doku: customer.*)
  hauseigentuemer: jaNein, // customer.is_owner
  product_interest: z.enum(["PV", "Wärmepumpe", "PV und Wärmepumpe"], {
    errorMap: () => ({ message: "Bitte wählen Sie Ihr Produktinteresse." }),
  }),
  timeframe: z.enum(["sofort", "1-3 Monate", "3-6 Monate", "Keine Angabe"], {
    errorMap: () => ({ message: "Bitte wählen Sie einen Zeitraum." }),
  }),

  // GEBÄUDE (Doku: building.*)
  building_type: z.enum(
    [
      "Einfamilienhaus",
      "Zweifamilienhaus",
      "Mehrfamilienhaus",
      "Firmengebäude",
      "Freilandfläche",
      "Sonstiges",
    ],
    { errorMap: () => ({ message: "Bitte wählen Sie den Gebäudetyp." }) }
  ),
  roof_shape: z
    .array(
      z.enum([
        "Satteldach",
        "Walmdach",
        "Pultdach",
        "Flachdach",
        "Krüppelwalmdach",
        "Mansarddach",
        "Sonstiges",
      ])
    )
    .min(1, "Bitte wählen Sie mindestens eine Dachform."),

  // Pflicht-Datenschutz-Häkchen
  datenschutz: z.literal(true, {
    errorMap: () => ({
      message: "Bitte stimmen Sie der Datenschutzerklärung zu, um fortzufahren.",
    }),
  }),

  // Optionaler Newsletter (kein Pflichtfeld)
  newsletter: z.boolean().default(false),

  // Spam-Schutz (§9): unsichtbares Honeypot-Feld. Wird NUR serverseitig aus dem
  // Roh-Body ausgewertet (route.ts). Client-seitig bewusst KEINE .max(0)-Prüfung:
  // sonst würde ein von Autofill/Passwort-Manager befülltes Feld den echten
  // Nutzer blockieren.
  company: z.string().optional().default(""),

  // Zeitfalle (§9): im Browser gemessene Ausfülldauer in ms (skew-sicher).
  fillMs: z.number().int().nonnegative().optional(),
  // Alt/abwärtskompatibel: Client-Zeitstempel des Renderings (nicht mehr genutzt).
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
  product_interest: "Produktinteresse",
  timeframe: "Zeitraum",
  building_type: "Gebäudetyp",
  roof_shape: "Dachform",
  newsletter: "Newsletter",
};
