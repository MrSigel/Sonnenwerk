import "server-only";
import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type AdminProfile = {
  id: string;
  email: string;
  role: "admin" | "partner";
};

/**
 * Liefert das Profil des eingeloggten Nutzers oder null.
 * Session wird über den Cookie-basierten Server-Client geprüft (§17.4),
 * das Profil (Rolle) über den Service-Role-Client gelesen.
 */
export async function getCurrentProfile(): Promise<AdminProfile | null> {
  const supabase = await getSupabaseServer();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = getSupabaseAdmin();
  if (!admin) return null;

  const { data: profile } = await admin
    .from("profiles")
    .select("id, email, role")
    .eq("id", user.id)
    .single();

  if (!profile) return null;
  return {
    id: profile.id,
    email: profile.email,
    role: profile.role === "admin" ? "admin" : "partner",
  };
}

/** Erzwingt eine gültige Session (sonst Redirect auf Login). */
export async function requireProfile(): Promise<AdminProfile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/admin/login");
  return profile;
}

/** Erzwingt Admin-Rolle (sonst Redirect ins Dashboard). */
export async function requireAdmin(): Promise<AdminProfile> {
  const profile = await requireProfile();
  if (profile.role !== "admin") redirect("/admin");
  return profile;
}
