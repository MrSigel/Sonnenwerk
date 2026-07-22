import { NextResponse } from "next/server";
import { leadSchema } from "@/lib/schema";
import { insertLead } from "@/lib/leads";
import { sendLeadMail, sendCustomerConfirmation, sendDoiMail } from "@/lib/mail";
import { createDoiToken } from "@/lib/doi";
import { rateLimit, LIMITS, clientIp } from "@/lib/rateLimit";
import { hasDoi, hasResend, siteUrl } from "@/lib/env";

// Node-Runtime (Resend-SDK benötigt Node, kein Edge — §8.2).
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
  const loadedAt = typeof body.formLoadedAt === "number" ? body.formLoadedAt : 0;
  const tooFast = loadedAt > 0 && Date.now() - loadedAt < MIN_FILL_MS;
  if (honeypot.length > 0 || tooFast) {
    console.warn("[lead] spam heuristic triggered");
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

  // 1) Lead zuerst speichern (§17.3) — geht dem Mailversand voraus.
  const stored = await insertLead(lead);
  if (stored.configured && !stored.stored) {
    // Supabase eingerichtet, aber Insert fehlgeschlagen → 500, nichts versenden.
    console.error("[lead] supabase insert failed:", stored.error);
    return NextResponse.json({ ok: false, error: "storage" }, { status: 500 });
  }

  // 2) Mails versenden (§8.2). Fehler blockieren den Lead nicht.
  if (hasResend()) {
    const [leadMail, custMail] = await Promise.all([
      sendLeadMail(lead),
      sendCustomerConfirmation(lead),
    ]);
    if (!leadMail.ok) console.error("[lead] lead mail failed:", leadMail.error);
    if (!custMail.ok) console.error("[lead] customer mail failed:", custMail.error);

    // 3) Newsletter-DOI nur bei Opt-in und nur wenn konfiguriert (§8A).
    if (lead.newsletter && hasDoi()) {
      const token = createDoiToken(lead.email);
      const confirmUrl = `${siteUrl()}/api/newsletter/confirm?token=${encodeURIComponent(
        token
      )}`;
      const doi = await sendDoiMail(lead.email, confirmUrl);
      if (!doi.ok) console.error("[lead] doi mail failed:", doi.error);
    }
  } else {
    // Kein Resend konfiguriert: Lead ist ggf. gespeichert, Versand inaktiv.
    console.warn("[lead] resend not configured — emails skipped");
  }

  return NextResponse.json({ ok: true });
}

// Andere Methoden ablehnen.
export async function GET() {
  return NextResponse.json({ ok: false }, { status: 405 });
}
