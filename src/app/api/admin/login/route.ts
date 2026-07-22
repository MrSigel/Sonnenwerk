import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServer } from "@/lib/supabase/server";
import { rateLimit, LIMITS, clientIp } from "@/lib/rateLimit";
import { hasSupabaseClient } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Generische Fehlermeldung (§17.7) – verrät nicht, ob die E-Mail existiert.
const GENERIC = "E-Mail oder Passwort ist nicht korrekt.";

export async function POST(req: Request) {
  if (!hasSupabaseClient()) {
    return NextResponse.json(
      { ok: false, error: "not_configured" },
      { status: 503 }
    );
  }

  // Brute-Force-Schutz (§16, §17.7).
  const ip = clientIp(req.headers);
  const rl = await rateLimit(ip, LIMITS.auth);
  if (!rl.success) {
    console.warn("[admin/login] rate limit exceeded");
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
    return NextResponse.json({ ok: false, error: GENERIC }, { status: 400 });
  }

  const supabase = await getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return NextResponse.json({ ok: false, error: GENERIC }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
