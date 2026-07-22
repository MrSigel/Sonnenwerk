import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Bestätigungslink ungültig",
  robots: { index: false, follow: false },
};

export default function NewsletterInvalidPage() {
  return (
    <>
      <Header />
      <main className="container-page py-20">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="text-h2 font-bold tracking-tight text-ink">
            Bestätigungslink ungültig oder abgelaufen
          </h1>
          <p className="mt-4 text-body text-ink-soft">
            Der Link zur Newsletter-Bestätigung ist nicht mehr gültig. Bitte fordern Sie die
            Bestätigung erneut an, indem Sie bei Ihrer nächsten Anfrage den Newsletter
            aktivieren.
          </p>
          <Link href="/" className="btn-primary mt-8">
            Zur Startseite
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
