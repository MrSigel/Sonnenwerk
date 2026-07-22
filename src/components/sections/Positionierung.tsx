import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import {
  IconShieldCheck,
  IconLayers,
  IconEuro,
  IconMapPin,
} from "@/components/ui/icons";

/**
 * Positionierung — Eyebrow + H2, darunter 4 Wertesäulen mit animierten Icons.
 * Intro = wörtlicher „Warum wir"-Text aus dem Briefing.
 */
const PILLARS = [
  {
    Icon: IconShieldCheck,
    title: "Geprüfte Fachbetriebe",
    text: "Nur qualifizierte, regionale Solarbetriebe – vorab geprüft. Kein Callcenter.",
  },
  {
    Icon: IconLayers,
    title: "Mehrere Angebote, eine Anfrage",
    text: "Ein Formular, mehrere Angebote zum Vergleich. Sie wählen in Ruhe.",
  },
  {
    Icon: IconEuro,
    title: "100 % kostenlos",
    text: "Keine versteckten Gebühren, keine Verpflichtung, kein Kleingedrucktes.",
  },
  {
    Icon: IconMapPin,
    title: "Regional & schnell",
    text: "Ein Fachpartner aus Ihrer Nähe meldet sich in 24–48 Stunden.",
  },
];

export function Positionierung() {
  return (
    <section id="vorteile" className="scroll-mt-24 bg-paper-sunk">
      <div className="container-page section-y">
        <SectionHeader
          eyebrow="Positionierung"
          title="Sie stellen eine Anfrage – wir besorgen Ihnen die Auswahl."
          intro="Sie müssen nicht selbst suchen, vergleichen und hinterhertelefonieren. Sie stellen eine Anfrage – wir besorgen Ihnen die Auswahl: mehrere, unterschiedliche Angebote von geprüften Fachbetrieben, damit Sie das beste für Ihr Zuhause wählen können."
        />

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p, i) => (
            <Reveal key={p.title} delay={i * 90}>
              <div className="card card-hover group h-full p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-accent-ink">
                  <p.Icon className="h-6 w-6 motion-safe:anim-float" />
                </div>
                <h3 className="mt-5 text-h3 font-semibold text-ink">{p.title}</h3>
                <p className="mt-2 text-small leading-relaxed text-ink-soft">{p.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
