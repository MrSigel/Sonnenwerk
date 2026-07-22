import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "@/components/admin/LoginForm";
import { hasSupabaseClient } from "@/lib/env";

export default function AdminLoginPage() {
  const configured = hasSupabaseClient();
  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex justify-center">
          <Image
            src="/logos/sonnenwerk-lockup-hell.svg"
            alt="Sonnenwerk"
            width={418}
            height={96}
            className="h-9 w-auto"
          />
        </Link>
        <div className="card mt-8 p-6">
          <h1 className="text-h3 font-semibold text-ink">Anmelden</h1>
          <p className="mt-1 text-small text-ink-soft">Interner Bereich – nur für registrierte Partner.</p>

          {configured ? (
            <LoginForm />
          ) : (
            <p className="mt-5 rounded-xl border border-line bg-paper-sunk px-4 py-3 text-small text-ink-soft">
              Der Admin-Bereich ist noch nicht konfiguriert. Bitte hinterlegen Sie die
              Supabase-Umgebungsvariablen (siehe SETUP.md).
            </p>
          )}

          <p className="mt-6 text-small text-ink-soft">
            Noch kein Zugang?{" "}
            <Link href="/admin/registrieren" className="text-accent underline underline-offset-2">
              Mit Einladungscode registrieren
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
