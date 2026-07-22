"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";

/**
 * Headless-Logik für ein barrierefreies Combobox-Feld (WAI-ARIA 1.2):
 * Pfeiltasten + Enter, Escape schließt, Klick außerhalb schließt.
 * Kennt die Items nicht inhaltlich — nur ihre Anzahl und den Select-Callback.
 */
export function useCombobox<T>({
  items,
  onPick,
}: {
  items: T[];
  onPick: (item: T, index: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Aktiven Index zurücksetzen, wenn sich die Liste ändert.
  useEffect(() => {
    setActive(-1);
  }, [items]);

  // Klick außerhalb schließt die Liste.
  useEffect(() => {
    if (!open) return;
    const onDocDown = (e: MouseEvent | TouchEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocDown);
    document.addEventListener("touchstart", onDocDown);
    return () => {
      document.removeEventListener("mousedown", onDocDown);
      document.removeEventListener("touchstart", onDocDown);
    };
  }, [open]);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!open && items.length) setOpen(true);
        setActive((i) => Math.min(items.length - 1, i + 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((i) => Math.max(0, i - 1));
        break;
      case "Enter":
        // Nur abfangen, wenn ein Vorschlag aktiv ist — sonst normales Submit zulassen.
        if (open && active >= 0 && items[active]) {
          e.preventDefault();
          onPick(items[active], active);
          setOpen(false);
        }
        break;
      case "Escape":
        if (open) {
          e.preventDefault();
          setOpen(false);
        }
        break;
      case "Tab":
        setOpen(false);
        break;
      default:
        break;
    }
  };

  return { open, setOpen, active, setActive, wrapperRef, onKeyDown };
}
