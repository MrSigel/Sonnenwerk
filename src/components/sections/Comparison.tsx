import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { Check } from "@/components/ui/Check";

/**
 * Vergleich „Der übliche Weg vs. Mit Sonnenwerk" — Jagdgrün-Sektion mit zwei
 * „Fenster"-Karten und einem animierten VS-Badge (Puls-Ring + rotierender Rand).
 */
const OLD_WAY = [
  "Selbst stundenlang nach Anbietern suchen",
  "Bei zig Firmen einzeln anfragen und hinterhertelefonieren",
  "Unklare Preise, kaum vergleichbare Angebote",
  "Ungewissheit, ob der Betrieb seriös ist",
  "Wochen vergehen, bis etwas passiert",
];

const NEW_WAY = [
  "Eine einzige Anfrage – in 60 Sekunden",
  "Wir holen mehrere Angebote für Sie ein",
  "Nur geprüfte, regionale Fachbetriebe",
  "In Ruhe vergleichen und selbst entscheiden",
  "Erste Rückmeldung in 24–48 Stunden",
];

function WindowDots({ tone }: { tone: "muted" | "accent" }) {
  const color = tone === "accent" ? "bg-accent/30" : "bg-white/25";
  return (
    <div className="flex gap-1.5">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
    </div>
  );
}

function Cross() {
  return (
    <span
      aria-hidden="true"
      className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/60"
    >
      <svg viewBox="0 0 20 20" fill="none" className="h-3 w-3">
        <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export function Comparison() {
  return (
    <section id="vergleich" className="bg-hunter relative scroll-mt-24 overflow-hidden">
      <div aria-hidden className="hunter-glow pointer-events-none absolute inset-0" />
      <div className="container-page section-y relative">
        <SectionHeader
          light
          align="center"
          eyebrow="Der Unterschied"
          title="Der übliche Weg vs. Mit Sonnenwerk"
          intro="Der Weg zur eigenen Solaranlage ist oft mühsam. Wir nehmen Ihnen die Arbeit ab – und machen aus vielen Anrufen eine einzige Anfrage."
        />

        <div className="mt-14 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[1fr_auto_1fr] lg:gap-4">
          {/* Fenster 1 — Der übliche Weg (gedämpft) */}
          <Reveal className="h-full">
            <div className="flex h-full flex-col rounded-2xl border border-white/12 bg-[#0F1A15]/25 backdrop-blur-sm">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
                <WindowDots tone="muted" />
                <span className="text-small font-medium text-white/60">Der übliche Weg</span>
              </div>
              <ul className="flex-1 space-y-3.5 p-6">
                {OLD_WAY.map((t) => (
                  <li key={t} className="flex items-start gap-3 text-body text-white/70">
                    <Cross />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* Animierter VS-Badge */}
          <div className="flex items-center justify-center py-1 lg:py-0">
            <div className="relative flex h-16 w-16 items-center justify-center">
              <span aria-hidden className="anim-pulse-ring absolute inset-0 rounded-full bg-white/25" />
              <span
                aria-hidden
                className="anim-spin-slow absolute inset-0 rounded-full"
                style={{
                  background:
                    "conic-gradient(from 0deg, rgba(255,255,255,0.95), rgba(255,255,255,0.05) 55%, rgba(255,255,255,0.95))",
                }}
              />
              <span className="relative flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-full bg-paper text-body font-bold tracking-wide text-accent shadow-lg">
                VS
              </span>
            </div>
          </div>

          {/* Fenster 2 — Mit Sonnenwerk (weiß, hebt sich ab) */}
          <Reveal className="h-full" delay={140}>
            <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-paper shadow-[0_24px_60px_-28px_rgba(0,0,0,0.5)]">
              <div className="flex items-center justify-between border-b border-line px-5 py-3">
                <WindowDots tone="accent" />
                <span className="text-small font-semibold text-accent">Mit Sonnenwerk</span>
              </div>
              <ul className="flex-1 space-y-3.5 p-6">
                {NEW_WAY.map((t) => (
                  <li key={t} className="flex items-start gap-3 text-body text-ink">
                    <Check className="mt-0.5" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
