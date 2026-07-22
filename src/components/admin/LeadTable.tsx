"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { LeadRow } from "@/lib/admin/leads";

/**
 * Lead-Liste (§17.5): neueste zuerst, Freitextsuche (Name/Ort/PLZ/E-Mail),
 * Filter nach Zeitraum und Hauseigentümer/Solar-Interesse, sortierbar nach Datum,
 * CSV-Export der gefilterten Leads.
 */

type JaNeinFilter = "alle" | "ja" | "nein";

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Berlin",
  }).format(d);
}

function toCsv(rows: LeadRow[]): string {
  const headers = [
    "Datum",
    "Vorname",
    "Name",
    "Straße",
    "Hausnummer",
    "PLZ",
    "Ort",
    "Telefon",
    "E-Mail",
    "Hauseigentümer",
    "Solar-Interesse",
    "Newsletter",
    "Newsletter bestätigt",
    "Quelle",
  ];
  const escape = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = rows.map((r) =>
    [
      new Date(r.created_at).toISOString(),
      r.vorname,
      r.name,
      r.strasse,
      r.hausnummer,
      r.plz,
      r.ort,
      r.telefon,
      r.email,
      r.hauseigentuemer ? "Ja" : "Nein",
      r.solar_interesse ? "Ja" : "Nein",
      r.newsletter_opt_in ? "Ja" : "Nein",
      r.newsletter_confirmed ? "Ja" : "Nein",
      r.quelle,
    ]
      .map((v) => escape(String(v)))
      .join(";")
  );
  // BOM für korrekte Umlaute in Excel.
  return "﻿" + [headers.join(";"), ...lines].join("\r\n");
}

export function LeadTable({ leads }: { leads: LeadRow[] }) {
  const [query, setQuery] = useState("");
  const [owner, setOwner] = useState<JaNeinFilter>("alle");
  const [solar, setSolar] = useState<JaNeinFilter>("alle");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const fromTs = from ? new Date(from + "T00:00:00").getTime() : null;
    const toTs = to ? new Date(to + "T23:59:59").getTime() : null;

    const result = leads.filter((l) => {
      if (q) {
        const hay = `${l.vorname} ${l.name} ${l.ort} ${l.plz} ${l.email}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (owner !== "alle" && l.hauseigentuemer !== (owner === "ja")) return false;
      if (solar !== "alle" && l.solar_interesse !== (solar === "ja")) return false;
      const ts = new Date(l.created_at).getTime();
      if (fromTs !== null && ts < fromTs) return false;
      if (toTs !== null && ts > toTs) return false;
      return true;
    });

    result.sort((a, b) => {
      const diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return sortAsc ? diff : -diff;
    });
    return result;
  }, [leads, query, owner, solar, from, to, sortAsc]);

  const exportCsv = () => {
    const csv = toCsv(filtered);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const stamp = new Date().toISOString().slice(0, 10);
    a.download = `sonnenwerk-leads-${stamp}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const selectClass =
    "rounded-lg border border-line bg-paper px-3 py-2 text-small text-ink focus:border-accent focus:outline-none";

  return (
    <div>
      {/* Filterleiste */}
      <div className="card p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <label htmlFor="q" className="field-label">
              Suche
            </label>
            <input
              id="q"
              className="field-input"
              placeholder="Name, Ort, PLZ oder E-Mail"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="owner" className="field-label">
              Hauseigentümer
            </label>
            <select
              id="owner"
              className={selectClass + " w-full"}
              value={owner}
              onChange={(e) => setOwner(e.target.value as JaNeinFilter)}
            >
              <option value="alle">Alle</option>
              <option value="ja">Ja</option>
              <option value="nein">Nein</option>
            </select>
          </div>
          <div>
            <label htmlFor="solar" className="field-label">
              Solar-Interesse
            </label>
            <select
              id="solar"
              className={selectClass + " w-full"}
              value={solar}
              onChange={(e) => setSolar(e.target.value as JaNeinFilter)}
            >
              <option value="alle">Alle</option>
              <option value="ja">Ja</option>
              <option value="nein">Nein</option>
            </select>
          </div>
          <div>
            <label htmlFor="from" className="field-label">
              Von
            </label>
            <input
              id="from"
              type="date"
              className={selectClass + " w-full"}
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="to" className="field-label">
              Bis
            </label>
            <input
              id="to"
              type="date"
              className={selectClass + " w-full"}
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button type="button" className="btn-ghost w-full" onClick={exportCsv}>
              CSV-Export ({filtered.length})
            </button>
          </div>
        </div>
      </div>

      {/* Tabelle */}
      <div className="mt-4 overflow-x-auto rounded-card border border-line">
        <table className="w-full min-w-[820px] border-collapse text-small">
          <thead>
            <tr className="border-b border-line bg-paper-sunk text-left text-ink-soft">
              <th className="px-4 py-3 font-medium">
                <button
                  type="button"
                  onClick={() => setSortAsc((v) => !v)}
                  className="inline-flex items-center gap-1 hover:text-ink"
                >
                  Datum {sortAsc ? "↑" : "↓"}
                </button>
              </th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">PLZ / Ort</th>
              <th className="px-4 py-3 font-medium">Telefon</th>
              <th className="px-4 py-3 font-medium">E-Mail</th>
              <th className="px-4 py-3 font-medium">Eigent.</th>
              <th className="px-4 py-3 font-medium">Solar</th>
              <th className="px-4 py-3 font-medium">Newsletter</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-ink-soft">
                  Keine Leads gefunden.
                </td>
              </tr>
            ) : (
              filtered.map((l) => (
                <tr key={l.id} className="border-b border-line last:border-0 hover:bg-paper-sunk/60">
                  <td className="whitespace-nowrap px-4 py-3 text-ink-soft">{fmtDate(l.created_at)}</td>
                  <td className="px-4 py-3 font-medium text-ink">
                    {l.vorname} {l.name}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink">
                    {l.plz} {l.ort}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <a href={`tel:${l.telefon}`} className="text-accent hover:underline">
                      {l.telefon}
                    </a>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <a href={`mailto:${l.email}`} className="text-accent hover:underline">
                      {l.email}
                    </a>
                  </td>
                  <td className="px-4 py-3">{l.hauseigentuemer ? "Ja" : "Nein"}</td>
                  <td className="px-4 py-3">{l.solar_interesse ? "Ja" : "Nein"}</td>
                  <td className="px-4 py-3">
                    {l.newsletter_opt_in
                      ? l.newsletter_confirmed
                        ? "Bestätigt"
                        : "Offen"
                      : "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <Link href={`/admin/leads/${l.id}`} className="text-accent hover:underline">
                      Details
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
