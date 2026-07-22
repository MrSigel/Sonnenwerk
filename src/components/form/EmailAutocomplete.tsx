"use client";

import { useId, useState } from "react";
import { Controller, type Control, type UseFormSetValue } from "react-hook-form";
import type { LeadInput } from "@/lib/schema";
import { EMAIL_DOMAINS } from "@/lib/geo";
import { useCombobox } from "./useCombobox";
import { SuggestionList, type Suggestion } from "./SuggestionList";

/**
 * E-Mail-Domain-Vorschläge (§ Vorgabe): rein clientseitig.
 * Sobald „@" getippt wird, erscheinen gängige Endungen mit dem bereits
 * getippten lokalen Teil. Live-Filterung nach dem @, max. 4 sichtbar (Rest per
 * Scrollen), verbreitetste zuerst. Auswahl übernimmt die komplette Adresse.
 */
export function EmailAutocomplete({
  control,
  setValue,
  error,
}: {
  control: Control<LeadInput>;
  setValue: UseFormSetValue<LeadInput>;
  error?: string;
}) {
  const [items, setItems] = useState<Suggestion[]>([]);

  const uid = useId();
  const inputId = `email-${uid}`;
  const listId = `${inputId}-list`;
  const optionId = (i: number) => `${inputId}-opt-${i}`;

  const combobox = useCombobox<Suggestion>({
    items,
    onPick: (s) => setValue("email", s.primary, { shouldValidate: true, shouldDirty: true }),
  });

  const computeItems = (value: string): Suggestion[] => {
    const at = value.indexOf("@");
    if (at < 0) return [];
    const local = value.slice(0, at);
    if (!local) return [];
    const domainPart = value.slice(at + 1).toLowerCase();
    return EMAIL_DOMAINS.filter((d) => d.startsWith(domainPart)).map((d) => ({
      key: d,
      primary: `${local}@${d}`,
    }));
  };

  return (
    <Controller
      control={control}
      name="email"
      render={({ field }) => (
        <div ref={combobox.wrapperRef} className="relative">
          <label htmlFor={inputId} className="field-label">
            E-Mail-Adresse*
          </label>
          <input
            id={inputId}
            type="email"
            ref={field.ref}
            name={field.name}
            value={(field.value as string) ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              field.onChange(v);
              const next = computeItems(v);
              setItems(next);
              combobox.setOpen(next.length > 0);
            }}
            onBlur={field.onBlur}
            onFocus={() => {
              if (items.length) combobox.setOpen(true);
            }}
            onKeyDown={combobox.onKeyDown}
            className="field-input"
            placeholder="max@example.de"
            inputMode="email"
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
          <p className="mt-1 text-small text-ink-soft">
            Für Bestätigung und Angebots-Zustellung.
          </p>

          <SuggestionList
            listId={listId}
            optionId={optionId}
            open={combobox.open}
            loading={false}
            items={items}
            active={combobox.active}
            // max. 4 sichtbar (ca. 4 × 2.5rem), Rest per Scrollen erreichbar.
            maxHeightClass="max-h-40"
            onPick={(s) => {
              setValue("email", s.primary, { shouldValidate: true, shouldDirty: true });
              combobox.setOpen(false);
            }}
          />

          {error && <p className="field-error">{error}</p>}
        </div>
      )}
    />
  );
}
