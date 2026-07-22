"use client";

import { useEffect } from "react";

export type Suggestion = { key: string; primary: string; secondary?: string };

/**
 * Präsentations-Dropdown für Combobox-Felder (ARIA-Listbox).
 * Überlagert nachfolgende Felder korrekt (z-50), scrollt intern (max-Höhe),
 * hält den aktiven Eintrag im Sichtbereich.
 */
export function SuggestionList({
  listId,
  optionId,
  open,
  loading,
  items,
  active,
  onPick,
  loadingLabel = "Wird gesucht …",
  emptyLabel,
  maxHeightClass = "max-h-72",
}: {
  listId: string;
  optionId: (i: number) => string;
  open: boolean;
  loading: boolean;
  items: Suggestion[];
  active: number;
  onPick: (item: Suggestion, index: number) => void;
  loadingLabel?: string;
  emptyLabel?: string;
  maxHeightClass?: string;
}) {
  // Aktiven Eintrag beim Navigieren in den Sichtbereich scrollen.
  useEffect(() => {
    if (!open || active < 0) return;
    const el = document.getElementById(optionId(active));
    el?.scrollIntoView({ block: "nearest" });
  }, [active, open, optionId]);

  if (!open) return null;
  const showEmpty = !loading && items.length === 0 && Boolean(emptyLabel);
  if (!loading && items.length === 0 && !emptyLabel) return null;

  return (
    <ul
      id={listId}
      role="listbox"
      className={`absolute left-0 right-0 top-full z-50 mt-1 ${maxHeightClass} overflow-y-auto overscroll-contain rounded-xl border border-line bg-paper py-1 shadow-[0_10px_40px_-12px_rgba(15,26,21,0.28)]`}
    >
      {loading && (
        <li className="flex items-center gap-2 px-3.5 py-2 text-small text-ink-soft" aria-disabled="true">
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-line border-t-accent" />
          {loadingLabel}
        </li>
      )}

      {showEmpty && (
        <li className="px-3.5 py-2 text-small text-ink-soft" aria-disabled="true">
          {emptyLabel}
        </li>
      )}

      {!loading &&
        items.map((item, i) => (
          <li
            key={item.key}
            id={optionId(i)}
            role="option"
            aria-selected={i === active}
            // preventDefault verhindert Input-Blur vor dem Klick (Touch + Maus).
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onPick(item, i)}
            className={`cursor-pointer px-3.5 py-2 transition-colors ${
              i === active ? "bg-accent/10" : "hover:bg-paper-sunk"
            }`}
          >
            <div className="text-body leading-tight text-ink">{item.primary}</div>
            {item.secondary && (
              <div className="mt-0.5 text-small leading-tight text-ink-soft">{item.secondary}</div>
            )}
          </li>
        ))}
    </ul>
  );
}
