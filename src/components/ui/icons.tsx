/**
 * Konsistentes Linien-Icon-Set (24×24, currentColor, runde Enden).
 * Farbe steuert der Elternteil (z. B. Jägergrün via text-accent / weiß).
 */

type IconProps = { className?: string };

const base = "none";

function Svg({ className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={base}
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/** Geprüft / vertrauenswürdig */
export function IconShieldCheck({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 3l7 2.6v5.1c0 4.4-3 7.4-7 8.9-4-1.5-7-4.5-7-8.9V5.6L12 3z" />
      <path d="M9 12l2 2 4-4.2" />
    </Svg>
  );
}

/** Mehrere Angebote vergleichen */
export function IconLayers({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 3l9 5-9 5-9-5 9-5z" />
      <path d="M3.5 12.5L12 17l8.5-4.5" />
      <path d="M3.5 16.5L12 21l8.5-4.5" />
    </Svg>
  );
}

/** Kostenlos & unverbindlich */
export function IconEuro({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9a3.6 3.6 0 100 6" />
      <path d="M7.5 11h5.5M7.5 13.5h5.5" />
    </Svg>
  );
}

/** Regional & schnell */
export function IconMapPin({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 21s6-5.4 6-10a6 6 0 10-12 0c0 4.6 6 10 6 10z" />
      <circle cx="12" cy="11" r="2.3" />
    </Svg>
  );
}

/** Formular ausfüllen */
export function IconForm({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 8h6M9 12h6M9 16h4" />
    </Svg>
  );
}

/** Anruf / Kontakt */
export function IconPhone({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M6 3h3l1.6 4.5-2.1 1.6a12.5 12.5 0 006.4 6.4l1.6-2.1L21 15v3a2 2 0 01-2 2A15.5 15.5 0 014 5a2 2 0 012-2z" />
    </Svg>
  );
}

/** Vergleichen / entscheiden (Waage) */
export function IconScale({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 4v16M7 20h10" />
      <path d="M6 7h12" />
      <path d="M6 7l-2.5 5.5a3 3 0 005 0L6 7zM18 7l-2.5 5.5a3 3 0 005 0L18 7z" />
    </Svg>
  );
}

/** Uhr / schnell */
export function IconClock({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V12l3 2" />
    </Svg>
  );
}
