import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import { env, hasSupabaseClient } from "@/lib/env";

/**
 * Supabase-Server-Client mit Cookie-basierter Session (§17.4).
 * Nutzt den anon-Key ausschließlich für Auth-Flows. Gibt null zurück, wenn
 * ENV fehlt — Aufrufer behandeln das als „nicht eingeloggt".
 */
export async function getSupabaseServer(): Promise<SupabaseClient | null> {
  if (!hasSupabaseClient()) return null;
  const cookieStore = await cookies();

  return createServerClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        cookiesToSet: {
          name: string;
          value: string;
          options?: Record<string, unknown>;
        }[]
      ) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // In Server Components ist set() nicht erlaubt — Middleware/Route Handler
          // aktualisieren die Session. Hier bewusst ignorieren.
        }
      },
    },
  });
}
