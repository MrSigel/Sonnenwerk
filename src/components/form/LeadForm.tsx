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
 * Kontaktformular (§6). Schlanker 3-Schritte-Wizard: erst zwei schnelle
 * Klick-Schritte (Vorhaben, Gebäude), dann gebündelt die Kontaktdaten.
 *
 * WICHTIG: Der Feldumfang ist NICHT frei wählbar — product_interest, timeframe,
 * is_owner, building.type und building.roof_shape sind Pflichtfelder der
 * LIMITBREAKERS-Spezifikation v1.0 (S. 3: „Fehlt eines, wird der Lead
 * abgelehnt."). Vereinfacht wurde daher die Führung (weniger Schritte, große
 * Auswahlkacheln, neutrale Fragen), nicht der Datenumfang.
 *
 * Client-Validierung via Zod (§7, pro Schritt), Honeypot + Zeitfalle (§9).
 * Submit → /api/lead → bei Erfolg Weiterleitung auf /danke (§8.1).
 */

const STEPS = [
  { title: "Ihr Vorhaben", fields: ["product_interest", "timeframe", "hauseigentuemer"] },
  { title: "Ihr Gebäude", fields: ["building_type", "roof_shape"] },
  {
    title: "Ihre Kontaktdaten",
    fields: [
      "vorname",
      "name",
      "strasse",
      "hausnummer",
      "plz",
      "ort",
      "telefon",
      "email",
      "datenschutz",
    ],
  },
] as const;

const LAST = STEPS.length - 1;

// Teil-Schemata pro Schritt — nur die Felder des jeweiligen Schritts validieren.
// (RHF `trigger` würde mit Zod-Resolver das GESAMTE Schema prüfen und wegen der
//  noch leeren späteren Felder fehlschlagen.)
const STEP_SCHEMAS = [
  leadSchema.pick({ product_interest: true, timeframe: true, hauseigentuemer: true }),
  leadSchema.pick({ building_type: true, roof_shape: true }),
  leadSchema.pick({
    vorname: true,
    name: true,
    strasse: true,
    hausnummer: true,
    plz: true,
    ort: true,
    telefon: true,
    email: true,
    datenschutz: true,
  }),
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
    // Honeypot ("company") NIE aus dem echten Formular mitsenden: Autofill/
    // Passwort-Manager befüllen das unsichtbare Feld gelegentlich und würden
    // sonst den serverseitigen Spam-Filter fälschlich auslösen — der Lead ginge
    // verloren. Direkt-POST-Bots, die das Feld befüllen, werden serverseitig
    // weiterhin erkannt.
    const payload: Record<string, unknown> = {
      ...values,
      // Ausfülldauer im Browser messen (eine Uhr → immun gegen Uhr-Differenz
      // zwischen Browser und Server). Absolute Zeitstempel zu vergleichen war
      // fehlerhaft und blockierte Nutzer mit leicht abweichender Systemuhr.
      fillMs: Math.max(0, Date.now() - formLoadedAt.current),
    };
    delete payload.company;
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
        {/* SCHRITT 1 — IHR VORHABEN (drei schnelle Klicks) */}
        {step === 0 && (
          <div className="space-y-5">
            <OptionCards
              label="Was möchten Sie umsetzen?*"
              name="product_interest"
              options={PRODUCT_OPTIONS}
              register={register}
              error={errors.product_interest?.message}
              idFor={fieldId}
            />
            <OptionCards
              label="Wann soll es losgehen?*"
              name="timeframe"
              options={TIMEFRAME_OPTIONS}
              cols="sm:grid-cols-4"
              register={register}
              error={errors.timeframe?.message}
              idFor={fieldId}
            />
            <JaNeinGroup
              label="Gehört Ihnen die Immobilie?*"
              name="hauseigentuemer"
              register={register}
              error={errors.hauseigentuemer?.message}
              idFor={fieldId}
            />
          </div>
        )}

        {/* SCHRITT 2 — IHR GEBÄUDE */}
        {step === 1 && (
          <div className="space-y-5">
            <OptionCards
              label="Um welches Gebäude geht es?*"
              name="building_type"
              options={BUILDING_OPTIONS}
              cols="sm:grid-cols-3"
              register={register}
              error={errors.building_type?.message}
              idFor={fieldId}
            />

            <div>
              <span className="field-label" id={`${fieldId("roof_shape")}-label`}>
                Welche Dachform hat das Gebäude?*{" "}
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
            </div>
          </div>
        )}

        {/* SCHRITT 3 — KONTAKTDATEN + ZUSTIMMUNG */}
        {step === 2 && (
          <div className="space-y-4">
            <fieldset className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <legend className="sr-only">Name</legend>
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
              </div>
            </fieldset>

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
              </div>
              <EmailAutocomplete
                control={control}
                setValue={setValue}
                error={errors.email?.message}
              />
            </fieldset>

            {/* Datenschutz-Häkchen (Pflicht) */}
            <div className="pt-1">
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
            </div>

            {/* Newsletter-Opt-in (optional) */}
            <div>
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
    </div>
  );
}

/** Einfachauswahl als Karten (Produktinteresse, Zeitraum, Gebäudetyp). */
function OptionCards({
  label,
  name,
  options,
  cols = "sm:grid-cols-3",
  register,
  error,
  idFor,
}: {
  label: string;
  name: "product_interest" | "timeframe" | "building_type";
  options: readonly string[];
  /** Spalten ab sm — Anzahl passend zur Optionenzahl. */
  cols?: string;
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
        className={`mt-1 grid grid-cols-2 gap-2 ${cols}`}
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
    </div>
  );
}
