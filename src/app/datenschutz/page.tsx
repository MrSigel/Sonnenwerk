import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { COMPANY } from "@/lib/content";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  description:
    "Informationen zur Verarbeitung Ihrer personenbezogenen Daten gemäß DSGVO.",
};

export default function DatenschutzPage() {
  return (
    <>
      <Header />
      <main className="container-page py-16">
        <article className="mx-auto max-w-2xl space-y-10 text-body text-ink-soft [&_h2]:text-h3 [&_h2]:font-semibold [&_h2]:text-ink [&_h3]:font-semibold [&_h3]:text-ink [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-2 [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul>li]:mt-1">
          <div>
            <h1 className="text-h2 font-bold tracking-tight text-ink">Datenschutzerklärung</h1>
            <p>
              Der Schutz Ihrer personenbezogenen Daten ist uns wichtig. Nachfolgend
              informieren wir Sie gemäß der Datenschutz-Grundverordnung (DSGVO) über Art,
              Umfang und Zweck der Verarbeitung personenbezogener Daten im Zusammenhang mit
              dieser Website und dem darüber angebotenen Vermittlungsdienst für
              Solar-Angebote.
            </p>
          </div>

          <section>
            <h2>1. Verantwortlicher</h2>
            <p>
              Verantwortlich für die Datenverarbeitung im Sinne der DSGVO ist:
            </p>
            <p>
              {COMPANY.legalName}
              <br />
              {COMPANY.street}
              <br />
              {COMPANY.city}
              <br />
              Vertreten durch den Geschäftsführer: {COMPANY.ceo}
              <br />
              E-Mail:{" "}
              <a href={`mailto:${COMPANY.privacyEmail}`}>{COMPANY.privacyEmail}</a>
              <br />
              Telefon: {COMPANY.phone}
            </p>
          </section>

          <section>
            <h2>2. Welche Daten wir verarbeiten</h2>
            <p>
              Wenn Sie unser Kontaktformular ausfüllen, verarbeiten wir die von Ihnen
              angegebenen Daten, um Ihre Anfrage an geprüfte Solar-Fachbetriebe zu
              vermitteln. Erhoben werden:
            </p>
            <ul>
              <li>Vorname und Name</li>
              <li>Adresse (Straße, Hausnummer, Postleitzahl, Ort)</li>
              <li>Telefonnummer</li>
              <li>E-Mail-Adresse</li>
              <li>Angabe, ob Sie Hauseigentümer sind</li>
              <li>Angabe, ob Interesse an einem Solarangebot besteht</li>
              <li>Ihre Einwilligung in die Kontaktaufnahme (Datenschutz-Häkchen)</li>
              <li>optional: Ihre Einwilligung zum Newsletter-Empfang</li>
              <li>Zeitpunkt des Eingangs der Anfrage</li>
            </ul>
          </section>

          <section>
            <h2>3. Zweck und Rechtsgrundlage der Verarbeitung</h2>
            <p>
              Zweck der Verarbeitung ist die Vermittlung Ihrer Anfrage an regionale
              Solar-Fachbetriebe, damit diese Ihnen unverbindliche Angebote unterbreiten
              können. Rechtsgrundlage ist Ihre Einwilligung (Art. 6 Abs. 1 lit. a DSGVO)
              sowie die Durchführung vorvertraglicher Maßnahmen auf Ihre Anfrage hin
              (Art. 6 Abs. 1 lit. b DSGVO).
            </p>
          </section>

          <section>
            <h2>4. Weitergabe an Fachpartner</h2>
            <p>
              Zur Erfüllung des von Ihnen gewünschten Zwecks geben wir die von Ihnen
              angegebenen Daten an ausgewählte, geprüfte Solar-Fachbetriebe aus Ihrer
              Region weiter. Diese kontaktieren Sie, um Ihnen ein Angebot zu unterbreiten.
              Die Weitergabe erfolgt ausschließlich auf Grundlage Ihrer Einwilligung
              (Art. 6 Abs. 1 lit. a und b DSGVO).
            </p>
          </section>

          <section>
            <h2>5. Verarbeitung über den E-Mail-Dienstleister Resend</h2>
            <p>
              Für den Versand der Anfrage- und Bestätigungs-E-Mails nutzen wir den Dienst
              Resend (Resend, Inc., USA) als Auftragsverarbeiter. Dabei werden die von
              Ihnen im Formular angegebenen Daten zum Zweck des E-Mail-Versands
              verarbeitet. Eine Übermittlung in ein Drittland (USA) kann stattfinden; diese
              erfolgt auf Grundlage geeigneter Garantien (u. a. Standardvertragsklauseln
              gemäß Art. 46 DSGVO). Rechtsgrundlage ist Art. 6 Abs. 1 lit. b und f DSGVO.
            </p>
          </section>

          <section>
            <h2>6. Übermittlung an den Vermittlungspartner</h2>
            <p>
              Zur Vermittlung Ihrer Anfrage werden die von Ihnen angegebenen Daten über eine
              gesicherte Schnittstelle (Webhook) an unseren Vermittlungspartner übermittelt,
              der die Anfrage an geeignete, geprüfte Solar-Fachbetriebe weiterleitet. Zweck
              ist die Bearbeitung und Weitervermittlung Ihrer Anfrage. Rechtsgrundlage ist
              Art. 6 Abs. 1 lit. a und b DSGVO (Einwilligung sowie Vertragsanbahnung auf Ihre
              Anfrage hin). Eine dauerhafte Speicherung der Anfragedaten in einer eigenen
              Datenbank des Betreibers findet nicht statt.
            </p>
          </section>

          <section>
            <h2>7. Newsletter (Double-Opt-in)</h2>
            <p>
              Wenn Sie den Newsletter abonnieren, verwenden wir Ihre E-Mail-Adresse, um
              Ihnen Tipps und Förder-Updates zuzusenden. Die Anmeldung erfolgt im
              Double-Opt-in-Verfahren: Nach Ihrer Anmeldung erhalten Sie eine
              Bestätigungs-E-Mail. Erst nach Bestätigung des enthaltenen Links erhalten Sie
              den Newsletter. Zum Nachweis Ihrer Einwilligung protokollieren wir den
              Zeitpunkt der Anmeldung, den Zeitpunkt der Bestätigung sowie Ihre
              E-Mail-Adresse. Rechtsgrundlage ist Ihre Einwilligung (Art. 6 Abs. 1 lit. a
              DSGVO). Sie können Ihre Einwilligung jederzeit mit Wirkung für die Zukunft
              widerrufen, z. B. per E-Mail an <a href={`mailto:${COMPANY.privacyEmail}`}>{COMPANY.privacyEmail}</a>.
            </p>
          </section>

          <section>
            <h2>8. Cookies und Einwilligung</h2>
            <p>
              Wir verwenden technisch notwendige Cookies, die für den Betrieb der Website
              und die Speicherung Ihrer Datenschutz-Auswahl erforderlich sind. Diese sind
              nicht abwählbar. Marketing-Cookies (siehe Meta-Pixel) setzen wir nur mit Ihrer
              ausdrücklichen Einwilligung. Ihre Auswahl speichern wir in einem
              First-Party-Cookie (Laufzeit ca. 6 Monate). Sie können Ihre Einwilligung
              jederzeit über den Link „Cookie-Einstellungen" im Fußbereich widerrufen oder
              anpassen.
            </p>
          </section>

          <section>
            <h2>9. Meta-Pixel und Meta Ads</h2>
            <p>
              Diese Website nutzt – nur nach Ihrer Einwilligung – den Meta-Pixel, ein
              Angebot der Meta Platforms Ireland Ltd. Der Meta-Pixel dient der Messung von
              Conversions und der Reichweite unserer Werbeanzeigen. Er lädt ausschließlich,
              wenn Sie im Cookie-Banner der Kategorie „Marketing" zugestimmt haben.
              Rechtsgrundlage ist Ihre Einwilligung (Art. 6 Abs. 1 lit. a DSGVO). Dabei kann
              eine Übermittlung von Daten an Meta erfolgen, auch in die USA; diese erfolgt
              auf Grundlage geeigneter Garantien (u. a. Standardvertragsklauseln). Sie
              können Ihre Einwilligung jederzeit über „Cookie-Einstellungen" widerrufen; der
              Pixel wird dann nicht mehr geladen und zugehörige Cookies werden entfernt.
            </p>
          </section>

          <section>
            <h2>10. Adress-Autovervollständigung (Photon / OpenStreetMap)</h2>
            <p>
              Zur komfortableren und fehlerärmeren Eingabe bieten wir in den Feldern Straße,
              Postleitzahl und Ort eine Autovervollständigung an. Während der Eingabe wird
              der von Ihnen getippte Text an unseren Server gesendet, der daraus über den
              Dienst Photon (basierend auf den Daten von OpenStreetMap) passende
              Adressvorschläge abruft. Photon wird in der Europäischen Union betrieben.
            </p>
            <p>
              Die Anfrage erfolgt über unseren Server als Vermittler; Ihre IP-Adresse wird
              dabei <strong>nicht</strong> an den Photon-Dienst übermittelt, sondern nur der
              Suchtext. Es werden hierfür keine Cookies gesetzt. Zweck ist die
              Eingabeerleichterung und Datenqualität, Rechtsgrundlage ist Art. 6 Abs. 1
              lit. b und f DSGVO. Die Funktion ist optional – Sie können alle Adressfelder
              jederzeit manuell ausfüllen. Ein Einsatz von Google-Diensten (z. B. Google
              Places) findet nicht statt; sollte dieser künftig aktiviert werden, würde die
              Google Ireland Ltd. hier als Empfänger ergänzt.
            </p>
          </section>

          <section>
            <h2>11. Speicherdauer</h2>
            <p>
              Wir speichern Ihre Daten nur so lange, wie es für die genannten Zwecke
              erforderlich ist oder gesetzliche Aufbewahrungsfristen dies vorsehen. Danach
              werden Ihre Daten gelöscht. Newsletter-Daten speichern wir bis zum Widerruf
              Ihrer Einwilligung.
            </p>
          </section>

          <section>
            <h2>12. Ihre Rechte</h2>
            <p>Ihnen stehen nach der DSGVO folgende Rechte zu:</p>
            <ul>
              <li>Recht auf Auskunft (Art. 15 DSGVO)</li>
              <li>Recht auf Berichtigung (Art. 16 DSGVO)</li>
              <li>Recht auf Löschung (Art. 17 DSGVO)</li>
              <li>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
              <li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
              <li>Recht auf Widerspruch (Art. 21 DSGVO)</li>
              <li>
                Recht auf Widerruf einer erteilten Einwilligung mit Wirkung für die Zukunft
                (Art. 7 Abs. 3 DSGVO)
              </li>
              <li>Recht auf Beschwerde bei einer Aufsichtsbehörde (Art. 77 DSGVO)</li>
            </ul>
            <p>
              Zur Ausübung Ihrer Rechte oder bei Fragen zum Datenschutz wenden Sie sich
              bitte an <a href={`mailto:${COMPANY.privacyEmail}`}>{COMPANY.privacyEmail}</a>.
            </p>
          </section>

          <section>
            <h2>13. Empfänger / eingesetzte Dienstleister im Überblick</h2>
            <ul>
              <li>Resend, Inc. (USA) – E-Mail-Versand</li>
              <li>Vermittlungspartner – Weiterleitung der Anfrage an Solar-Fachbetriebe (per Webhook)</li>
              <li>Meta Platforms Ireland Ltd. – Meta-Pixel / Meta Ads (nur mit Einwilligung)</li>
              <li>Photon / OpenStreetMap (EU) – Adress-Autovervollständigung im Formular</li>
            </ul>
          </section>
        </article>
      </main>
      <Footer />
    </>
  );
}
