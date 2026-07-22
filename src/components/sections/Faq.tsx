"use client";

import { useId, useState } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";

/**
 * FAQ-Accordion (Jagdgrün-Sektion, zweispaltig). Fragen aus der Kundenvorlage,
 * Antworten neutral & sachlich: Sonnenwerk vermittelt – konkrete Details zum
 * Einzelfall klärt der geprüfte Fachpartner im Angebot.
 * Barrierefrei (aria-expanded/aria-controls, region), weiche Höhen-Animation.
 */
const FAQS: { q: string; a: string }[] = [
  {
    q: "Funktionieren Solarmodule im Winter oder bei bewölktem Wetter?",
    a: "Ja. Solarmodule erzeugen auch bei bewölktem Himmel und im Winter Strom – nur weniger als an sonnigen Tagen, da sie auf Tageslicht und nicht auf direkte Sonne angewiesen sind. Schnee rutscht von geneigten Modulen meist von selbst ab. Wie viel Ertrag an Ihrem Standort realistisch ist, bewertet der Fachpartner in seinem Angebot.",
  },
  {
    q: "Wie lange dauert die Installation? Wird mein Dach beschädigt?",
    a: "Die eigentliche Montage dauert bei einem Einfamilienhaus in der Regel ein bis wenige Tage. Fachgerecht installiert wird das Dach nicht beschädigt – die Befestigungen sind auf Dichtheit und Statik ausgelegt. Den genauen Ablauf und die Dauer stimmt der Fachbetrieb vorab mit Ihnen ab.",
  },
  {
    q: "Wer kümmert sich um die Genehmigungen und den Papierkram?",
    a: "In der Regel übernimmt der ausführende Fachbetrieb die Anmeldung beim Netzbetreiber und die nötige Registrierung. Welche Schritte in Ihrem Fall anfallen und was der Betrieb für Sie erledigt, klärt er in seinem Angebot.",
  },
  {
    q: "Wann amortisiert sich mein System?",
    a: "Das hängt von Anlagengröße, Stromverbrauch, Eigenverbrauchsanteil und den aktuellen Strompreisen ab. Je nach Situation liegt die Amortisationszeit häufig im Bereich mehrerer Jahre. Eine belastbare Rechnung für Ihr Zuhause erstellt der Fachpartner individuell.",
  },
  {
    q: "Brauche ich wirklich eine Batterie?",
    a: "Nein, ein Speicher ist kein Muss – eine Anlage funktioniert auch ohne. Ein Batteriespeicher erhöht jedoch den Eigenverbrauch, weil Sie tagsüber erzeugten Strom abends nutzen können. Ob sich ein Speicher für Sie lohnt, bewertet der Fachbetrieb anhand Ihres Verbrauchs.",
  },
  {
    q: "Benötigen Solarmodule Wartung oder Reinigung?",
    a: "Solarmodule sind weitgehend wartungsarm. Regen reinigt sie in der Regel ausreichend, eine gelegentliche Sichtprüfung genügt meist. Ob in Ihrem Fall eine Reinigung oder Wartung sinnvoll ist, erfahren Sie von Ihrem Fachpartner.",
  },
  {
    q: "Was passiert, wenn etwas kaputt geht?",
    a: "Auf Module, Wechselrichter und Montage gibt es üblicherweise Hersteller- und Handwerksgarantien. Im Fall der Fälle ist der Fachbetrieb Ihr Ansprechpartner. Die konkreten Garantie- und Serviceleistungen finden Sie im jeweiligen Angebot.",
  },
  {
    q: "Erhöht eine Solaranlage den Wert meiner Immobilie?",
    a: "Eine moderne, fachgerecht installierte Solaranlage kann die Attraktivität und den Wert einer Immobilie steigern, weil sie die laufenden Energiekosten senkt. Wie stark der Effekt ausfällt, hängt vom Objekt und vom Markt ab.",
  },
  {
    q: "Bin ich vor Stromausfällen geschützt?",
    a: "Nur bedingt: Eine Standard-Anlage schaltet bei einem Netzausfall aus Sicherheitsgründen ab. Mit einer Notstrom- oder Ersatzstromfunktion – meist in Verbindung mit einem Speicher – ist ein Weiterbetrieb möglich. Ob das für Sie infrage kommt, klärt der Fachpartner.",
  },
  {
    q: "Kann ich das System später erweitern?",
    a: "In vielen Fällen ja – etwa um zusätzliche Module, einen Speicher oder eine Wallbox fürs E-Auto. Ob und wie sich Ihre Anlage erweitern lässt, sollte schon bei der Planung berücksichtigt werden. Darauf geht der Fachbetrieb in der Beratung ein.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(null);
  const baseId = useId();

  const columns = [FAQS.slice(0, 5), FAQS.slice(5)];

  return (
    <section id="faq" className="bg-hunter relative scroll-mt-24 overflow-hidden">
      <div aria-hidden className="hunter-glow pointer-events-none absolute inset-0" />
      <div className="container-page section-y relative">
        <SectionHeader light eyebrow="Häufige Fragen" title="Antworten auf Ihre Fragen" />

        <Reveal className="mx-auto mt-12 max-w-6xl">
          <div className="grid gap-4 md:grid-cols-2 md:gap-5">
            {columns.map((col, colIdx) => (
              <div key={colIdx} className="flex flex-col gap-4">
                {col.map((item, j) => {
                  const idx = colIdx * 5 + j;
                  const isOpen = open === idx;
                  const panelId = `${baseId}-panel-${idx}`;
                  const btnId = `${baseId}-btn-${idx}`;
                  return (
                    <div
                      key={item.q}
                      className="overflow-hidden rounded-xl border border-white/12 bg-white/[0.04] backdrop-blur-sm transition-colors hover:border-white/25"
                    >
                      <h3>
                        <button
                          id={btnId}
                          type="button"
                          aria-expanded={isOpen}
                          aria-controls={panelId}
                          onClick={() => setOpen(isOpen ? null : idx)}
                          className="flex min-h-[4.75rem] w-full items-center justify-between gap-4 px-5 text-left"
                        >
                          <span className="text-[0.95rem] font-semibold leading-snug text-accent-ink">
                            {item.q}
                          </span>
                          <span
                            aria-hidden="true"
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/25 text-accent-ink transition-transform duration-300 ${
                              isOpen ? "rotate-45" : ""
                            }`}
                          >
                            <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                              <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                          </span>
                        </button>
                      </h3>
                      <div
                        id={panelId}
                        role="region"
                        aria-labelledby={btnId}
                        className={`grid transition-all duration-300 ease-out motion-reduce:transition-none ${
                          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <p className="px-5 pb-4 text-small leading-relaxed text-accent-ink/80">
                            {item.a}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
