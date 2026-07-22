import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/admin/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { generateInviteCode } from "@/lib/admin/invites";
import { rateLimit, LIMITS, clientIp } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

// Nur Admin (Sebastian) darf Einladungscodes erzeugen (§17.4).
export async function POST(req: Request) {
  const ip = clientIp(req.headers);
  const rl = await rateLimit(ip, LIMITS.auth);
  if (!rl.success) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  const profile = await getCurrentProfile();
  if (!profile) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (profile.role !== "admin") {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  let body: unknown = {};
  try {
    body = await req.json();
  } catch {
    /* leerer Body ist ok */
  }
  const parsed = schema.safeParse(body ?? {});
  const email = parsed.success ? parsed.data.email : undefined;

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  const code = generateInviteCode();
  const { data, error } = await admin
    .from("invite_codes")
    .insert({ code, email: email ?? null, role: "partner" })
    .select("id, code, email, role, used_by, used_at, created_at")
    .single();

  if (error) {
    console.error("[admin/invite] insert failed:", error.message);
    return NextResponse.json({ ok: false, error: "insert_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, invite: data });
}
