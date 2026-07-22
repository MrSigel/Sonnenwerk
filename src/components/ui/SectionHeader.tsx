import { Reveal } from "./Reveal";

/**
 * Wiederkehrendes Sektions-Muster: kleines Eyebrow-Label in Versalien über
 * einer großen, ruhigen H2 (+ optionaler Intro-Text). Referenz-Gestaltungsprinzip.
 */
export function SectionHeader({
  eyebrow,
  title,
  intro,
  align = "left",
  light = false,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  align?: "left" | "center";
  light?: boolean;
}) {
  return (
    <Reveal
      className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}
    >
      <p
        className={`text-small font-semibold uppercase tracking-[0.14em] ${
          light ? "text-accent-ink/70" : "text-accent"
        }`}
      >
        {eyebrow}
      </p>
      <h2
        className={`mt-3 text-h2 font-bold tracking-tight ${
          light ? "text-accent-ink" : "text-ink"
        }`}
      >
        {title}
      </h2>
      {intro && (
        <p
          className={`mt-5 text-body ${light ? "text-accent-ink/80" : "text-ink-soft"}`}
        >
          {intro}
        </p>
      )}
    </Reveal>
  );
}
