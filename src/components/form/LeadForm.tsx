"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, type UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { leadSchema, LEAD_FIELD_LABELS, type LeadInput } from "@/lib/schema";
import { storePendingLead } from "@/lib/pendingLead";
import { Check } from "@/components/ui/Check";
import { AddressAutocomplete } from "./AddressAutocomplete";
import { EmailAutocomplete } from "./EmailAutocomplete";

/**
 * Kontaktformular (§6) — 10 Felder, exakte Reihenfolge & Beschriftung.
 * Als kompakter 4-Schritte-Wizard: pro Schritt nur wenige Felder, damit das
 * Formular natürlicher und weniger wuchtig wirkt.
 * Client-Validierung via Zod (§7, pro Schritt via trigger), Honeypot + Zeitfalle (§9).
 * Submit → /api/lead → bei Erfolg Weiterleitung auf /danke (§8.1).
 */

const STEPS = [
  { title: "Ihre Daten", fields: ["vorname", "name"] },
  { title: "Ihre Adresse", fields: ["strasse", "hausnummer", "plz", "ort"] },
  { title: "Kontakt", fields: ["telefon", "email"] },
  { title: "Ihr Vorhaben", fields: ["product_interest", "timeframe", "hauseigentuemer"] },
  { title: "Ihr Gebäude", fields: ["building_type", "roof_shape", "datenschutz"] },
] as const;

const LAST = STEPS.length - 1;

// Teil-Schemata pro Schritt — nur die Felder des jeweiligen Schritts validieren.
// (RHF `trigger` würde mit Zod-Resolver das GESAMTE Schema prüfen und wegen der
//  noch leeren späteren Felder fehlschlagen.)
const STEP_SCHEMAS = [
  leadSchema.pick({ vorname: true, name: true }),
  leadSchema.pick({ strasse: true, hausnummer: true, plz: true, ort: true }),
  leadSchema.pick({ telefon: true, email: true }),
  leadSchema.pick({ product_interest: true, timeframe: true, hauseigentuemer: true }),
  leadSchema.pick({ building_type: true, roof_shape: true, datenschutz: true }),
] as const;

const PRODUCT_OPTIONS = ["PV", "Wärmepumpe", "PV und Wärmepumpe"] as const;
const TIMEFRAME_OPTIONS = ["sofort", "1-3 Monate", "3-6 Monate", "Keine Angabe"] as const;
const BUILDING_OPTIONS = [
  "Einfamilienhaus",
  "Zweifamilienhaus",
  "Mehrfamilienhaus",
  "Firmengebäude",
  "Freilandfläche",
  "Sonstiges",
] as const;
const ROOF_OPTIONS = [
  "Satteldach",
  "Walmdach",
  "Pultdach",
  "Flachdach",
  "Krüppelwalmdach",
  "Mansarddach",
  "Sonstiges",
] as const;

export function LeadForm() {
  const router = useRouter();
  const formLoadedAt = useRef<number>(0);
  const [serverError, setServerError] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const didMount = useRef(false);

  useEffect(() => {
    formLoadedAt.current = Date.now();
  }, []);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    setError,
    clearErrors,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<LeadInput>({
    resolver: zodResolver(leadSchema),
    shouldUnregister: false,
    defaultValues: {
      strasse: "",
      plz: "",
      ort: "",
      email: "",
      roof_shape: [],
      newsletter: false,
      datenschutz: undefined as unknown as true,
      company: "",
    },
    mode: "onTouched",
  });

  // Beim Schrittwechsel Fokus auf das erste Feld setzen (nicht beim ersten Render).
  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    try {
      setFocus(STEPS[step].fields[0] as keyof LeadInput);
    } catch {
      /* ignore */
    }
  }, [step, setFocus]);

  const goNext = () => {
    const fields = STEPS[step].fields as unknown as (keyof LeadInput)[];
    const result = STEP_SCHEMAS[step].safeParse(getValues());
    if (result.success) {
      clearErrors(fields);
      setStep((s) => Math.min(s + 1, LAST));
      return;
    }
    // Nur die Felder DIESES Schritts als fehlerhaft markieren + fokussieren.
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof LeadInput | undefined;
      if (field) setError(field, { type: "manual", message: issue.message });
    }
    const first = result.error.issues[0]?.path[0] as keyof LeadInput | undefined;
    if (first) {
      try {
        setFocus(first);
      } catch {
        /* ignore */
      }
    }
  };
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  // Enter auf Nicht-Endschritten: nicht absenden, sondern weiter (sofern kein
  // Combobox-Vorschlag das Event bereits behandelt hat).
  const onFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.defaultPrevented) return;
    const target = e.target as HTMLElement;
    if (e.key === "Enter" && target.tagName === "INPUT" && step < LAST) {
      e.preventDefault();
      goNext();
    }
  };

  const onSubmit = async (values: LeadInput) => {
    setServerError(null);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, formLoadedAt: formLoadedAt.current }),
      });

      if (res.status === 429) {
        setServerError(
          "Zu viele Anfragen in kurzer Zeit. Bitte versuchen Sie es in einigen Minuten erneut."
        );
        return;
      }
      if (!res.ok) {
        setServerError(
          "Ihre Anfrage konnte gerade nicht übermittelt werden. Bitte versuchen Sie es später erneut."
        );
        return;
      }

      storePendingLead({
        vorname: values.vorname,
        name: values.name,
        strasse: values.strasse,
        hausnummer: values.hausnummer,
        plz: values.plz,
        ort: values.ort,
        telefon: values.telefon,
        email: values.email,
        hauseigentuemer: values.hauseigentuemer,
        product_interest: values.product_interest,
        timeframe: values.timeframe,
        building_type: values.building_type,
        roof_shape: values.roof_shape,
        newsletter: Boolean(values.newsletter),
      });
      router.push("/danke");
    } catch {
      setServerError(
        "Es gab ein Verbindungsproblem. Bitte prüfen Sie Ihre Internetverbindung und versuchen Sie es erneut."
      );
    }
  };

  // Schlägt die Gesamtvalidierung beim Absenden fehl, würde ohne dies NICHTS
  // sichtbar passieren – die Fehlermeldung säße evtl. auf einem ausgeblendeten
  // Schritt (oder auf dem unsichtbaren Honeypot). Deshalb: Feld klar benennen,
  // zum betroffenen Schritt springen, Honeypot-Fehlbefüllung automatisch heilen.
  const onInvalid = (formErrors: typeof errors) => {
    const errs = formErrors as Record<string, unknown>;

    // Honeypot ("company") ist für echte Nutzer unsichtbar und wird NUR
    // serverseitig ausgewertet. Füllt ein Passwort-Manager/Autofill es, darf das
    // einen echten Nutzer nicht blockieren → leeren und (falls einzige Ursache)
    // direkt erneut absenden.
    if (errs.company) {
      setValue("company", "", { shouldValidate: false });
      clearErrors("company");
      if (Object.keys(errs).length === 1) {
        setTimeout(() => void handleSubmit(onSubmit, onInvalid)(), 0);
        return;
      }
    }

    const badStep = STEPS.findIndex((s) =>
      (s.fields as readonly string[]).some((f) => errs[f])
    );
    const target = badStep >= 0 ? badStep : step;
    if (target !== step) setStep(target);

    const firstField = (STEPS[target].fields as readonly string[]).find((f) => errs[f]);
    const label = firstField ? LEAD_FIELD_LABELS[firstField] ?? firstField : "";
    setServerError(
      label
        ? `Bitte vervollständigen Sie noch „${label}". Wir haben Sie zum betreffenden Schritt gebracht.`
        : "Bitte prüfen Sie Ihre Eingaben – ein Feld ist noch unvollständig."
    );
    if (firstField) {
      try {
        setFocus(firstField as keyof LeadInput);
      } catch {
        /* ignore */
      }
    }
  };

  const invalid = (name: keyof LeadInput) => (errors[name] ? "true" : undefined);
  const fieldId = useMemo(() => (n: string) => `lead-${n}`, []);

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      onKeyDown={onFormKeyDown}
      className="card p-5 sm:p-6"
      aria-label="Kontaktformular für Ihre Solar-Anfrage"
    >
      {/* Honeypot (§9) — für Menschen unsichtbar, für Bots verlockend */}
      <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor={fieldId("company")}>Firma (bitte leer lassen)</label>
        <input
          id={fieldId("company")}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register("company")}
        />
      </div>

      {/* Fortschritt */}
      <div className="mb-6">
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-h3 font-semibold text-ink">{STEPS[step].title}</span>
          <span className="text-small text-ink-soft">
            Schritt {step + 1} von {STEPS.length}
          </span>
        </div>
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-line"
          role="progressbar"
          aria-valuenow={step + 1}
          aria-valuemin={1}
          aria-valuemax={STEPS.length}
        >
          <div
            className="h-full rounded-full bg-accent transition-all duration-500 ease-out"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Schritt-Inhalt (mit sanfter Einblendung) */}
      <div key={step} className="wizard-step">
        {/* SCHRITT 1 — PERSÖNLICHE DATEN */}
        {step === 0 && (
          <fieldset className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <legend className="sr-only">Persönliche Daten</legend>
            <div>
              <label htmlFor={fieldId("vorname")} className="field-label">
                Vorname*
              </label>
              <input
                id={fieldId("vorname")}
                className="field-input"
                placeholder="Max"
                autoComplete="given-name"
                aria-invalid={invalid("vorname")}
                {...register("vorname")}
              />
              {errors.vorname && <p className="field-error">{errors.vorname.message}</p>}
            </div>
            <div>
              <label htmlFor={fieldId("name")} className="field-label">
                Name*
              </label>
              <input
                id={fieldId("name")}
                className="field-input"
                placeholder="Mustermann"
                autoComplete="family-name"
                aria-invalid={invalid("name")}
                {...register("name")}
              />
              {errors.name && <p className="field-error">{errors.name.message}</p>}
            </div>
          </fieldset>
        )}

        {/* SCHRITT 2 — ADRESSE */}
        {step === 1 && (
          <fieldset className="grid grid-cols-1 gap-4 sm:grid-cols-6">
            <legend className="sr-only">Adresse</legend>
            <div className="sm:col-span-4">
              <AddressAutocomplete
                control={control}
                setValue={setValue}
                name="strasse"
                label="Straße*"
                placeholder="Musterstraße"
                error={errors.strasse?.message}
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor={fieldId("hausnummer")} className="field-label">
                Hausnummer*
              </label>
              <input
                id={fieldId("hausnummer")}
                className="field-input"
                placeholder="42"
                autoComplete="off"
                aria-invalid={invalid("hausnummer")}
                {...register("hausnummer")}
              />
              {errors.hausnummer && <p className="field-error">{errors.hausnummer.message}</p>}
            </div>
            <div className="sm:col-span-2">
              <AddressAutocomplete
                control={control}
                setValue={setValue}
                name="plz"
                label="Postleitzahl*"
                placeholder="10115"
                inputMode="numeric"
                error={errors.plz?.message}
              />
            </div>
            <div className="sm:col-span-4">
              <AddressAutocomplete
                control={control}
                setValue={setValue}
                name="ort"
                label="Ort*"
                placeholder="Berlin"
                error={errors.ort?.message}
              />
            </div>
          </fieldset>
        )}

        {/* SCHRITT 3 — KONTAKT */}
        {step === 2 && (
          <fieldset className="grid grid-cols-1 gap-4">
            <legend className="sr-only">Kontakt</legend>
            <div>
              <label htmlFor={fieldId("telefon")} className="field-label">
                Telefonnummer*
              </label>
              <input
                id={fieldId("telefon")}
                className="field-input"
                placeholder="+49 30 123456789"
                inputMode="tel"
                autoComplete="tel"
                aria-invalid={invalid("telefon")}
                {...register("telefon")}
              />
              <p className="mt-1 text-small text-ink-soft">Fachpartner rufen zuerst an.</p>
              {errors.telefon && <p className="field-error">{errors.telefon.message}</p>}
            </div>
            <EmailAutocomplete control={control} setValue={setValue} error={errors.email?.message} />
          </fieldset>
        )}

        {/* SCHRITT 4 — IHR VORHABEN */}
        {step === 3 && (
          <div className="space-y-5">
            <OptionCards
              label="Woran haben Sie Interesse?*"
              name="product_interest"
              options={PRODUCT_OPTIONS}
              register={register}
              error={errors.product_interest?.message}
              idFor={fieldId}
            />

            <div>
              <label htmlFor={fieldId("timeframe")} className="field-label">
                Wann möchten Sie umsetzen?*
              </label>
              <select
                id={fieldId("timeframe")}
                className="field-input"
                defaultValue=""
                aria-invalid={invalid("timeframe")}
                {...register("timeframe")}
              >
                <option value="" disabled>
                  Bitte wählen …
                </option>
                {TIMEFRAME_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              {errors.timeframe && <p className="field-error">{errors.timeframe.message}</p>}
            </div>

            <JaNeinGroup
              label="Sind Sie Hauseigentümer?*"
              name="hauseigentuemer"
              register={register}
              error={errors.hauseigentuemer?.message}
              idFor={fieldId}
            />
          </div>
        )}

        {/* SCHRITT 5 — IHR GEBÄUDE + ZUSTIMMUNG */}
        {step === 4 && (
          <div>
            <div>
              <label htmlFor={fieldId("building_type")} className="field-label">
                Gebäudetyp*
              </label>
              <select
                id={fieldId("building_type")}
                className="field-input"
                defaultValue=""
                aria-invalid={invalid("building_type")}
                {...register("building_type")}
              >
                <option value="" disabled>
                  Bitte wählen …
                </option>
                {BUILDING_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              {errors.building_type && <p className="field-error">{errors.building_type.message}</p>}
            </div>

            <div className="mt-5">
              <span className="field-label" id={`${fieldId("roof_shape")}-label`}>
                Dachform*{" "}
                <span className="font-normal text-ink-soft">(Mehrfachauswahl möglich)</span>
              </span>
              <div
                role="group"
                aria-labelledby={`${fieldId("roof_shape")}-label`}
                className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-3"
              >
                {ROOF_OPTIONS.map((opt) => (
                  <label
                    key={opt}
                    className="flex cursor-pointer items-center gap-2 rounded-xl border border-line px-3 py-2.5 text-small text-ink transition-colors hover:border-accent/50 has-[:checked]:border-accent has-[:checked]:bg-accent/5 has-[:checked]:font-medium"
                  >
                    <input type="checkbox" value={opt} className="h-4 w-4 accent-accent" {...register("roof_shape")} />
                    {opt}
                  </label>
                ))}
              </div>
              {errors.roof_shape && <p className="field-error">{errors.roof_shape.message}</p>}
            </div>

            {/* Datenschutz-Häkchen (Pflicht) */}
            <div className="mt-6">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-0.5 h-5 w-5 accent-accent"
                  aria-invalid={invalid("datenschutz")}
                  {...register("datenschutz")}
                />
                <span className="text-small text-ink">
                  Ich stimme der Kontaktaufnahme durch Solarpartner zu und akzeptiere die{" "}
                  <Link
                    href="/datenschutz"
                    target="_blank"
                    className="text-accent underline underline-offset-2"
                  >
                    Datenschutzerklärung
                  </Link>
                  .
                </span>
              </label>
              {errors.datenschutz && <p className="field-error">{errors.datenschutz.message}</p>}
            </div>

            {/* Newsletter-Opt-in (optional) */}
            <div className="mt-3">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-0.5 h-5 w-5 accent-accent"
                  {...register("newsletter")}
                />
                <span className="text-small text-ink-soft">
                  Ja, ich möchte Tipps und Förder-Updates per Newsletter erhalten.
                </span>
              </label>
            </div>
          </div>
        )}
      </div>

      {serverError && (
        <p role="alert" className="mt-4 rounded-xl border border-accent/30 bg-accent/5 px-4 py-3 text-small text-accent">
          {serverError}
        </p>
      )}

      {/* Navigation */}
      <div className="mt-7 flex items-center gap-3">
        {step > 0 && (
          <button type="button" onClick={goBack} className="btn-ghost shrink-0">
            Zurück
          </button>
        )}

        {step < LAST ? (
          <button type="button" onClick={goNext} className="btn-primary group flex-1">
            Weiter
            <ArrowIcon />
          </button>
        ) : (
          <button type="submit" className="btn-primary group flex-1" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent-ink/40 border-t-accent-ink" />
                Wird gesendet…
              </>
            ) : (
              <>
                Jetzt kostenlos Angebote erhalten
                <ArrowIcon />
              </>
            )}
          </button>
        )}
      </div>

      {/* Häkchen-Zeile nur im letzten Schritt (direkt beim Absenden) */}
      {step === LAST && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-small text-ink-soft">
          <span className="inline-flex items-center gap-1.5">
            <Check className="h-4 w-4" /> Völlig kostenlos
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Check className="h-4 w-4" /> Keine versteckten Gebühren
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Check className="h-4 w-4" /> Angebote in 24–48h
          </span>
        </div>
      )}
    </form>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="btn-arrow h-4 w-4">
      <path
        d="M4 10h11M11 5l5 5-5 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function JaNeinGroup({
  label,
  name,
  register,
  error,
  idFor,
}: {
  label: string;
  name: "hauseigentuemer";
  register: UseFormRegister<LeadInput>;
  error?: string;
  idFor: (n: string) => string;
}) {
  return (
    <div>
      <span className="field-label" id={`${idFor(name)}-label`}>
        {label}
      </span>
      <div
        role="radiogroup"
        aria-labelledby={`${idFor(name)}-label`}
        className="mt-1 grid grid-cols-2 gap-3"
      >
        {(["Ja", "Nein"] as const).map((opt) => (
          <label
            key={opt}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-line px-4 py-3 text-body text-ink transition-colors hover:border-accent/50 has-[:checked]:border-accent has-[:checked]:bg-accent/5 has-[:checked]:font-medium"
          >
            <input type="radio" value={opt} className="h-4 w-4 accent-accent" {...register(name)} />
            {opt}
          </label>
        ))}
      </div>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

/** Einfachauswahl als Karten (z. B. Produktinteresse). */
function OptionCards({
  label,
  name,
  options,
  register,
  error,
  idFor,
}: {
  label: string;
  name: "product_interest";
  options: readonly string[];
  register: UseFormRegister<LeadInput>;
  error?: string;
  idFor: (n: string) => string;
}) {
  return (
    <div>
      <span className="field-label" id={`${idFor(name)}-label`}>
        {label}
      </span>
      <div
        role="radiogroup"
        aria-labelledby={`${idFor(name)}-label`}
        className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-3"
      >
        {options.map((opt) => (
          <label
            key={opt}
            className="flex cursor-pointer items-center justify-center rounded-xl border border-line px-3 py-3 text-center text-small text-ink transition-colors hover:border-accent/50 has-[:checked]:border-accent has-[:checked]:bg-accent/5 has-[:checked]:font-medium"
          >
            <input type="radio" value={opt} className="sr-only" {...register(name)} />
            {opt}
          </label>
        ))}
      </div>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
