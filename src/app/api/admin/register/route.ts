import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getSupabaseServer } from "@/lib/supabase/server";
import { rateLimit, LIMITS, clientIp } from "@/lib/rateLimit";
import { hasSupabaseServer } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  code: z.string().trim().min(1, "Bitte geben Sie Ihren Einladungscode ein."),
  email: z.string().trim().email("Bitte geben Sie eine gültige E-Mail-Adresse an."),
  password: z.string().min(8, "Das Passwort muss mindestens 8 Zeichen haben."),
});

// Generische Fehlermeldung (§17.7).
const GENERIC = "Registrierung nicht möglich. Bitte prüfen Sie Ihre Angaben.";

export async function POST(req: Request) {
  if (!hasSupabaseServer()) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  // Rate-Limit (§16, §17.7).
  const ip = clientIp(req.headers);
  const rl = await rateLimit(ip, LIMITS.auth);
  if (!rl.success) {
    console.warn("[admin/register] rate limit exceeded");
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: GENERIC }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const first = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
    return NextResponse.json({ ok: false, error: first || GENERIC }, { status: 400 });
  }
  const { code, email, password } = parsed.data;

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  // 1) Einladungscode prüfen (existiert + unbenutzt).
  const { data: invite } = await admin
    .from("invite_codes")
    .select("id, code, role, used_by, email")
    .eq("code", code)
    .maybeSingle();

  if (!invite || invite.used_by) {
    return NextResponse.json(
      { ok: false, error: "Der Einladungscode ist ungültig oder wurde bereits verwendet." },
      { status: 400 }
    );
  }
  // Optional an E-Mail gebunden: dann muss sie passen.
  if (invite.email && invite.email.toLowerCase() !== email.toLowerCase()) {
    return NextResponse.json(
      { ok: false, error: "Dieser Einladungscode ist für eine andere E-Mail-Adresse bestimmt." },
      { status: 400 }
    );
  }

  // 2) Auth-User anlegen (E-Mail direkt bestätigt).
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (createErr || !created?.user) {
    // z. B. E-Mail bereits vergeben – generisch halten.
    return NextResponse.json({ ok: false, error: GENERIC }, { status: 400 });
  }
  const userId = created.user.id;

  // 3) Profil anlegen (Rolle aus Invite; Standard partner).
  const role = invite.role === "admin" ? "admin" : "partner";
  const { error: profErr } = await admin
    .from("profiles")
    .insert({ id: userId, email, role });
  if (profErr) {
    // Aufräumen: angelegten User wieder entfernen, damit kein Waisen-Account bleibt.
    await admin.auth.admin.deleteUser(userId);
    return NextResponse.json({ ok: false, error: GENERIC }, { status: 500 });
  }

  // 4) Code als verbraucht markieren (einmalig).
  await admin
    .from("invite_codes")
    .update({ used_by: userId, used_at: new Date().toISOString() })
    .eq("id", invite.id)
    .is("used_by", null);

  // 5) Direkt einloggen (Session-Cookies setzen).
  const supabase = await getSupabaseServer();
  if (supabase) {
    await supabase.auth.signInWithPassword({ email, password });
  }

  return NextResponse.json({ ok: true });
}
