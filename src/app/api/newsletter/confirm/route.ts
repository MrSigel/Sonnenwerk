import { NextResponse } from "next/server";
import { verifyDoiToken } from "@/lib/doi";
import { sendDoiConfirmedNotice } from "@/lib/mail";
import { rateLimit, LIMITS, clientIp } from "@/lib/rateLimit";
import { hasResend, siteUrl } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const base = siteUrl();

  // Rate-Limit (§16).
  const ip = clientIp(req.headers);
  const rl = await rateLimit(ip, LIMITS.newsletterConfirm);
  if (!rl.success) {
    console.warn("[newsletter] rate limit exceeded");
    return NextResponse.redirect(`${base}/newsletter-link-ungueltig`, { status: 303 });
  }

  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token") || "";
  const result = verifyDoiToken(token);

  if (!result.valid) {
    return NextResponse.redirect(`${base}/newsletter-link-ungueltig`, { status: 303 });
  }

  // Anmeldung bestätigen: Beleg an Empfänger (kein DB-Flag mehr, kein Backend).
  if (hasResend()) {
    const notice = await sendDoiConfirmedNotice(
      result.email,
      new Date(result.iat).toISOString()
    );
    if (!notice.ok) console.error("[newsletter] confirm notice failed:", notice.error);
  }

  return NextResponse.redirect(`${base}/newsletter-bestaetigt`, { status: 303 });
}
