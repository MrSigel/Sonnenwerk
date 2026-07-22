"use client";

import { useState } from "react";
import type { InviteRow, PartnerRow } from "@/lib/admin/invites";

function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Berlin",
  }).format(new Date(iso));
}

export function InviteManager({
  initialInvites,
  partners,
}: {
  initialInvites: InviteRow[];
  partners: PartnerRow[];
}) {
  const [invites, setInvites] = useState<InviteRow[]>(initialInvites);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const createInvite = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.invite) {
        setError("Der Code konnte nicht erzeugt werden. Bitte erneut versuchen.");
        return;
      }
      setInvites((prev) => [data.invite as InviteRow, ...prev]);
      setEmail("");
    } catch {
      setError("Verbindungsproblem. Bitte erneut versuchen.");
    } finally {
      setLoading(false);
    }
  };

  const copy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* ignore */
    }
  };

  const open = invites.filter((i) => !i.used_by);
  const used = invites.filter((i) => i.used_by);

  return (
    <div className="space-y-8">
      {/* Neuen Code erzeugen */}
      <div className="card p-5">
        <h2 className="text-h3 font-semibold text-ink">Neuen Einladungscode erzeugen</h2>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="invite-email" className="field-label">
              Optional an E-Mail binden
            </label>
            <input
              id="invite-email"
              type="email"
              className="field-input"
              placeholder="partner@example.de (optional)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button type="button" className="btn-primary" onClick={createInvite} disabled={loading}>
            {loading ? "Erzeuge …" : "Code erzeugen"}
          </button>
        </div>
        {error && <p className="field-error mt-2">{error}</p>}
      </div>

      {/* Offene Codes */}
      <div>
        <h2 className="text-h3 font-semibold text-ink">Offene Codes ({open.length})</h2>
        <div className="mt-3 overflow-x-auto rounded-card border border-line">
          <table className="w-full min-w-[560px] text-small">
            <thead>
              <tr className="border-b border-line bg-paper-sunk text-left text-ink-soft">
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Gebunden an</th>
                <th className="px-4 py-3 font-medium">Erstellt</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {open.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-ink-soft">
                    Keine offenen Codes.
                  </td>
                </tr>
              ) : (
                open.map((i) => (
                  <tr key={i.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 font-mono font-medium text-ink">{i.code}</td>
                    <td className="px-4 py-3 text-ink-soft">{i.email || "—"}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink-soft">{fmtDate(i.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => copy(i.code)}
                        className="text-accent hover:underline"
                      >
                        {copied === i.code ? "Kopiert!" : "Kopieren"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verbrauchte Codes */}
      <div>
        <h2 className="text-h3 font-semibold text-ink">Verbrauchte Codes ({used.length})</h2>
        <div className="mt-3 overflow-x-auto rounded-card border border-line">
          <table className="w-full min-w-[560px] text-small">
            <thead>
              <tr className="border-b border-line bg-paper-sunk text-left text-ink-soft">
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Gebunden an</th>
                <th className="px-4 py-3 font-medium">Verwendet am</th>
              </tr>
            </thead>
            <tbody>
              {used.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-ink-soft">
                    Noch keine Codes verbraucht.
                  </td>
                </tr>
              ) : (
                used.map((i) => (
                  <tr key={i.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 font-mono text-ink-soft">{i.code}</td>
                    <td className="px-4 py-3 text-ink-soft">{i.email || "—"}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink-soft">
                      {i.used_at ? fmtDate(i.used_at) : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Partner-Übersicht */}
      <div>
        <h2 className="text-h3 font-semibold text-ink">Registrierte Nutzer ({partners.length})</h2>
        <div className="mt-3 overflow-x-auto rounded-card border border-line">
          <table className="w-full min-w-[480px] text-small">
            <thead>
              <tr className="border-b border-line bg-paper-sunk text-left text-ink-soft">
                <th className="px-4 py-3 font-medium">E-Mail</th>
                <th className="px-4 py-3 font-medium">Rolle</th>
                <th className="px-4 py-3 font-medium">Registriert</th>
              </tr>
            </thead>
            <tbody>
              {partners.map((p) => (
                <tr key={p.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 text-ink">{p.email}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[0.75rem] font-medium text-accent">
                      {p.role}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink-soft">{fmtDate(p.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
