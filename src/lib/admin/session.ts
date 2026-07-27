import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { env } from "../env";

/**
 * Sitzungsverwaltung für /admin.
 *
 * Das Passwort steht ausschließlich in der Umgebungsvariablen ADMIN_PASSWORD —
 * niemals im Code oder Repository. Der Vergleich läuft zeitkonstant, damit sich
 * das Passwort nicht über Antwortzeiten erraten lässt. Nach dem Login wird nur
 * ein signiertes Ablaufdatum als HttpOnly-Cookie gesetzt, kein Passwort.
 */

const COOKIE = "sw_admin";
const MAX_AGE_SECONDS = 12 * 60 * 60; // 12 Stunden

function sign(value: string): string {
  return crypto.createHmac("sha256", env.DOI_SECRET).update(value).digest("base64url");
}

/** Zeitkonstanter Passwortvergleich. */
export function passwordMatches(input: string): boolean {
  if (!env.ADMIN_PASSWORD) return false;
  const a = crypto.createHash("sha256").update(input).digest();
  const b = crypto.createHash("sha256").update(env.ADMIN_PASSWORD).digest();
  return crypto.timingSafeEqual(a, b);
}

export function createSessionValue(): string {
  const expires = Date.now() + MAX_AGE_SECONDS * 1000;
  return `${expires}.${sign(String(expires))}`;
}

export function sessionIsValid(value: string | undefined): boolean {
  if (!value || !env.DOI_SECRET) return false;
  const [expiresRaw, sig] = value.split(".");
  if (!expiresRaw || !sig) return false;

  const expected = sign(expiresRaw);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;

  const expires = Number(expiresRaw);
  return Number.isFinite(expires) && Date.now() < expires;
}

export const SESSION_COOKIE = COOKIE;
export const SESSION_MAX_AGE = MAX_AGE_SECONDS;

/** Serverseitig prüfen, ob die aktuelle Anfrage angemeldet ist. */
export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return sessionIsValid(store.get(COOKIE)?.value);
}
