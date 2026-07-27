import { NextResponse } from "next/server";
import { trackPayload } from "@/lib/analytics/events";
import { recordEvents } from "@/lib/analytics/store";
import { rateLimit, clientIp } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 4_000;

/** Großzügig, da pro Seitenansicht mehrfach gesendet wird (Beacon). */
const LIMIT = { name: "track", limit: 60, windowMs: 60 * 1000, dayCap: 2000 };

/**
 * Nimmt anonyme Nutzungsereignisse entgegen (§Analytics).
 * Antwortet immer mit 204 — Analytics darf die Seite nie beeinträchtigen.
 */
export async function POST(req: Request) {
  const noContent = new NextResponse(null, { status: 204 });

  try {
    // Die IP dient ausschließlich dem Rate-Limit und wird nicht gespeichert.
    const rl = await rateLimit(clientIp(req.headers), LIMIT);
    if (!rl.success) return noContent;

    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) return noContent;

    const parsed = trackPayload.safeParse(JSON.parse(raw));
    if (!parsed.success) return noContent;

    await recordEvents(parsed.data);
  } catch {
    /* Analytics schlägt nie auf den Besucher durch. */
  }

  return noContent;
}
