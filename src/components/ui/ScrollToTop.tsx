"use client";

import { useEffect, useState } from "react";
import { scrollToTop } from "@/lib/scroll";

/**
 * Schwebendes „Nach oben"-Widget (rechts unten). Erscheint nach etwas Scrollen,
 * sanfter Scroll nach oben beim Klick. Barrierefrei, mit Hover-Animation.
 */
export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Nach oben scrollen"
      className={`group fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-ink shadow-[0_12px_30px_-8px_rgba(31,74,56,0.6)] transition-all duration-300 ease-out hover:bg-accent-hover motion-safe:hover:-translate-y-1 sm:bottom-7 sm:right-7 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 transition-transform duration-300 motion-safe:group-hover:-translate-y-0.5">
        <path d="M12 19V5M6 11l6-6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
