import { Reveal } from "@/components/ui/Reveal";

/**
 * Wiederkehrendes CTA-Banner zwischen den Sektionen (Referenz-Prinzip).
 * Button scrollt sanft zurück zum Formular (#anfrage). Zwei Tonalitäten:
 * „accent" (Jägergrün-Band) und „sunk" (großer ruhiger Abschluss-Block).
 */
export function CtaBanner({
  eyebrow,
  title,
  text,
  buttonLabel = "Jetzt kostenlos Angebote erhalten",
  tone = "accent",
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  buttonLabel?: string;
  tone?: "accent" | "sunk";
}) {
  const accent = tone === "accent";
  return (
    <section className={`relative overflow-hidden ${accent ? "bg-hunter" : "bg-paper-sunk"}`}>
      {accent && <div aria-hidden className="hunter-glow pointer-events-none absolute inset-0" />}
      <div className="container-page section-y relative">
        <Reveal className="mx-auto max-w-3xl text-center">
          {eyebrow && (
            <p
              className={`text-small font-semibold uppercase tracking-[0.14em] ${
                accent ? "text-accent-ink/70" : "text-accent"
              }`}
            >
              {eyebrow}
            </p>
          )}
          <h2
            className={`mt-3 text-h2 font-bold tracking-tight ${
              accent ? "text-accent-ink" : "text-ink"
            }`}
          >
            {title}
          </h2>
          {text && (
            <p
              className={`mx-auto mt-4 max-w-xl text-body ${
                accent ? "text-accent-ink/80" : "text-ink-soft"
              }`}
            >
              {text}
            </p>
          )}
          <a
            href="#anfrage"
            className={`group mt-8 ${accent ? "btn-on-accent" : "btn-primary"}`}
          >
            {buttonLabel}
            <svg viewBox="0 0 20 20" fill="none" className="btn-arrow h-4 w-4">
              <path
                d="M4 10h11M11 5l5 5-5 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
