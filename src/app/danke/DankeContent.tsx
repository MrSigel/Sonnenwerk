"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { consumePendingLead, type PendingLead } from "@/lib/pendingLead";
import { trackLead } from "@/lib/meta";
import { Check } from "@/components/ui/Check";

/**
 * Erfolgs-Ansicht `/danke` (§8.1).
 * - Liest die kurzlebige Absende-Zusammenfassung (Schutz gegen Deep-Link-Missbrauch).
 * - Feuert das Meta `Lead`-Event genau einmal (§15) – nur bei echter Conversion.
 */
export function DankeContent() {
  const [lead, setLead] = useState<PendingLead | null>(null);
  const [checked, setChecked] = useState(false);
  const fired = useRef(false);

  useEffect(() => {
    const pending = consumePendingLead();
    setLead(pending);
    setChecked(true);
    // Lead-Event nur bei gültiger, frischer Conversion – genau einmal.
    if (pending && !fired.current) {
      fired.current = true;
      trackLead();
    }
  }, []);

  if (!checked) return null;

  // Kein gültiger Submit → keine falsche Conversion, freundlicher Hinweis.
  if (!lead) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <h1 className="text-h2 font-bold tracking-tight text-ink">Keine aktuelle Anfrage gefunden</h1>
        <p className="mt-4 text-body text-ink-soft">
          Diese Seite bestätigt eine soeben abgeschickte Anfrage. Möchten Sie eine Anfrage
          stellen, füllen Sie bitte das Formular auf der Startseite aus.
        </p>
        <Link href="/" className="btn-primary mt-8">
          Zur Startseite
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center gap-3">
        <Check className="h-8 w-8" />
        <h1 className="text-h2 font-bold tracking-tight text-ink">
          Vielen Dank, {lead.vorname}!
        </h1>
      </div>

      <p className="mt-4 text-body text-ink">
        Ein Fachpartner in Ihrer Region kontaktiert Sie innerhalb von 24–48 Stunden.
      </p>

      <div className="card mt-8 p-6">
        <h2 className="text-h3 font-semibold text-ink">Ihre übermittelten Daten</h2>
        <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
          <Row label="Vorname" value={lead.vorname} />
          <Row label="Name" value={lead.name} />
          <Row label="Straße" value={`${lead.strasse} ${lead.hausnummer}`} />
          <Row label="PLZ / Ort" value={`${lead.plz} ${lead.ort}`} />
          <Row label="Telefonnummer" value={lead.telefon} />
          <Row label="E-Mail" value={lead.email} />
          <Row label="Hauseigentümer" value={lead.hauseigentuemer} />
          <Row label="Solar-Interesse" value={lead.solar_interesse} />
        </dl>
      </div>

      <p className="mt-6 text-small text-ink-soft">
        {lead.newsletter ? (
          <>
            Sie haben den Newsletter aktiviert. Zum Abschluss der Anmeldung senden wir Ihnen
            noch eine <strong className="text-ink">Bestätigungs-E-Mail</strong>. Bitte
            bestätigen Sie darin Ihre Anmeldung – erst dann erhalten Sie unseren Newsletter.
          </>
        ) : (
          <>
            Sie haben den Newsletter nicht aktiviert. Möchten Sie künftig Tipps und
            Förder-Updates erhalten, können Sie ihn bei einer nächsten Anfrage abonnieren.
          </>
        )}
      </p>

      <Link href="/" className="btn-ghost mt-8">
        Zur Startseite
      </Link>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-line py-1.5 sm:border-none">
      <dt className="text-small text-ink-soft">{label}</dt>
      <dd className="text-small font-medium text-ink">{value}</dd>
    </div>
  );
}
