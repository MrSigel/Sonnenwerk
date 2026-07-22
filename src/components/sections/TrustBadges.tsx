import { TRUST } from "@/lib/content";
import { Check } from "@/components/ui/Check";

/**
 * Trust-Elemente (§5) — Pflicht, prominent im Hero (above the fold).
 * `glass`-Variante für die Darstellung über dem Hero-Bild (heller Text, Blur).
 */
export function TrustBadges({ glass = false }: { glass?: boolean }) {
  return (
    <div
      className={`grid grid-cols-2 overflow-hidden rounded-card border ${
        glass
          ? "divide-x divide-white/10 border-white/15 bg-[#1F4A38]/45 backdrop-blur-md"
          : "divide-x divide-line border-line bg-paper"
      }`}
    >
      <Stat value={TRUST.requests} label={TRUST.requestsLabel} glass={glass} />
      <Stat value={TRUST.partners} label={TRUST.partnersLabel} glass={glass} />
    </div>
  );
}

function Stat({ value, label, glass }: { value: string; label: string; glass: boolean }) {
  return (
    <div className="px-4 py-3.5 sm:px-5 sm:py-4">
      <div className="flex items-center gap-1.5">
        {glass ? (
          <span
            aria-hidden="true"
            className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20 text-white"
          >
            <svg viewBox="0 0 20 20" fill="none" className="h-3 w-3">
              <path d="M4 10.5l3.5 3.5L16 5.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        ) : (
          <Check className="h-4 w-4" />
        )}
        <span
          className={`text-[1.5rem] font-bold leading-none tracking-tight sm:text-[1.75rem] ${
            glass ? "text-white" : "text-accent"
          }`}
        >
          {value}
        </span>
      </div>
      <p
        className={`mt-2 text-[0.8125rem] leading-snug sm:text-small ${
          glass ? "text-white/75" : "text-ink-soft"
        }`}
      >
        {label}
      </p>
    </div>
  );
}
