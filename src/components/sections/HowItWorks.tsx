import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { IconForm, IconPhone, IconScale } from "@/components/ui/icons";

/**
 * „So funktioniert es" — 3 Schritte, Titel wörtlich aus dem Briefing, mit
 * animierten Icons, großer Nummerierung (01–03) und gestaffelter Einblendung.
 */
const STEPS = [
  {
    Icon: IconForm,
    title: "Formular ausfüllen – dauert nur 60 Sekunden",
    text: "Ein kurzes Formular mit Ihren Eckdaten genügt. Kein Konto, kein Aufwand.",
  },
  {
    Icon: IconPhone,
    title: "Fachpartner aus Ihrer Region meldet sich innerhalb von 24–48 Stunden",
    text: "Ein geprüfter Betrieb aus Ihrer Nähe nimmt Kontakt auf – meist zuerst telefonisch.",
  },
  {
    Icon: IconScale,
    title: "Angebote vergleichen und in Ruhe entscheiden",
    text: "Sie erhalten unterschiedliche Angebote, vergleichen in Ruhe und wählen das beste.",
  },
];

export function HowItWorks() {
  return (
    <section id="ablauf" className="scroll-mt-24 bg-paper">
      <div className="container-page section-y">
        <SectionHeader eyebrow="So funktioniert es" title="In drei Schritten zu Ihren Angeboten" />

        <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <Reveal key={step.title} delay={i * 120}>
              <div className="group relative h-full rounded-card border border-line bg-paper p-6 transition duration-300 motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-[0_18px_50px_-22px_rgba(15,26,21,0.28)]">
                <div className="flex items-center justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-accent-ink">
                    <step.Icon className="h-7 w-7 motion-safe:anim-float" />
                  </div>
                  <span className="text-[2.75rem] font-bold leading-none tracking-tight text-accent/15">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-5 text-h3 font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 text-body leading-relaxed text-ink-soft">{step.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
