import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Check } from "@/components/ui/Check";

export const metadata: Metadata = {
  title: "Abmeldung bestätigt",
  robots: { index: false, follow: false },
};

export default function UnsubscribedPage() {
  return (
    <>
      <Header />
      <main className="container-page py-20">
        <div className="mx-auto max-w-xl text-center">
          <div className="flex justify-center">
            <Check className="h-10 w-10" />
          </div>
          <h1 className="mt-4 text-h2 font-bold tracking-tight text-ink">
            Sie sind abgemeldet
          </h1>
          <p className="mt-4 text-body text-ink-soft">
            Ihre Abmeldung ist bei uns eingegangen. Sie erhalten ab sofort keine weiteren
            E-Mails mehr von uns. Bereits angestoßene Angebotsanfragen bearbeiten unsere
            Fachpartner davon unabhängig weiter.
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
