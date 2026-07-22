import Link from "next/link";
import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/admin/auth";
import { fetchLead } from "@/lib/admin/leads";
import { AdminShell } from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Europe/Berlin",
  }).format(new Date(iso));
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const profile = await requireProfile();
  const { id } = await params;
  const lead = await fetchLead(id);
  if (!lead) notFound();

  const rows: [string, React.ReactNode][] = [
    ["Eingegangen am", fmtDate(lead.created_at)],
    ["Vorname", lead.vorname],
    ["Name", lead.name],
    ["Straße", `${lead.strasse} ${lead.hausnummer}`],
    ["Postleitzahl", lead.plz],
    ["Ort", lead.ort],
    [
      "Telefonnummer",
      <a key="tel" href={`tel:${lead.telefon}`} className="text-accent hover:underline">
        {lead.telefon}
      </a>,
    ],
    [
      "E-Mail",
      <a key="mail" href={`mailto:${lead.email}`} className="text-accent hover:underline">
        {lead.email}
      </a>,
    ],
    ["Hauseigentümer", lead.hauseigentuemer ? "Ja" : "Nein"],
    ["Solar-Interesse", lead.solar_interesse ? "Ja" : "Nein"],
    [
      "Newsletter",
      lead.newsletter_opt_in
        ? lead.newsletter_confirmed
          ? "Angemeldet (bestätigt)"
          : "Angemeldet (Bestätigung offen)"
        : "Nein",
    ],
    ["Datenschutz", lead.datenschutz_akzeptiert ? "akzeptiert" : "—"],
    ["Quelle", lead.quelle],
  ];

  return (
    <AdminShell profile={profile} active="leads">
      <Link href="/admin" className="text-small text-accent hover:underline">
        ← Zurück zur Lead-Liste
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="text-h2 font-bold tracking-tight text-ink">
          {lead.vorname} {lead.name}
        </h1>
      </div>

      <div className="mt-6 max-w-2xl">
        <dl className="card divide-y divide-line">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-6 px-5 py-3">
              <dt className="text-small text-ink-soft">{label}</dt>
              <dd className="text-right text-body font-medium text-ink">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-4 flex flex-wrap gap-3">
          <a href={`tel:${lead.telefon}`} className="btn-primary">
            Anrufen
          </a>
          <a href={`mailto:${lead.email}`} className="btn-ghost">
            E-Mail schreiben
          </a>
        </div>
      </div>
    </AdminShell>
  );
}
