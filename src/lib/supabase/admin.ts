import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env, hasSupabaseServer } from "@/lib/env";

/**
 * Supabase-Client mit Service-Role-Key (§17.1) — NUR serverseitig.
 * Umgeht RLS und wird für den Lead-Insert sowie Admin-Serveraktionen genutzt.
 * Gibt null zurück, wenn ENV fehlt (kein Crash, Feature inaktiv).
 */

let cached: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  if (!hasSupabaseServer()) return null;
  if (cached) return cached;
  cached = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return cached;
}
