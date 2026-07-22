"use client";

import { useId, useRef, useState } from "react";
import { Controller, type Control, type UseFormSetValue } from "react-hook-form";
import type { LeadInput } from "@/lib/schema";
import { fetchAddressSuggestions, type GeoSuggestion } from "@/lib/geo";
import { useCombobox } from "./useCombobox";
import { SuggestionList } from "./SuggestionList";

type AddressField = "strasse" | "plz" | "ort";

/**
 * Adress-Combobox (§ Vorgabe): Vorschläge via Photon/OSM (Proxy `/api/geo`).
 * Auswahl übernimmt Straße, Hausnummer (falls enthalten), PLZ und Ort automatisch
 * in die jeweiligen Formularfelder. Debounced (280 ms), Ladezustand, Fehler still.
 */
export function AddressAutocomplete({
  control,
  setValue,
  name,
  label,
  placeholder,
  error,
  inputMode,
}: {
  control: Control<LeadInput>;
  setValue: UseFormSetValue<LeadInput>;
  name: AddressField;
  label: string;
  placeholder: string;
  error?: string;
  inputMode?: "text" | "numeric";
}) {
  const [items, setItems] = useState<GeoSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const uid = useId();
  const inputId = `addr-${name}-${uid}`;
  const listId = `${inputId}-list`;
  const optionId = (i: number) => `${inputId}-opt-${i}`;

  // Ausgewählten Vorschlag in die zugehörigen Felder schreiben.
  const applySuggestion = (s: GeoSuggestion) => {
    if (s.strasse) setValue("strasse", s.strasse, { shouldValidate: true, shouldDirty: true });
    if (s.hausnummer) setValue("hausnummer", s.hausnummer, { shouldValidate: true, shouldDirty: true });
    if (s.plz) setValue("plz", s.plz, { shouldValidate: true, shouldDirty: true });
    if (s.ort) setValue("ort", s.ort, { shouldValidate: true, shouldDirty: true });
  };

  const combobox = useCombobox<GeoSuggestion>({
    items,
    onPick: (s) => applySuggestion(s),
  });

  const runSearch = (value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = value.trim();
    if (q.length < 3) {
      setItems([]);
      setLoading(false);
      combobox.setOpen(false);
      return;
    }
    setLoading(true);
    combobox.setOpen(true);
    debounceRef.current = setTimeout(async () => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      const results = await fetchAddressSuggestions(q, ctrl.signal);
      if (ctrl.signal.aborted) return;
      setItems(results);
      setLoading(false);
    }, 280);
  };

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div ref={combobox.wrapperRef} className="relative">
          <label htmlFor={inputId} className="field-label">
            {label}
          </label>
          <input
            id={inputId}
            ref={field.ref}
            name={field.name}
            value={(field.value as string) ?? ""}
            onChange={(e) => {
              field.onChange(e.target.value);
              runSearch(e.target.value);
            }}
            onBlur={field.onBlur}
            onFocus={() => {
              if (items.length) combobox.setOpen(true);
            }}
            onKeyDown={combobox.onKeyDown}
            className="field-input"
            placeholder={placeholder}
            inputMode={inputMode}
            autoComplete="off"
            spellCheck={false}
            role="combobox"
            aria-expanded={combobox.open}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={
              combobox.open && combobox.active >= 0 ? optionId(combobox.active) : undefined
            }
            aria-invalid={error ? "true" : undefined}
          />

          <SuggestionList
            listId={listId}
            optionId={optionId}
            open={combobox.open}
            loading={loading}
            items={items}
            active={combobox.active}
            loadingLabel="Adressen werden gesucht …"
            emptyLabel="Keine Treffer – bitte manuell eingeben."
            onPick={(_, i) => {
              const s = items[i];
              if (s) {
                applySuggestion(s);
                combobox.setOpen(false);
              }
            }}
          />

          {error && <p className="field-error">{error}</p>}
        </div>
      )}
    />
  );
}
