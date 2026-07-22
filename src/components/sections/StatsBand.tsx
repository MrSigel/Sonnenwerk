"use client";

import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Zahlen-/Trust-Band (Weiß, Jägergrün-Kennzahlen). Die Zahlen zählen beim
 * Reinscrollen hoch (Count-up), respektiert prefers-reduced-motion.
 */
const STATS = [
  { target: 780000, prefix: "", suffix: "+", thousands: true, label: "Anfragen vermittelt" },
  { target: 900, prefix: "", suffix: "", thousands: false, label: "Fachpartner deutschlandweit" },
  { target: 48, prefix: "24–", suffix: " h", thousands: false, label: "bis zur ersten Rückmeldung" },
  { target: 100, prefix: "", suffix: " %", thousands: false, label: "kostenlos & unverbindlich" },
];

const deFormat = new Intl.NumberFormat("de-DE");

function CountUp({
  target,
  prefix,
  suffix,
  thousands,
}: {
  target: number;
  prefix: string;
  suffix: string;
  thousands: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce || typeof IntersectionObserver === "undefined" || window.innerHeight === 0) {
      setValue(target);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        const duration = 1600;
        let startTs: number | null = null;
        const step = (ts: number) => {
          if (startTs === null) startTs = ts;
          const p = Math.min((ts - startTs) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
          setValue(Math.round(target * eased));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target]);

  const num = thousands ? deFormat.format(value) : String(value);
  return (
    <span ref={ref}>
      {prefix}
      {num}
      {suffix}
    </span>
  );
}

export function StatsBand() {
  return (
    <section className="bg-paper">
      <div className="container-page py-16 sm:py-20">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 90}>
              <div className="text-center lg:text-left">
                <div className="text-[2.5rem] font-bold leading-none tracking-tight text-accent sm:text-[3rem]">
                  <CountUp
                    target={s.target}
                    prefix={s.prefix}
                    suffix={s.suffix}
                    thousands={s.thousands}
                  />
                </div>
                <p className="mt-2 text-small text-ink-soft">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
