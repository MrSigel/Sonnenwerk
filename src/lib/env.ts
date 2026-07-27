/**
 * Zentraler, absturzsicherer Zugriff auf Umgebungsvariablen (§8.5).
 *
 * Grundregel (Master-Prompt §1.4): Fehlende ENV darf den Build NICHT crashen.
 * Deshalb liest dieses Modul ausschließlich mit leeren Fallbacks und wirft nie.
 * Zur Laufzeit prüfen Features über die `has*`-Helfer, ob sie aktiv sind.
 */

function read(name: string): string {
  const v = process.env[name];
  return typeof v === "string" ? v.trim() : "";
}

export const env = {
  // Resend
  RESEND_API_KEY: read("RESEND_API_KEY"),
  MAIL_FROM: read("MAIL_FROM"),
  LEAD_RECIPIENT: read("LEAD_RECIPIENT"),

  // Seite / DOI
  SITE_URL: read("NEXT_PUBLIC_SITE_URL"),
  DOI_SECRET: read("DOI_SECRET"),

  // Meta-Pixel (öffentlich). Haupt-Pixel sitewide, zweiter Pixel nur auf /danke.
  META_PIXEL_ID: read("NEXT_PUBLIC_META_PIXEL_ID"),
  META_PIXEL_ID_DANKE: read("NEXT_PUBLIC_META_PIXEL_ID_DANKE"),

  // Bitrix / LIMITBREAKERS Lead-Webhook (n8n). URL enthält den Token im Pfad.
  BITRIX_WEBHOOK_URL: read("BITRIX_WEBHOOK_URL"),

  // Optional: Upstash — Rate-Limiting UND Analytics-Speicher
  UPSTASH_REDIS_REST_URL: read("UPSTASH_REDIS_REST_URL"),
  UPSTASH_REDIS_REST_TOKEN: read("UPSTASH_REDIS_REST_TOKEN"),

  // Analytics-Bereich /admin. Passwort NIE im Code — ausschließlich per ENV.
  ADMIN_PASSWORD: read("ADMIN_PASSWORD"),
};

/** Lead-Weiterleitung an Bitrix/LIMITBREAKERS-Webhook möglich (URL vorhanden). */
export const hasBitrix = () => Boolean(env.BITRIX_WEBHOOK_URL);

/** Resend-Versand ist möglich (Key + Absender + Empfänger vorhanden). */
export const hasResend = () =>
  Boolean(env.RESEND_API_KEY && env.MAIL_FROM && env.LEAD_RECIPIENT);

/** Newsletter-DOI ist möglich (Resend + Secret + Basis-URL vorhanden). */
export const hasDoi = () => Boolean(hasResend() && env.DOI_SECRET && env.SITE_URL);

/** Meta-Pixel konfiguriert (öffentliche Pixel-ID vorhanden). */
export const hasMetaPixel = () => Boolean(env.META_PIXEL_ID);

/** Verteiltes Upstash-Rate-Limiting konfiguriert (sonst In-Memory-Fallback). */
export const hasUpstash = () =>
  Boolean(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN);

/**
 * Analytics-Erfassung möglich. Ohne Upstash werden Ereignisse still verworfen —
 * die Seite funktioniert normal weiter.
 */
export const hasAnalytics = () => hasUpstash();

/** /admin nutzbar (Passwort gesetzt + Secret zum Signieren der Sitzung). */
export const hasAdmin = () => Boolean(env.ADMIN_PASSWORD && env.DOI_SECRET);

/** Öffentliche Basis-URL mit robustem Fallback (nur für Link-Erzeugung). */
export function siteUrl(): string {
  if (env.SITE_URL) return env.SITE_URL.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
