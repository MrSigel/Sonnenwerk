import "server-only";
import { env, hasResend } from "./env";
import type { LeadInput } from "./schema";

/**
 * E-Mail-Versand ausschließlich über Resend (§8). Node-Runtime.
 * Sämtliche Mails (Lead, Kundenbestätigung, Newsletter-DOI, DOI-Beleg) laufen
 * hierüber. Bei fehlender ENV: Feature inaktiv, kein Crash.
 */

let resendClient: import("resend").Resend | null = null;
let triedInit = false;

async function getResend(): Promise<import("resend").Resend | null> {
  if (!hasResend()) return null;
  if (resendClient) return resendClient;
  if (triedInit) return resendClient;
  triedInit = true;
  try {
    const { Resend } = await import("resend");
    resendClient = new Resend(env.RESEND_API_KEY);
    return resendClient;
  } catch {
    return null;
  }
}

function esc(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function nowFormatted(): { iso: string; human: string } {
  const d = new Date();
  const iso = d.toISOString();
  const human = new Intl.DateTimeFormat("de-DE", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Europe/Berlin",
  }).format(d);
  return { iso, human };
}

const shell = (inner: string) => `
<!doctype html><html lang="de"><body style="margin:0;background:#F4F7F5;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0F1A15;">
  <div style="max-width:560px;margin:0 auto;padding:24px;">
    <div style="background:#FFFFFF;border:1px solid #E3E8E4;border-radius:14px;overflow:hidden;">
      <div style="background:#1F4A38;padding:18px 24px;color:#FFFFFF;font-weight:700;font-size:18px;">Sonnenwerk</div>
      <div style="padding:24px;">${inner}</div>
    </div>
    <p style="color:#47514B;font-size:12px;margin:16px 4px;">Geprüfte Solar-Angebote aus Ihrer Region.</p>
  </div>
</body></html>`;

type SendResult = { ok: boolean; error?: string };

async function send(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}): Promise<SendResult> {
  const client = await getResend();
  if (!client) return { ok: false, error: "resend-not-configured" };
  try {
    const { error } = await client.emails.send({
      from: env.MAIL_FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
      replyTo: opts.replyTo,
    });
    if (error) return { ok: false, error: String(error.message || error) };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "send-failed" };
  }
}

/* ─────────────────────────────────────────────────────────────
 * A) Lead-Mail an den Empfänger (das Unternehmen), reply_to = Kunde
 * ───────────────────────────────────────────────────────────── */
export async function sendLeadMail(lead: LeadInput): Promise<SendResult> {
  const { iso, human } = nowFormatted();
  const rows: [string, string][] = [
    ["Vorname", lead.vorname],
    ["Name", lead.name],
    ["Straße", lead.strasse],
    ["Hausnummer", lead.hausnummer],
    ["Postleitzahl", lead.plz],
    ["Ort", lead.ort],
    ["Telefonnummer", lead.telefon],
    ["E-Mail", lead.email],
    ["Hauseigentümer", lead.hauseigentuemer],
    ["Solar-Interesse", lead.solar_interesse],
    ["Newsletter", lead.newsletter ? "Ja" : "Nein"],
    ["Datenschutz", "akzeptiert"],
    ["Eingegangen am", `${human} (${iso})`],
    ["Quelle", "Sonnenwerk-Landingpage"],
  ];

  const htmlRows = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#47514B;white-space:nowrap;vertical-align:top;">${esc(
          k
        )}</td><td style="padding:6px 0;font-weight:600;">${esc(v)}</td></tr>`
    )
    .join("");

  const html = shell(`
    <h1 style="font-size:20px;margin:0 0 16px;">Neue Solar-Anfrage über Sonnenwerk</h1>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">${htmlRows}</table>
  `);

  const text = [
    "Neue Solar-Anfrage über Sonnenwerk",
    "",
    ...rows.map(([k, v]) => `${(k + ":").padEnd(20)}${v}`),
  ].join("\n");

  const subject = `Neue Solar-Anfrage – ${lead.vorname} ${lead.name}, ${lead.plz} ${lead.ort}`;

  return send({
    to: env.LEAD_RECIPIENT,
    subject,
    html,
    text,
    replyTo: lead.email,
  });
}

/* ─────────────────────────────────────────────────────────────
 * B) Bestätigungs-Mail an den Kunden
 * ───────────────────────────────────────────────────────────── */
export async function sendCustomerConfirmation(lead: LeadInput): Promise<SendResult> {
  const html = shell(`
    <h1 style="font-size:20px;margin:0 0 12px;">Vielen Dank, ${esc(lead.vorname)}!</h1>
    <p style="font-size:14px;line-height:1.6;margin:0 0 16px;">
      Ihre Anfrage ist bei uns eingegangen. Ein geprüfter Fachpartner aus Ihrer Region
      kontaktiert Sie <strong>innerhalb von 24–48 Stunden</strong> mit einem unverbindlichen Angebot.
    </p>
    <p style="font-size:14px;line-height:1.6;margin:0 0 8px;font-weight:600;">Ihre Angaben:</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:4px 12px 4px 0;color:#47514B;">Adresse</td><td style="padding:4px 0;">${esc(
        lead.strasse
      )} ${esc(lead.hausnummer)}, ${esc(lead.plz)} ${esc(lead.ort)}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#47514B;">Telefon</td><td style="padding:4px 0;">${esc(
        lead.telefon
      )}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#47514B;">E-Mail</td><td style="padding:4px 0;">${esc(
        lead.email
      )}</td></tr>
    </table>
    <p style="font-size:13px;line-height:1.6;color:#47514B;margin:16px 0 0;">
      Diese Vermittlung ist für Sie völlig kostenlos und unverbindlich.
    </p>
  `);

  const text = [
    `Vielen Dank, ${lead.vorname}!`,
    "",
    "Ihre Anfrage ist bei uns eingegangen. Ein geprüfter Fachpartner aus Ihrer Region",
    "kontaktiert Sie innerhalb von 24–48 Stunden mit einem unverbindlichen Angebot.",
    "",
    "Ihre Angaben:",
    `Adresse: ${lead.strasse} ${lead.hausnummer}, ${lead.plz} ${lead.ort}`,
    `Telefon: ${lead.telefon}`,
    `E-Mail:  ${lead.email}`,
    "",
    "Diese Vermittlung ist für Sie völlig kostenlos und unverbindlich.",
  ].join("\n");

  return send({
    to: lead.email,
    subject: "Ihre Anfrage bei Sonnenwerk ist eingegangen",
    html,
    text,
  });
}

/* ─────────────────────────────────────────────────────────────
 * Newsletter Double-Opt-in-Mail an den Kunden (§8A)
 * ───────────────────────────────────────────────────────────── */
export async function sendDoiMail(email: string, confirmUrl: string): Promise<SendResult> {
  const html = shell(`
    <h1 style="font-size:20px;margin:0 0 12px;">Bitte bestätigen Sie Ihre Newsletter-Anmeldung</h1>
    <p style="font-size:14px;line-height:1.6;margin:0 0 20px;">
      Sie haben unseren Newsletter mit Tipps und Förder-Updates abonniert.
      <strong>Nur wenn Sie bestätigen, erhalten Sie unseren Newsletter.</strong>
    </p>
    <p style="margin:0 0 20px;">
      <a href="${esc(confirmUrl)}" style="display:inline-block;background:#1F4A38;color:#FFFFFF;
        text-decoration:none;font-weight:600;padding:12px 22px;border-radius:999px;font-size:14px;">
        Newsletter-Anmeldung bestätigen
      </a>
    </p>
    <p style="font-size:12px;line-height:1.6;color:#47514B;margin:0;">
      Falls der Button nicht funktioniert, kopieren Sie diesen Link in Ihren Browser:<br>
      <span style="word-break:break-all;">${esc(confirmUrl)}</span>
    </p>
  `);

  const text = [
    "Bitte bestätigen Sie Ihre Newsletter-Anmeldung",
    "",
    "Sie haben unseren Newsletter abonniert. Nur wenn Sie bestätigen, erhalten Sie ihn.",
    "",
    "Bestätigungs-Link:",
    confirmUrl,
  ].join("\n");

  return send({
    to: email,
    subject: "Bitte bestätigen Sie Ihre Newsletter-Anmeldung",
    html,
    text,
  });
}

/* ─────────────────────────────────────────────────────────────
 * DOI-Beleg an den Empfänger (Nachweis, §8A.4)
 * ───────────────────────────────────────────────────────────── */
export async function sendDoiConfirmedNotice(
  email: string,
  signupIso: string
): Promise<SendResult> {
  const confirmedIso = new Date().toISOString();
  const html = shell(`
    <h1 style="font-size:18px;margin:0 0 12px;">Newsletter bestätigt</h1>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:4px 12px 4px 0;color:#47514B;">E-Mail</td><td style="padding:4px 0;font-weight:600;">${esc(
        email
      )}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#47514B;">Anmeldung</td><td style="padding:4px 0;">${esc(
        signupIso
      )}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#47514B;">Bestätigung</td><td style="padding:4px 0;">${esc(
        confirmedIso
      )}</td></tr>
    </table>
    <p style="font-size:12px;color:#47514B;margin:16px 0 0;">
      Double-Opt-in-Nachweis (DSGVO). Bitte für Ihre Unterlagen aufbewahren.
    </p>
  `);

  const text = [
    "Newsletter bestätigt",
    "",
    `E-Mail:      ${email}`,
    `Anmeldung:   ${signupIso}`,
    `Bestätigung: ${confirmedIso}`,
    "",
    "Double-Opt-in-Nachweis (DSGVO).",
  ].join("\n");

  return send({
    to: env.LEAD_RECIPIENT,
    subject: `Newsletter bestätigt – ${email}`,
    html,
    text,
  });
}
