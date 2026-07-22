import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { Check } from "@/components/ui/Check";

/**
 * Vertrauens-Grid „Warum Sonnenwerk" — Jagdgrün-Sektion mit weißen Kacheln.
 * Die fünf Highlights aus dem Briefing (wörtlich) mit Häkchen.
 */
const HIGHLIGHTS = [
  "Wir holen mehrere, unterschiedliche Angebote von geprüften Fachbetrieben ein – der Kunde vergleicht und wählt das beste",
  "100 % kostenlos und unverbindlich – keine versteckten Gebühren",
  "Angebote innerhalb von 24–48 Stunden",
  "Nur geprüfte, regionale Fachbetriebe",
  "Wir sind der beste Partner, weil wir dem Kunden die Arbeit abnehmen: Er stellt 1 Anfrage – wir besorgen ihm die Auswahl",
];

export function WhyGrid() {
  return (
    <section id="warum" className="bg-hunter relative scroll-mt-24 overflow-hidden">
      <div aria-hidden className="hunter-glow pointer-events-none absolute inset-0" />
      <div className="container-page section-y relative">
        <SectionHeader
          light
          align="center"
          eyebrow="Vertrauen"
          title="Warum Sonnenwerk der beste Partner ist"
        />

        <div className="mx-auto mt-14 grid max-w-4xl grid-cols-1 gap-5 sm:grid-cols-2">
          {HIGHLIGHTS.map((h, i) => (
            <Reveal
              key={h}
              delay={i * 80}
              className={i === HIGHLIGHTS.length - 1 ? "sm:col-span-2" : ""}
            >
              <div className="card card-hover flex h-full items-start gap-4 p-6">
                <Check className="mt-0.5 h-6 w-6" />
                <p className="text-body leading-relaxed text-ink">{h}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
