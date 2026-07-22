/** Zentrale Marken- und Unternehmensangaben (Master-Prompt §8, §10). */

export const BRAND = {
  name: "Sonnenwerk",
  slogan: "Geprüfte Solar-Angebote aus Ihrer Region.",
} as const;

/** Impressumsangaben — wörtlich aus §10. */
export const COMPANY = {
  legalName: "Strom Distributor Vertriebs GmbH",
  street: "Talstraße 28a",
  city: "66424 Homburg / Saarland",
  ceo: "Florian Feit",
  email: "office@strom-distributor.de",
  phone: "06024 – 3061638",
  registerCourt: "Saarbrücken",
  registerNumber: "HRB 103579",
  taxNumber: "040/120/53571",
  taxOffice: "Finanzamt Saarbrücken",
} as const;

/** Trust-Elemente (§5) — Pflicht, above the fold. */
export const TRUST = {
  requests: "780.000+",
  requestsLabel: "Anfragen bereits vermittelt",
  partners: "900",
  partnersLabel: "Fachpartner aus ganz Deutschland",
} as const;
