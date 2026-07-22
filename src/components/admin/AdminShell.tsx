import Image from "next/image";
import Link from "next/link";
import { LogoutButton } from "./LogoutButton";
import type { AdminProfile } from "@/lib/admin/auth";

/**
 * Rahmen für die geschützten Admin-Seiten: Topbar mit Logo, Navigation
 * (Einladungen nur für admin), Nutzer-E-Mail und Logout (§17.5).
 */
export function AdminShell({
  profile,
  active,
  children,
}: {
  profile: AdminProfile;
  active?: "leads" | "einladungen";
  children: React.ReactNode;
}) {
  return (
    <div>
      <header className="border-b border-line bg-paper">
        <div className="mx-auto flex max-w-content flex-col gap-3 px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="inline-flex">
              <Image
                src="/logos/sonnenwerk-lockup-hell.svg"
                alt="Sonnenwerk Admin"
                width={418}
                height={96}
                className="h-7 w-auto"
              />
            </Link>
            <nav className="flex items-center gap-4 text-small">
              <Link
                href="/admin"
                className={
                  active === "leads"
                    ? "font-semibold text-accent"
                    : "text-ink-soft hover:text-ink"
                }
              >
                Leads
              </Link>
              {profile.role === "admin" && (
                <Link
                  href="/admin/einladungen"
                  className={
                    active === "einladungen"
                      ? "font-semibold text-accent"
                      : "text-ink-soft hover:text-ink"
                  }
                >
                  Einladungen
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-4 text-small text-ink-soft">
            <span className="hidden sm:inline">
              {profile.email}
              <span className="ml-2 rounded-full bg-accent/10 px-2 py-0.5 text-[0.75rem] font-medium text-accent">
                {profile.role}
              </span>
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-content px-5 py-8 sm:px-8">{children}</main>
    </div>
  );
}
