import { NextResponse } from "next/server";
import { verifyUnsubscribeToken } from "@/lib/doi";
import { sendUnsubscribeNotice } from "@/lib/mail";
import { rateLimit, LIMITS, clientIp } from "@/lib/rateLimit";
import { hasResend, siteUrl } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Abmeldung aus dem Abmeldelink der Bestätigungs-Mail.
 * Es gibt keine Abonnentendatenbank (kein Backend-Speicher), daher wird die
 * Abmeldung als Beleg an LEAD_RECIPIENT gemeldet und dort umgesetzt.
 */
export async function GET(req: Request) {
  const base = siteUrl();

  const ip = clientIp(req.headers);
  const rl = await rateLimit(ip, LIMITS.newsletterConfirm);
  if (!rl.success) {
    console.warn("[unsubscribe] rate limit exceeded");
    return NextResponse.redirect(`${base}/newsletter-link-ungueltig`, { status: 303 });
  }

  const { searchParams } = new URL(req.url);
  const result = verifyUnsubscribeToken(searchParams.get("token") || "");
  if (!result.valid) {
    return NextResponse.redirect(`${base}/newsletter-link-ungueltig`, { status: 303 });
  }

  if (hasResend()) {
    const notice = await sendUnsubscribeNotice(result.email);
    if (!notice.ok) console.error("[unsubscribe] notice failed:", notice.error);
  }

  return NextResponse.redirect(`${base}/abgemeldet`, { status: 303 });
}
