import "server-only";
import { env, hasResend, hasDoi, siteUrl } from "./env";
import { COMPANY } from "./content";
import { createUnsubscribeToken } from "./doi";
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

const DEFAULT_FOOTER = `<p style="color:#47514B;font-size:12px;margin:16px 4px;">Geprüfte Solar-Angebote aus Ihrer Region.</p>`;

const shell = (inner: string, footer: string = DEFAULT_FOOTER) => `
<!doctype html><html lang="de"><body style="margin:0;background:#F4F7F5;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0F1A15;">
  <div style="max-width:560px;margin:0 auto;padding:24px;">
    <div style="background:#FFFFFF;border:1px solid #E3E8E4;border-radius:14px;overflow:hidden;">
      <div style="background:#1F4A38;padding:18px 24px;color:#FFFFFF;font-weight:700;font-size:18px;">Sonnenwerk</div>
      <div style="padding:24px;">${inner}</div>
    </div>
    ${footer}
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
 * Bestätigungs-Mail an den Kunden
 * ───────────────────────────────────────────────────────────── */

export const CUSTOMER_CONFIRMATION_SUBJECT =
  "Ihre Anfrage ist bei uns – ab jetzt übernehmen wir ☀️";

/** Abmeldelink: signiert und ohne Ablauf. Ohne DOI_SECRET Fallback auf Mailto. */
function unsubscribeUrl(email: string): string {
  if (!hasDoi()) {
    return `mailto:${COMPANY.privacyEmail}?subject=${encodeURIComponent("Abmeldung")}`;
  }
  const token = createUnsubscribeToken(email);
  return `${siteUrl()}/api/newsletter/unsubscribe?token=${encodeURIComponent(token)}`;
}

const STEP_ROWS = [
  "Wir gleichen Ihre Angaben mit unseren geprüften Fachbetrieben aus Ihrer Region ab.",
  "Ein Fachpartner aus Ihrer Nähe meldet sich innerhalb der nächsten 24 bis 48 Stunden bei Ihnen – meist zuerst telefonisch.",
  "Sie erhalten Ihr individuelles Angebot, vergleichen in Ruhe und entscheiden selbst. Ohne Druck, ohne Verpflichtung, ohne Kleingedrucktes.",
];

/** Reine Render-Funktion (auch für Vorschauzwecke nutzbar). */
export function renderCustomerConfirmation(
  vorname: string,
  unsubUrl: string
): { subject: string; html: string; text: string } {
  const steps = STEP_ROWS.map(
    (t, i) => `
      <tr>
        <td style="padding:0 12px 14px 0;vertical-align:top;width:28px;">
          <span style="display:inline-block;width:24px;height:24px;border-radius:999px;
            background:#1F4A38;color:#FFFFFF;font-size:13px;font-weight:700;
            text-align:center;line-height:24px;">${i + 1}</span>
        </td>
        <td style="padding:0 0 14px;font-size:15px;line-height:1.6;color:#0F1A15;">${t}</td>
      </tr>`
  ).join("");

  const html = shell(`
    <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">Hallo ${esc(vorname)},</p>

    <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
      herzlich willkommen bei Sonnenwerk – und danke für Ihr Vertrauen!
    </p>

    <p style="font-size:15px;line-height:1.6;margin:0 0 24px;">
      Ihre Anfrage ist bei uns eingegangen und läuft bereits. Das war der schwierigste Teil,
      und der hat Sie keine 60 Sekunden gekostet. Alles Weitere übernehmen jetzt wir.
    </p>

    <p style="font-size:15px;line-height:1.6;margin:0 0 14px;font-weight:700;">
      Was als Nächstes passiert:
    </p>
    <table style="width:100%;border-collapse:collapse;margin:0 0 8px;">${steps}</table>

    <div style="background:#F4F7F5;border-radius:12px;padding:16px 18px;margin:8px 0 24px;">
      <p style="font-size:15px;line-height:1.6;margin:0;">
        <strong>Ein kleiner Tipp, damit es richtig rund läuft:</strong> Legen Sie sich vorab Ihre
        letzte Stromrechnung und ein grobes Gefühl für Ihre Dachfläche zurecht. Damit kann Ihr
        Fachpartner deutlich präziser rechnen – und Sie sehen schneller, was Ihr Dach wirklich
        leisten kann.
      </p>
    </div>

    <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
      Und genau darum geht es ja: Ihr Dach steht ohnehin jeden Tag in der Sonne. Ab jetzt kann es
      dabei auch für Sie arbeiten – Jahr für Jahr, bei jedem Sonnenaufgang.
    </p>

    <p style="font-size:15px;line-height:1.6;margin:0 0 24px;">
      Alles Gute für Ihr Projekt – wir drücken die Daumen, dass Ihr Angebot genau das wird,
      worauf Sie gehofft haben. ☀️
    </p>

    <p style="font-size:15px;line-height:1.6;margin:0;">
      Sonnige Grüße<br>
      <strong>Ihr Sonnenwerk-Team</strong><br>
      <a href="${esc(siteUrl())}" style="color:#1F4A38;">www.sonnenwerk-solar.de</a>
    </p>
  `,
    `<div style="margin:16px 4px;color:#47514B;font-size:12px;line-height:1.6;">
      <p style="margin:0 0 10px;">
        Sie möchten keine weiteren Benachrichtigungen oder E-Mails von uns erhalten?
        Dann klicken Sie einfach
        <a href="${esc(unsubUrl)}" style="color:#47514B;">hier</a> –
        ein Klick genügt, und Sie hören nichts mehr von uns.
      </p>
      <p style="margin:0;">
        ${esc(COMPANY.legalName)} · ${esc(COMPANY.street)} · ${esc(COMPANY.city)}<br>
        ${esc(COMPANY.email)} · ${esc(COMPANY.phone)}
      </p>
    </div>`);

  const text = [
    `Hallo ${vorname},`,
    "",
    "herzlich willkommen bei Sonnenwerk – und danke für Ihr Vertrauen!",
    "",
    "Ihre Anfrage ist bei uns eingegangen und läuft bereits. Das war der schwierigste Teil,",
    "und der hat Sie keine 60 Sekunden gekostet. Alles Weitere übernehmen jetzt wir.",
    "",
    "Was als Nächstes passiert:",
    ...STEP_ROWS.map((t, i) => `${i + 1}. ${t}`),
    "",
    "Ein kleiner Tipp, damit es richtig rund läuft: Legen Sie sich vorab Ihre letzte",
    "Stromrechnung und ein grobes Gefühl für Ihre Dachfläche zurecht. Damit kann Ihr",
    "Fachpartner deutlich präziser rechnen – und Sie sehen schneller, was Ihr Dach",
    "wirklich leisten kann.",
    "",
    "Und genau darum geht es ja: Ihr Dach steht ohnehin jeden Tag in der Sonne. Ab jetzt",
    "kann es dabei auch für Sie arbeiten – Jahr für Jahr, bei jedem Sonnenaufgang.",
    "",
    "Alles Gute für Ihr Projekt – wir drücken die Daumen, dass Ihr Angebot genau das",
    "wird, worauf Sie gehofft haben.",
    "",
    "Sonnige Grüße",
    "Ihr Sonnenwerk-Team",
    siteUrl(),
    "",
    "—",
    "Sie möchten keine weiteren Benachrichtigungen oder E-Mails von uns erhalten?",
    `Dann klicken Sie einfach hier: ${unsubUrl}`,
    "",
    `${COMPANY.legalName} · ${COMPANY.street} · ${COMPANY.city}`,
    `${COMPANY.email} · ${COMPANY.phone}`,
  ].join("\n");

  return { subject: CUSTOMER_CONFIRMATION_SUBJECT, html, text };
}

export async function sendCustomerConfirmation(lead: LeadInput): Promise<SendResult> {
  const { subject, html, text } = renderCustomerConfirmation(
    lead.vorname,
    unsubscribeUrl(lead.email)
  );
  return send({ to: lead.email, subject, html, text });
}

/* ─────────────────────────────────────────────────────────────
 * Abmeldung: Beleg an den Empfänger (keine Abonnentendatenbank)
 * ───────────────────────────────────────────────────────────── */
export async function sendUnsubscribeNotice(email: string): Promise<SendResult> {
  const iso = new Date().toISOString();
  const html = shell(`
    <h1 style="font-size:18px;margin:0 0 12px;">Abmeldung eingegangen</h1>
    <p style="font-size:14px;line-height:1.6;margin:0 0 12px;">
      Folgende Adresse hat sich über den Abmeldelink abgemeldet und darf keine
      weiteren E-Mails erhalten:
    </p>
    <p style="font-size:15px;font-weight:700;margin:0 0 12px;">${esc(email)}</p>
    <p style="font-size:12px;color:#47514B;margin:0;">Zeitpunkt: ${esc(iso)}</p>
  `);

  const text = [
    "Abmeldung eingegangen",
    "",
    `E-Mail:    ${email}`,
    `Zeitpunkt: ${iso}`,
    "",
    "Diese Adresse darf keine weiteren E-Mails erhalten.",
  ].join("\n");

  return send({
    to: env.LEAD_RECIPIENT,
    subject: `Abmeldung – ${email}`,
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
