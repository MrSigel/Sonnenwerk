"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BRAND } from "@/lib/content";
import { scrollToTop } from "@/lib/scroll";

/**
 * Sticky Premium-Navigation mit zentriertem, gestapeltem Logo.
 * - Logo (Icon → „Sonnenwerk" → Slogan, 3 Zeilen) sitzt mittig als Plakette,
 *   die zu ~60 % in der Navigation und ~40 % im Hero liegt (ragt nach unten hinein).
 * - Navigations-Links links und rechts vom Logo verteilt, in Seitenreihenfolge.
 * - Smooth-Scroll (CSS), Scrollspy hebt den aktiven Abschnitt hervor.
 * - Mobile: barrierefreies Ausklapp-Menü (aria-expanded, Escape schließt).
 */
const LEFT_LINKS = [
  { id: "vorteile", label: "Vorteile" },
  { id: "vergleich", label: "Vergleich" },
  { id: "ablauf", label: "Ablauf" },
];
const RIGHT_LINKS = [
  { id: "warum", label: "Warum wir" },
  { id: "faq", label: "FAQ" },
];
const ALL_LINKS = [...LEFT_LINKS, ...RIGHT_LINKS];

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");
  const pathname = usePathname();

  // Klick auf das Logo: auf der Startseite sanft nach oben scrollen statt neu zu laden.
  const onLogoClick = (e: React.MouseEvent) => {
    if (pathname === "/") {
      e.preventDefault();
      scrollToTop();
    }
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const sections = ALL_LINKS.map((l) => document.getElementById(l.id)).filter(
      (el): el is HTMLElement => Boolean(el)
    );
    if (!sections.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const navLinkClass = (id: string) =>
    `rounded-full px-3.5 py-2 text-small font-medium transition-colors duration-200 ${
      active === id ? "text-accent" : "text-ink-soft hover:text-ink"
    }`;

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? "border-b border-line bg-paper/85 backdrop-blur-md"
          : "border-b border-transparent bg-paper"
      }`}
    >
      <div className="container-page relative flex h-16 items-center gap-4 sm:h-20">
        {/* Links (Desktop) */}
        <nav aria-label="Navigation" className="hidden flex-1 items-center gap-0.5 lg:flex">
          {LEFT_LINKS.map((l) => (
            <Link key={l.id} href={`/#${l.id}`} className={navLinkClass(l.id)}>
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Platzhalter für das zentrierte Logo (reserviert die Mitte). */}
        <div aria-hidden className="w-40 shrink-0 sm:w-56 lg:w-72" />

        {/* Rechts (Desktop) + CTA + Mobile-Umschalter */}
        <div className="flex flex-1 items-center justify-end gap-2">
          <nav aria-label="Navigation" className="hidden items-center gap-0.5 lg:flex">
            {RIGHT_LINKS.map((l) => (
              <Link key={l.id} href={`/#${l.id}`} className={navLinkClass(l.id)}>
                {l.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/#anfrage"
            className="group hidden rounded-full bg-accent px-5 py-2.5 text-small font-semibold text-accent-ink shadow-sm transition-all duration-200 ease-out hover:bg-accent-hover motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-[0_12px_26px_-10px_rgba(31,74,56,0.5)] lg:inline-flex lg:items-center lg:gap-1.5"
          >
            Kostenlos anfragen
            <svg viewBox="0 0 20 20" fill="none" className="btn-arrow h-4 w-4">
              <path d="M4 10h11M11 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>

          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Menü schließen" : "Menü öffnen"}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-accent/40 lg:hidden"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>

        {/* Zentriertes, gestapeltes Logo — ragt aus der Navigation in den Hero. */}
        <Link
          href="/"
          onClick={onLogoClick}
          aria-label={`${BRAND.name} – ${BRAND.slogan}`}
          style={{
            transform: scrolled ? "translateX(-50%) scale(0.78)" : "translateX(-50%) scale(1)",
          }}
          className="bg-hunter absolute left-1/2 top-0 z-50 flex origin-top flex-col items-center rounded-b-[1.25rem] border border-t-0 border-white/10 px-5 pb-4 pt-2.5 shadow-[0_18px_38px_-16px_rgba(15,26,21,0.5)] transition-transform duration-300 ease-out hover:shadow-[0_22px_44px_-16px_rgba(15,26,21,0.6)] sm:px-6 sm:pb-5 sm:pt-3.5"
        >
          <Image
            src="/logos/sonnenwerk-icon-weiss.svg"
            alt=""
            width={200}
            height={200}
            priority
            className="h-9 w-9 sm:h-11 sm:w-11"
          />
          <span className="mt-1.5 font-display text-lg font-bold leading-none tracking-tight text-accent-ink sm:text-xl">
            {BRAND.name}
          </span>
          <span className="mt-1 text-center text-[0.56rem] leading-tight text-accent-ink/75 sm:text-[0.62rem]">
            {BRAND.slogan}
          </span>
        </Link>
      </div>

      {/* Mobile-Menü */}
      <div
        id="mobile-nav"
        className={`overflow-hidden bg-paper/95 backdrop-blur-md transition-[max-height] duration-300 ease-out lg:hidden ${
          open ? "max-h-96 border-t border-line" : "max-h-0"
        }`}
      >
        <nav aria-label="Mobile Navigation" className="container-page flex flex-col gap-1 py-4">
          {ALL_LINKS.map((l) => (
            <Link
              key={l.id}
              href={`/#${l.id}`}
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-3 text-body font-medium text-ink transition-colors hover:bg-paper-sunk"
            >
              {l.label}
            </Link>
          ))}
          <Link href="/#anfrage" onClick={() => setOpen(false)} className="btn-primary group mt-2">
            Kostenlos anfragen
            <svg viewBox="0 0 20 20" fill="none" className="btn-arrow h-4 w-4">
              <path d="M4 10h11M11 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </nav>
      </div>
    </header>
  );
}
