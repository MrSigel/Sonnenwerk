"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/admin/login", { method: "DELETE" });
        router.refresh();
      }}
      className="rounded-full border border-line px-4 py-2 text-small text-ink-soft transition-colors hover:border-accent/50 hover:text-ink"
    >
      Abmelden
    </button>
  );
}
