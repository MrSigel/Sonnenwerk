import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CookieSettingsLink } from "@/components/consent/CookieSettingsLink";
import { COMPANY } from "@/lib/content";

export const metadata: Metadata = {
  title: "Cookie-Richtlinie",
  description:
    "Welche Cookies wir einsetzen, zu welchem Zweck und wie Sie Ihre Einwilligung jederzeit widerrufen.",
};

const COOKIES = [
  {
    name: "sw_consent",
    provider: "Sonnenwerk (First-Party)",
    category: "Notwendig",
    purpose: "Speichert Ihre Cookie-Auswahl, damit sie bei weiteren Besuchen erhalten bleibt.",
    duration: "6 Monate",
  },
  {
    name: "_fbp",
    provider: "Meta Platforms Ireland Ltd.",
    category: "Marketing",
    purpose:
      "Meta-Pixel: Zuordnung von Besuchen und Conversions zur Messung unserer Werbeanzeigen.",
    duration: "ca. 3 Monate",
  },
  {
    name: "_fbc",
    provider: "Meta Platforms Ireland Ltd.",
    category: "Marketing",
    purpose: "Meta-Pixel: Zuordnung eines Anzeigen-Klicks (fbclid) zu einem Besuch.",
    duration: "ca. 3 Monate",
  },
];

export default function CookieRichtliniePage() {
  return (
    <>
      <Header />
      <main className="container-page py-16">
        <article className="mx-auto max-w-3xl space-y-10 text-body text-ink-soft [&_h2]:text-h3 [&_h2]:font-semibold [&_h2]:text-ink [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-2 [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul>li]:mt-1">
          <div>
            <h1 className="text-h2 font-bold tracking-tight text-ink">Cookie-Richtlinie</h1>
            <p>
              Diese Richtlinie erklärt, welche Cookies und ähnlichen Technologien auf dieser
              Website eingesetzt werden, zu welchem Zweck und wie Sie Ihre Einwilligung jederzeit
              anpassen oder widerrufen können. Ergänzende Informationen finden Sie in unserer{" "}
              <Link href="/datenschutz">Datenschutzerklärung</Link>.
            </p>
          </div>

          <section>
            <h2>1. Was sind Cookies?</h2>
            <p>
              Cookies sind kleine Textdateien, die auf Ihrem Gerät gespeichert werden. Sie sorgen
              dafür, dass eine Website funktioniert, merken sich Einstellungen oder helfen – nur mit
              Ihrer Einwilligung – bei der Reichweiten- und Conversion-Messung von Werbung.
            </p>
          </section>

          <section>
            <h2>2. Kategorien</h2>
            <ul>
              <li>
                <strong className="text-ink">Notwendig</strong> – erforderlich für den Betrieb der
                Seite und die Speicherung Ihrer Cookie-Auswahl. Diese Cookies sind immer aktiv und
                nicht abwählbar.
              </li>
              <li>
                <strong className="text-ink">Marketing</strong> – der Meta-Pixel zur Messung des
                Erfolgs unserer Anzeigen. Diese Cookies werden{" "}
                <strong className="text-ink">ausschließlich nach Ihrer Einwilligung</strong> gesetzt
                und sind standardmäßig deaktiviert.
              </li>
            </ul>
          </section>

          <section>
            <h2>3. Eingesetzte Cookies im Detail</h2>
            <div className="mt-4 overflow-x-auto rounded-card border border-line">
              <table className="w-full min-w-[640px] border-collapse text-small">
                <thead>
                  <tr className="border-b border-line bg-paper-sunk text-left text-ink-soft">
                    <th className="px-4 py-3 font-medium">Cookie</th>
                    <th className="px-4 py-3 font-medium">Anbieter</th>
                    <th className="px-4 py-3 font-medium">Kategorie</th>
                    <th className="px-4 py-3 font-medium">Zweck</th>
                    <th className="px-4 py-3 font-medium">Laufzeit</th>
                  </tr>
                </thead>
                <tbody>
                  {COOKIES.map((c) => (
                    <tr key={c.name} className="border-b border-line last:border-0 align-top">
                      <td className="px-4 py-3 font-mono font-medium text-ink">{c.name}</td>
                      <td className="px-4 py-3 text-ink-soft">{c.provider}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[0.75rem] font-medium text-accent">
                          {c.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ink-soft">{c.purpose}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-ink-soft">{c.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              Der Meta-Pixel lädt zusätzlich ein Skript von Meta (connect.facebook.net) – ebenfalls
              erst nach Ihrer Einwilligung. Für die Adress-Autovervollständigung im Formular werden{" "}
              <strong className="text-ink">keine</strong> Cookies gesetzt.
            </p>
          </section>

          <section>
            <h2>4. Rechtsgrundlage</h2>
            <p>
              Notwendige Cookies setzen wir auf Grundlage unseres berechtigten Interesses am Betrieb
              der Seite (Art. 6 Abs. 1 lit. f DSGVO). Marketing-Cookies setzen wir ausschließlich auf
              Grundlage Ihrer Einwilligung (Art. 6 Abs. 1 lit. a DSGVO, § 25 Abs. 1 TDDDG).
            </p>
          </section>

          <section>
            <h2>5. Einwilligung anpassen oder widerrufen</h2>
            <p>
              Sie können Ihre Auswahl jederzeit ändern. Beim Widerruf werden die zugehörigen
              Marketing-Cookies entfernt und der Meta-Pixel nicht mehr geladen.
            </p>
            <p>
              <CookieSettingsLink className="font-medium text-accent underline underline-offset-2" />{" "}
              öffnet erneut das Auswahlfenster. Denselben Link finden Sie auch im Fußbereich jeder
              Seite.
            </p>
          </section>

          <section>
            <h2>6. Kontakt</h2>
            <p>
              Bei Fragen zum Datenschutz erreichen Sie uns unter{" "}
              <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.
            </p>
          </section>
        </article>
      </main>
      <Footer />
    </>
  );
}
