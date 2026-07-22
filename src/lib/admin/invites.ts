import "server-only";
import crypto from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type InviteRow = {
  id: string;
  code: string;
  email: string | null;
  role: "admin" | "partner";
  used_by: string | null;
  used_at: string | null;
  created_at: string;
};

export type PartnerRow = {
  id: string;
  email: string;
  role: "admin" | "partner";
  created_at: string;
};

export function generateInviteCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const block = () =>
    Array.from(crypto.randomBytes(4))
      .map((b) => alphabet[b % alphabet.length])
      .join("");
  return `SW-${block()}-${block()}`;
}

export async function fetchInvites(): Promise<InviteRow[]> {
  const admin = getSupabaseAdmin();
  if (!admin) return [];
  const { data, error } = await admin
    .from("invite_codes")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[admin] fetchInvites failed:", error.message);
    return [];
  }
  return (data as InviteRow[]) ?? [];
}

export async function fetchPartners(): Promise<PartnerRow[]> {
  const admin = getSupabaseAdmin();
  if (!admin) return [];
  const { data, error } = await admin
    .from("profiles")
    .select("id, email, role, created_at")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[admin] fetchPartners failed:", error.message);
    return [];
  }
  return (data as PartnerRow[]) ?? [];
}
