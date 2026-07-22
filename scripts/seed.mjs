/**
 * Seed-Skript (§17.6) — wird NICHT automatisch ausgeführt.
 * Legt Sebastian als `admin` an (aus ADMIN_SEED_EMAIL / ADMIN_SEED_PASSWORD)
 * und erzeugt einen ersten Einladungscode. Voraussetzung: Migration 0001 wurde
 * bereits im Supabase-SQL-Editor eingespielt (siehe SETUP.md).
 *
 * Start (mit befüllter .env.local):
 *   node --env-file=.env.local scripts/seed.mjs
 */

import { createClient } from "@supabase/supabase-js";
import crypto from "node:crypto";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.ADMIN_SEED_EMAIL;
const adminPassword = process.env.ADMIN_SEED_PASSWORD;

function fail(msg) {
  console.error(`\n✗ ${msg}\n`);
  process.exit(1);
}

if (!url || !serviceKey) {
  fail(
    "NEXT_PUBLIC_SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY müssen gesetzt sein. " +
      "Bitte .env.local befüllen und Skript mit `node --env-file=.env.local scripts/seed.mjs` starten."
  );
}
if (!adminEmail || !adminPassword) {
  fail("ADMIN_SEED_EMAIL und ADMIN_SEED_PASSWORD müssen gesetzt sein.");
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function generateCode() {
  // Gut lesbarer Einmal-Code, z. B. SW-8F3K-2QD7
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const block = () =>
    Array.from(crypto.randomBytes(4))
      .map((b) => alphabet[b % alphabet.length])
      .join("");
  return `SW-${block()}-${block()}`;
}

async function main() {
  console.log("→ Seed startet …");

  // 1) Admin-User anlegen (E-Mail bereits bestätigt).
  let adminUserId;
  const { data: created, error: createErr } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
  });

  if (createErr) {
    // Existiert der User schon? Dann per Auflistung finden.
    console.log(`  Hinweis beim Anlegen: ${createErr.message}`);
    const { data: list } = await supabase.auth.admin.listUsers();
    const found = list?.users?.find(
      (u) => u.email?.toLowerCase() === adminEmail.toLowerCase()
    );
    if (!found) fail("Admin-User konnte weder angelegt noch gefunden werden.");
    adminUserId = found.id;
    console.log("  Admin-User existierte bereits – verwende bestehenden.");
  } else {
    adminUserId = created.user.id;
    console.log("  ✓ Admin-User angelegt.");
  }

  // 2) Profil mit Rolle admin (idempotent).
  const { error: profErr } = await supabase.from("profiles").upsert(
    { id: adminUserId, email: adminEmail, role: "admin" },
    { onConflict: "id" }
  );
  if (profErr) fail(`Profil konnte nicht angelegt werden: ${profErr.message}`);
  console.log("  ✓ Admin-Profil gesetzt (role=admin).");

  // 3) Ersten Einladungscode erzeugen (für den ersten Partner).
  const code = generateCode();
  const { error: inviteErr } = await supabase
    .from("invite_codes")
    .insert({ code, role: "partner" });
  if (inviteErr) fail(`Einladungscode konnte nicht erzeugt werden: ${inviteErr.message}`);

  console.log("\n✓ Seed abgeschlossen.");
  console.log(`  Admin-Login:      ${adminEmail}`);
  console.log(`  Erster Einladungscode (Partner): ${code}`);
  console.log("\n  Diesen Code an den ersten Partner geben. Weitere Codes erzeugt");
  console.log("  Sebastian später im Admin-Bereich unter „Einladungen".\n");
}

main().catch((e) => fail(e?.message || String(e)));
