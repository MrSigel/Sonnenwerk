import Image from "next/image";
import Link from "next/link";
import { BRAND, COMPANY } from "@/lib/content";
import { CookieSettingsLink } from "@/components/consent/CookieSettingsLink";

/**
 * Fußbereich (§4.6) auf Jägergrün — mehrspaltig, aufgeräumt.
 * Enthält Logo/Slogan, Schnellzugriff zu den Abschnitten, Rechtliches
 * (Impressum, Datenschutz, „Cookie-Einstellungen") und Kontaktangaben.
 */
const QUICK_LINKS = [
  { href: "/#anfrage", label: "Anfrage" },
  { href: "/#vorteile", label: "Vorteile" },
  { href: "/#vergleich", label: "Vergleich" },
  { href: "/#ablauf", label: "Ablauf" },
  { href: "/#faq", label: "Häufige Fragen" },
];

export function Footer() {
  const year = new Date().getFullYear();
  const linkClass = "text-accent-ink/75 transition-colors hover:text-accent-ink";

  return (
    <footer className="bg-hunter relative overflow-hidden text-accent-ink">
      <div aria-hidden className="hunter-glow pointer-events-none absolute inset-0" />
      <div className="container-page relative py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.1fr]">
          {/* Marke */}
          <div>
            <Link href="/" aria-label={`${BRAND.name} – Startseite`} className="inline-flex">
              <Image
                src="/logos/sonnenwerk-lockup-dunkel.svg"
                alt={`${BRAND.name} – ${BRAND.slogan}`}
                width={418}
                height={96}
                className="h-16 w-auto origin-left transition-transform duration-300 ease-out motion-safe:hover:scale-[1.05] sm:h-20"
              />
            </Link>
            <p className="mt-5 max-w-xs text-small leading-relaxed text-accent-ink/70">
              Geprüfte Solar-Angebote aus Ihrer Region – kostenlos, unverbindlich und in
              24–48 Stunden.
            </p>
          </div>

          {/* Schnellzugriff */}
          <nav aria-label="Schnellzugriff">
            <h2 className="text-small font-semibold uppercase tracking-[0.12em] text-accent-ink/60">
              Schnellzugriff
            </h2>
            <ul className="mt-4 space-y-2.5 text-small">
              {QUICK_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={linkClass}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Rechtliches */}
          <nav aria-label="Rechtliches">
            <h2 className="text-small font-semibold uppercase tracking-[0.12em] text-accent-ink/60">
              Rechtliches
            </h2>
            <ul className="mt-4 space-y-2.5 text-small">
              <li>
                <Link href="/impressum" className={linkClass}>
                  Impressum
                </Link>
              </li>
              <li>
                <Link href="/datenschutz" className={linkClass}>
                  Datenschutzerklärung
                </Link>
              </li>
              <li>
                <Link href="/cookie-richtlinie" className={linkClass}>
                  Cookie-Richtlinie
                </Link>
              </li>
              <li>
                <CookieSettingsLink className={linkClass} />
              </li>
            </ul>
          </nav>

          {/* Kontakt */}
          <div>
            <h2 className="text-small font-semibold uppercase tracking-[0.12em] text-accent-ink/60">
              Kontakt
            </h2>
            <address className="mt-4 space-y-2.5 text-small not-italic text-accent-ink/75">
              <p>
                {COMPANY.legalName}
                <br />
                {COMPANY.street}, {COMPANY.city}
              </p>
              <p>
                <a href={`mailto:${COMPANY.email}`} className={linkClass}>
                  {COMPANY.email}
                </a>
                <br />
                <a href={`tel:${COMPANY.phone.replace(/[^+\d]/g, "")}`} className={linkClass}>
                  {COMPANY.phone}
                </a>
              </p>
            </address>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-white/10 pt-6 text-small text-accent-ink/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {BRAND.name}. Alle Rechte vorbehalten.
          </p>
          <p>{BRAND.slogan}</p>
        </div>
      </div>
    </footer>
  );
}
