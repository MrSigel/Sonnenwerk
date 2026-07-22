/** Schlichtes Häkchen in Jägergrün (§4.3) — keine Icon-Flut. */
export function Check({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={
        "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent " +
        className
      }
    >
      <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5">
        <path
          d="M4 10.5l3.5 3.5L16 5.5"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
