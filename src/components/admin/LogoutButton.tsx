"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const logout = async () => {
    setLoading(true);
    const supabase = getSupabaseBrowser();
    if (supabase) await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={logout}
      disabled={loading}
      className="text-small font-medium text-ink-soft underline-offset-2 hover:text-ink hover:underline disabled:opacity-60"
    >
      {loading ? "Abmelden …" : "Abmelden"}
    </button>
  );
}
