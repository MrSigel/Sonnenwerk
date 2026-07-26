"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { LeadForm } from "@/components/form/LeadForm";
import { TrustBadges } from "./TrustBadges";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Eigenständiger, bildstarker Hero + darunter das Kontaktformular.
 *
 * - Hero: Vollflächen-Bild (moderne Sichtbeton-Architektur) mit Jagdgrün-Scrim,
 *   Überschrift, Unterzeile und Trust-Badges (Glass) – above the fold.
 * - Der Hero ist „sticky": Beim Runterscrollen gleitet das Formular-Panel von
 *   unten darüber, während der Hero dahinter sanft unscharf wird, leicht
 *   zurückskaliert und abdunkelt (scroll-getrieben, per requestAnimationFrame).
 * - Respektiert prefers-reduced-motion (dann kein Blur/Scale-Effekt).
 */
export function HeroContact() {
  const heroInnerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const inner = heroInnerRef.current;
    const stage = stageRef.current;
    if (!inner || !stage) return;

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const heroH = inner.offsetHeight || window.innerHeight || 1;
      const top = stage.getBoundingClientRect().top; // < 0 sobald man vorbeiscrollt
      const p = Math.min(Math.max(-top / heroH, 0), 1); // 0 → 1
      inner.style.filter = `blur(${(p * 7).toFixed(2)}px)`;
      inner.style.transform = `scale(${(1 - p * 0.05).toFixed(3)})`;
      inner.style.opacity = `${(1 - p * 0.45).toFixed(3)}`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={stageRef} className="relative">
      {/* HERO — sticky, wird beim Scrollen unscharf */}
      <section className="sticky top-16 z-0 h-[calc(100svh-4rem)] sm:top-20 sm:h-[calc(100svh-5rem)]">
        <div
          ref={heroInnerRef}
          className="relative h-full overflow-hidden will-change-transform"
        >
          {/*
            HERO-BILD (§12): moderne Sichtbeton-Immobilie mit integrierter Solaranlage
            auf dem Dach, klare Linien, kühle Lichtstimmung (vom Kunden geliefert).
            Austauschbar: public/img/hero-haus.jpg ersetzen. Über next/image optimiert,
            priorisiert (LCP).
          */}
          <Image
            src="/img/hero-haus-neu.jpeg"
            alt="Moderne Sichtbeton-Immobilie mit integrierter Solaranlage auf dem Dach, Familie davor"
            fill
            priority
            sizes="100vw"
            // Gleiches Motiv, aber die schwächer komprimierte Quelldatei
            // (565 statt 234 KB). quality=92 verhindert zusätzlich, dass
            // next/image das bereits komprimierte JPEG ein zweites Mal
            // stark rechnet (Default 75) — das erzeugte den matschigen Look.
            quality={92}
            className="object-cover"
          />
          {/* Jagdgrün-Scrim für Textkontrast */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-[#0F1A15]/92 via-[#0F1A15]/45 to-[#0F1A15]/10"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-br from-accent/30 via-transparent to-transparent"
          />

          {/* Inhalt unten links */}
          <div className="container-page relative z-10 flex h-full flex-col justify-end pb-10 sm:pb-16">
            <div className="max-w-2xl [text-shadow:0_2px_20px_rgba(15,26,21,0.6)]">
              <h1 className="text-[2rem] font-bold leading-[1.08] tracking-[-0.02em] text-white sm:text-[2.75rem] lg:text-[3.4rem]">
                Ihre Solaranlage.
                <br />
                Mehrere Angebote.
                <br />
                Eine Anfrage.
              </h1>
              <p className="mt-5 max-w-xl text-[1.0625rem] leading-relaxed text-white/90 sm:text-[1.15rem]">
                Wir holen für Sie unterschiedliche Angebote von geprüften Fachbetrieben aus
                Ihrer Region ein – kostenlos, unverbindlich und innerhalb von 24–48 Stunden.
              </p>

              <div className="mt-7 max-w-md">
                <TrustBadges glass />
              </div>

              <a
                href="#anfrage"
                className="group mt-7 inline-flex items-center gap-2 rounded-full bg-paper px-6 py-3.5 text-[1.0625rem] font-semibold text-accent shadow-sm transition-all duration-200 ease-out hover:bg-paper-sunk motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-[0_14px_30px_-10px_rgba(0,0,0,0.4)]"
              >
                Kostenlos anfragen
                <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 transition-transform duration-200 ease-out motion-safe:group-hover:translate-y-0.5">
                  <path d="M10 4v11M5 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* KONTAKTFORMULAR — Jagdgrün-Panel, gleitet von unten über den Hero */}
      <section
        id="anfrage"
        className="bg-hunter relative z-20 -mt-8 scroll-mt-20 rounded-t-[2rem] shadow-[0_-24px_70px_-40px_rgba(15,26,21,0.5)]"
      >
        <div aria-hidden className="hunter-glow pointer-events-none absolute inset-0 rounded-t-[2rem]" />
        <div className="container-page relative py-16 sm:py-20">
          <Reveal className="mx-auto max-w-2xl">
            <div className="text-center">
              <p className="text-small font-semibold uppercase tracking-[0.14em] text-accent-ink/70">
                Anfrage
              </p>
              <h2 className="mt-3 text-h2 font-bold tracking-tight text-accent-ink">
                Fordern Sie jetzt Ihre Angebote an
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-body text-accent-ink/80">
                Ein kurzes Formular genügt – wir holen die passenden Angebote für Sie ein.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-small text-accent-ink/85">
                {["Völlig kostenlos", "Keine Verpflichtung", "Angebote in 24–48 h"].map((t) => (
                  <span key={t} className="inline-flex items-center gap-1.5">
                    <WhiteCheck />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-9">
              <LeadForm />
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

/** Kleines weißes Häkchen für die Aufzählung auf dem Jagdgrün-Panel. */
function WhiteCheck() {
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white/20 text-white"
    >
      <svg viewBox="0 0 20 20" fill="none" className="h-2.5 w-2.5">
        <path d="M4 10.5l3.5 3.5L16 5.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
