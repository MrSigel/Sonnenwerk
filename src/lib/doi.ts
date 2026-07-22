import crypto from "node:crypto";
import { env } from "./env";

/**
 * Stateless Double-Opt-in-Token (§8A): signiert (HMAC mit DOI_SECRET),
 * enthält E-Mail + Anmelde-Timestamp, läuft nach 7 Tagen ab. Keine DB nötig.
 * Format: base64url(payload).base64url(hmac)
 */

const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

type Payload = { email: string; iat: number };

function b64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromB64url(input: string): Buffer {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  return Buffer.from(input.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
}

function sign(data: string): string {
  return b64url(crypto.createHmac("sha256", env.DOI_SECRET).update(data).digest());
}

/** Erzeugt einen Bestätigungs-Token für eine E-Mail (iat optional für Nachweis). */
export function createDoiToken(email: string, iat = Date.now()): string {
  const payload: Payload = { email: email.toLowerCase().trim(), iat };
  const encoded = b64url(JSON.stringify(payload));
  return `${encoded}.${sign(encoded)}`;
}

export type DoiVerifyResult =
  | { valid: true; email: string; iat: number }
  | { valid: false; reason: "malformed" | "signature" | "expired" };

/** Prüft Signatur und Ablauf eines DOI-Tokens (timing-safe). */
export function verifyDoiToken(token: string): DoiVerifyResult {
  if (!token || !env.DOI_SECRET) return { valid: false, reason: "malformed" };
  const parts = token.split(".");
  if (parts.length !== 2) return { valid: false, reason: "malformed" };
  const [encoded, sig] = parts;

  const expected = sign(encoded);
  const a = fromB64url(sig);
  const b = fromB64url(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return { valid: false, reason: "signature" };
  }

  let payload: Payload;
  try {
    payload = JSON.parse(fromB64url(encoded).toString("utf8"));
  } catch {
    return { valid: false, reason: "malformed" };
  }
  if (!payload?.email || typeof payload.iat !== "number") {
    return { valid: false, reason: "malformed" };
  }
  if (Date.now() - payload.iat > MAX_AGE_MS) {
    return { valid: false, reason: "expired" };
  }
  return { valid: true, email: payload.email, iat: payload.iat };
}
