import { NextResponse } from "next/server";
import {
  passwordMatches,
  createSessionValue,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
} from "@/lib/admin/session";
import { rateLimit, LIMITS, clientIp } from "@/lib/rateLimit";
import { hasAdmin } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!hasAdmin()) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  // Brute-Force-Schutz.
  const rl = await rateLimit(clientIp(req.headers), LIMITS.auth);
  if (!rl.success) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let password = "";
  try {
    const body = (await req.json()) as { password?: unknown };
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!passwordMatches(password)) {
    console.warn("[admin] failed login attempt");
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, createSessionValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  // Eigene Besuche aus der Statistik heraushalten. Bewusst NICHT httpOnly —
  // der Tracker im Browser muss das Cookie lesen können. Es enthält keinerlei
  // Geheimnis, nur die Markierung „nicht mitzählen".
  res.cookies.set("sw_notrack", "1", {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 180 * 24 * 60 * 60,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  res.cookies.set("sw_notrack", "", { path: "/", maxAge: 0 });
  return res;
}
