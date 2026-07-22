"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase-Browser-Client für Auth-Flows (§17.4). Nutzt nur den öffentlichen
 * anon-Key. Gibt null zurück, wenn ENV fehlt (Login-UI zeigt dann Hinweis).
 */
let cached: SupabaseClient | null = null;

export function getSupabaseBrowser(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  if (cached) return cached;
  cached = createBrowserClient(url, anon);
  return cached;
}
