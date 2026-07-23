import { NextResponse } from "next/server";
import { leadSchema } from "@/lib/schema";
import { sendToBitrix } from "@/lib/bitrix";
import { sendCustomerConfirmation, sendDoiMail } from "@/lib/mail";
import { createDoiToken } from "@/lib/doi";
import { rateLimit, LIMITS, clientIp } from "@/lib/rateLimit";
import { hasDoi, hasResend, siteUrl } from "@/lib/env";

// Node-Runtime.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIN_FILL_MS = 2000; // Zeitfalle (§9): Submit unter ~2 s = Spam.
const MAX_BODY_BYTES = 12_000;

export async function POST(req: Request) {
  // Nur POST + JSON.
  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return NextResponse.json({ ok: false }, { status: 415 });
  }

  // Rate-Limit (§16).
  const ip = clientIp(req.headers);
  const rl = await rateLimit(ip, LIMITS.lead);
  if (!rl.success) {
    console.warn("[lead] rate limit exceeded");
    return NextResponse.json(
      { ok: false, error: "rate_limited" },
      { status: 429 }
    );
  }

  // Body lesen + Größe begrenzen.
  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false }, { status: 413 });
  }

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // Honeypot + Zeitfalle (§9): leise als Erfolg quittieren, nichts verarbeiten.
  const body = json as Record<string, unknown>;
  const honeypot = typeof body.company === "string" ? body.company : "";
  // Ausfülldauer kommt fertig vom Client (skew-sicher). Fallback auf den alten
  // formLoadedAt-Zeitstempel nur für evtl. noch gecachte alte Clients.
  const fillMs =
    typeof body.fillMs === "number"
      ? body.fillMs
      : typeof body.formLoadedAt === "number" && body.formLoadedAt > 0
        ? Date.now() - body.formLoadedAt
        : null;
  const tooFast = fillMs !== null && fillMs >= 0 && fillMs < MIN_FILL_MS;
  if (honeypot.length > 0 || tooFast) {
    console.warn(
      `[lead] spam heuristic triggered — honeypotLen: ${honeypot.length}, tooFast: ${tooFast}, fillMs: ${
        fillMs ?? "n/a"
      }`
    );
    return NextResponse.json({ ok: true });
  }

  // Serverseitige Validierung mit demselben Zod-Schema (§7).
  const parsed = leadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "validation", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }
  const lead = parsed.data;
  const submittedAt = new Date().toISOString();

  // 1) Lead direkt an den Bitrix-/LIMITBREAKERS-Webhook übergeben (keine
  //    Backend-Speicherung mehr). Bei Fehler: freundliche Meldung, damit der
  //    Nutzer erneut senden kann (Dedup läuft empfängerseitig über Tel./E-Mail).
  const forwarded = await sendToBitrix(lead, submittedAt);
  if (forwarded.skipped) {
    // Webhook-URL nicht konfiguriert. In Produktion (inkl. Vercel-Preview, dort
    // ist NODE_ENV ebenfalls "production") darf das NICHT still als Erfolg
    // durchgehen — sonst gehen Leads unbemerkt verloren. Nur im lokalen Dev
    // (NODE_ENV=development) läuft das Formular ohne Webhook weiter.
    if (process.env.NODE_ENV === "production") {
      console.error(
        "[lead] BITRIX_WEBHOOK_URL not configured in this deployment — lead NOT forwarded (redeploy required after setting the ENV var)"
      );
      return NextResponse.json({ ok: false, error: "not_configured" }, { status: 502 });
    }
    console.warn("[lead] (dev) bitrix webhook not configured — continuing without forward");
  } else if (!forwarded.ok) {
    console.error(
      "[lead] bitrix forward failed — status:",
      forwarded.status ?? "-",
      "error:",
      forwarded.error ?? "-",
      "test:",
      forwarded.isTest,
      "id:",
      forwarded.supplierLeadId
    );
    return NextResponse.json({ ok: false, error: "forward" }, { status: 502 });
  } else {
    console.log(
      "[lead] forwarded OK — status:",
      forwarded.status,
      "test:",
      forwarded.isTest,
      "id:",
      forwarded.supplierLeadId
    );
  }

  // 2) Kundenbestätigung + Newsletter-DOI über Resend (nicht blockierend).
  if (hasResend()) {
    const custMail = await sendCustomerConfirmation(lead);
    if (!custMail.ok) console.error("[lead] customer mail failed:", custMail.error);

    if (lead.newsletter && hasDoi()) {
      const token = createDoiToken(lead.email);
      const confirmUrl = `${siteUrl()}/api/newsletter/confirm?token=${encodeURIComponent(
        token
      )}`;
      const doi = await sendDoiMail(lead.email, confirmUrl);
      if (!doi.ok) console.error("[lead] doi mail failed:", doi.error);
    }
  }

  return NextResponse.json({ ok: true });
}

// Andere Methoden ablehnen.
export async function GET() {
  return NextResponse.json({ ok: false }, { status: 405 });
}
