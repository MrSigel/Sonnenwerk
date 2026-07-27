import type { Metadata } from "next";
import Link from "next/link";
import { isAuthenticated } from "@/lib/admin/session";
import { hasAdmin } from "@/lib/env";
import { LoginForm } from "./LoginForm";
import { Dashboard } from "./Dashboard";
import { LogoutButton } from "./LogoutButton";

export const metadata: Metadata = {
  title: "Analytics",
  robots: { index: false, follow: false, nocache: true },
};

// Immer frisch rendern — Zahlen sollen aktuell sein.
export const dynamic = "force-dynamic";

const RANGES = [
  { days: 7, label: "7 Tage" },
  { days: 30, label: "30 Tage" },
  { days: 90, label: "90 Tage" },
];

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  if (!hasAdmin()) {
    return (
      <main className="container-page py-20">
        <div className="mx-auto max-w-lg">
          <h1 className="text-h2 font-bold tracking-tight text-ink">Analytics</h1>
          <p className="mt-4 text-body text-ink-soft">
            Der Bereich ist noch nicht eingerichtet. Bitte in Vercel die Variablen{" "}
            <code>ADMIN_PASSWORD</code> und <code>DOI_SECRET</code> setzen und neu deployen.
          </p>
        </div>
      </main>
    );
  }

  if (!(await isAuthenticated())) {
    return (
      <main className="container-page py-20">
        <LoginForm />
      </main>
    );
  }

  const params = await searchParams;
  const days = RANGES.some((r) => String(r.days) === params.days)
    ? Number(params.days)
    : 7;

  return (
    <main className="container-page py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-h2 font-bold tracking-tight text-ink">Analytics</h1>
          <p className="mt-1 text-small text-ink-soft">Sonnenwerk · anonyme Nutzungsdaten</p>
        </div>
        <div className="flex items-center gap-2">
          {RANGES.map((r) => (
            <Link
              key={r.days}
              href={`/admin?days=${r.days}`}
              className={
                r.days === days
                  ? "rounded-full bg-accent px-4 py-2 text-small font-medium text-accent-ink"
                  : "rounded-full border border-line px-4 py-2 text-small text-ink transition-colors hover:border-accent/50"
              }
            >
              {r.label}
            </Link>
          ))}
          <LogoutButton />
        </div>
      </div>

      <Dashboard days={days} />
    </main>
  );
}
