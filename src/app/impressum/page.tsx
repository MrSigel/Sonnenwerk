import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { COMPANY } from "@/lib/content";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Impressum der Strom Distributor Vertriebs GmbH.",
};

export default function ImpressumPage() {
  return (
    <>
      <Header />
      <main className="container-page py-16">
        <article className="mx-auto max-w-2xl">
          <h1 className="text-h2 font-bold tracking-tight text-ink">Impressum</h1>

          <section className="mt-8 space-y-6 text-body text-ink">
            <div>
              <h2 className="text-h3 font-semibold">Angaben gemäß § 5 TMG</h2>
              <p className="mt-2 text-ink-soft">
                {COMPANY.legalName}
                <br />
                {COMPANY.street}
                <br />
                {COMPANY.city}
              </p>
            </div>

            <div>
              <h2 className="text-h3 font-semibold">Vertreten durch den Geschäftsführer</h2>
              <p className="mt-2 text-ink-soft">{COMPANY.ceo}</p>
            </div>

            <div>
              <h2 className="text-h3 font-semibold">Kontakt</h2>
              <p className="mt-2 text-ink-soft">
                E-Mail:{" "}
                <a href={`mailto:${COMPANY.email}`} className="text-accent underline underline-offset-2">
                  {COMPANY.email}
                </a>
                <br />
                Telefon: {COMPANY.phone}
              </p>
            </div>

            <div>
              <h2 className="text-h3 font-semibold">Eintragung im Handelsregister</h2>
              <p className="mt-2 text-ink-soft">
                Registerort: {COMPANY.registerCourt} · Registernummer: {COMPANY.registerNumber}
              </p>
            </div>

            <div>
              <h2 className="text-h3 font-semibold">Steuernummer</h2>
              <p className="mt-2 text-ink-soft">
                {COMPANY.taxNumber} · {COMPANY.taxOffice}
              </p>
            </div>
          </section>
        </article>
      </main>
      <Footer />
    </>
  );
}
