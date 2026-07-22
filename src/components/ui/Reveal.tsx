"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Ruhige Scroll-Reveal-Animation (Fade + Slide-in beim Reinscrollen).
 * - IntersectionObserver, einmalig (danach getrennt) → performant.
 * - Respektiert `prefers-reduced-motion`: dann sofort sichtbar, keine Bewegung.
 * - `delay` (ms) für gestaffelte Einblendung von Karten/Listen.
 */
export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    // Sicherheitsnetz: bei reduzierter Bewegung, fehlendem IntersectionObserver
    // oder degeneriertem Viewport (innerHeight 0) sofort sichtbar zeigen –
    // Inhalt darf niemals dauerhaft unsichtbar bleiben.
    if (reduce || typeof IntersectionObserver === "undefined" || window.innerHeight === 0) {
      setVisible(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition duration-700 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      } ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}
