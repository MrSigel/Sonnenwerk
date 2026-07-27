import Link from "next/link";
import { readRange, type DayStats } from "@/lib/analytics/store";
import { DWELL_BUCKETS, SCROLL_BUCKETS } from "@/lib/analytics/events";

/** Lesbare Namen für die Abschnitts-IDs der Startseite. */
const SECTION_LABELS: Record<string, string> = {
  anfrage: "Anfrage-Formular",
  vorteile: "Vorteile",
  vergleich: "Vergleich",
  ablauf: "Ablauf",
  warum: "Warum wir",
  faq: "FAQ",
};

const FUNNEL_LABELS: Array<[string, string]> = [
  ["form_view", "Formular gesehen"],
  ["step1", "Schritt 1 begonnen"],
  ["step2", "Schritt 2 erreicht"],
  ["submit", "Abgeschickt"],
];

const EXIT_LABELS: Array<[string, string]> = [
  ["shown", "Eingeblendet"],
  ["read", "Gelesen (≥ 3 s)"],
  ["clicked", "Auf Anfrage geklickt"],
  ["dismissed", "Weggeklickt"],
];

function sum(stats: DayStats, prefix: string): number {
  let n = 0;
  for (const [k, v] of Object.entries(stats)) if (k.startsWith(prefix)) n += v;
  return n;
}

function pct(part: number, whole: number): string {
  if (whole <= 0) return "–";
  return `${Math.round((part / whole) * 100)} %`;
}

export async function Dashboard({ days }: { days: number }) {
  const { total, perDay, available } = await readRange(days);

  if (!available) {
    return (
      <Panel title="Analytics ist noch nicht aktiv">
        <p className="text-body text-ink-soft">
          Für die Auswertung fehlt der Datenspeicher. Legen Sie bei{" "}
          <a className="text-accent underline" href="https://upstash.com" target="_blank" rel="noreferrer">
            Upstash
          </a>{" "}
          eine kostenlose Redis-Datenbank an und tragen Sie in Vercel{" "}
          <code>UPSTASH_REDIS_REST_URL</code> und <code>UPSTASH_REDIS_REST_TOKEN</code> ein.
          Danach einmal neu deployen.
        </p>
      </Panel>
    );
  }

  const pageviews = sum(total, "pv:");
  const startPageviews = total["pv:/"] ?? 0;
  const submits = total["funnel:submit"] ?? 0;
  const formViews = total["funnel:form_view"] ?? 0;
  const dwellSum = sum(total, "dwellSum:");
  const dwellN = sum(total, "dwellN:");
  const avgDwell = dwellN > 0 ? Math.round(dwellSum / dwellN) : 0;

  const sections = Object.entries(total)
    .filter(([k]) => k.startsWith("secSum:"))
    .map(([k, seconds]) => {
      const id = k.slice("secSum:".length);
      const views = total[`sec:${id}`] ?? 0;
      return {
        id,
        label: SECTION_LABELS[id] ?? id,
        views,
        avg: views > 0 ? Math.round(seconds / views) : 0,
      };
    })
    .sort((a, b) => b.avg - a.avg);

  const sources = Object.entries(total)
    .filter(([k]) => k.startsWith("ref:"))
    .map(([k, v]) => [k.slice(4), v] as const)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const mobile = total["dev:mobile"] ?? 0;
  const desktop = total["dev:desktop"] ?? 0;

  return (
    <div className="space-y-8">
      {/* Kennzahlen */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Seitenaufrufe" value={pageviews.toLocaleString("de-DE")} />
        <Kpi label="Anfragen" value={submits.toLocaleString("de-DE")} />
        <Kpi
          label="Abschlussquote"
          value={pct(submits, formViews)}
          hint={`${submits} von ${formViews} Formularansichten`}
        />
        <Kpi
          label="Ø Verweildauer"
          value={avgDwell >= 60 ? `${Math.floor(avgDwell / 60)}:${String(avgDwell % 60).padStart(2, "0")} min` : `${avgDwell} s`}
        />
      </div>

      {/* Formular-Funnel */}
      <Panel title="Formular-Verlauf — wo brechen Besucher ab?">
        <div className="space-y-3">
          {FUNNEL_LABELS.map(([key, label], i) => {
            const value = total[`funnel:${key}`] ?? 0;
            const base = formViews || 1;
            const prev = i > 0 ? total[`funnel:${FUNNEL_LABELS[i - 1][0]}`] ?? 0 : value;
            const drop = i > 0 && prev > 0 ? prev - value : 0;
            return (
              <div key={key}>
                <div className="flex items-baseline justify-between text-small">
                  <span className="font-medium text-ink">{label}</span>
                  <span className="text-ink-soft">
                    {value.toLocaleString("de-DE")} · {pct(value, base)}
                    {drop > 0 && (
                      <span className="ml-2 text-accent">−{drop.toLocaleString("de-DE")}</span>
                    )}
                  </span>
                </div>
                <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-line">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${Math.min(100, (value / base) * 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Scrolltiefe */}
        <Panel title="Wie weit wird gescrollt? (Startseite)">
          <div className="space-y-3">
            {SCROLL_BUCKETS.map((b) => {
              const value = total[`scroll:/:${b}`] ?? 0;
              return (
                <div key={b}>
                  <div className="flex items-baseline justify-between text-small">
                    <span className="text-ink">bis {b} %</span>
                    <span className="text-ink-soft">
                      {value.toLocaleString("de-DE")} · {pct(value, startPageviews)}
                    </span>
                  </div>
                  <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-line">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${Math.min(100, (value / (startPageviews || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        {/* Verweildauer-Verteilung */}
        <Panel title="Verweildauer (Startseite)">
          <div className="space-y-3">
            {DWELL_BUCKETS.map((b) => {
              const value = total[`dwell:/:${b.key}`] ?? 0;
              const totalDwell = DWELL_BUCKETS.reduce(
                (acc, x) => acc + (total[`dwell:/:${x.key}`] ?? 0),
                0
              );
              return (
                <div key={b.key}>
                  <div className="flex items-baseline justify-between text-small">
                    <span className="text-ink">{b.key}</span>
                    <span className="text-ink-soft">
                      {value.toLocaleString("de-DE")} · {pct(value, totalDwell)}
                    </span>
                  </div>
                  <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-line">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${Math.min(100, (value / (totalDwell || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      {/* Abschnitte */}
      <Panel title="Welche Abschnitte werden am längsten betrachtet?">
        {sections.length === 0 ? (
          <Empty />
        ) : (
          <table className="w-full text-small">
            <thead>
              <tr className="border-b border-line text-left text-ink-soft">
                <th className="py-2 font-medium">Abschnitt</th>
                <th className="py-2 text-right font-medium">Gesehen</th>
                <th className="py-2 text-right font-medium">Ø Dauer</th>
              </tr>
            </thead>
            <tbody>
              {sections.map((s) => (
                <tr key={s.id} className="border-b border-line last:border-0">
                  <td className="py-2 text-ink">{s.label}</td>
                  <td className="py-2 text-right text-ink-soft">
                    {s.views.toLocaleString("de-DE")}
                  </td>
                  <td className="py-2 text-right font-medium text-ink">{s.avg} s</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Exit-Banner */}
        <Panel title="Exit-Banner">
          <div className="space-y-3">
            {EXIT_LABELS.map(([key, label]) => {
              const value = total[`exit:${key}`] ?? 0;
              const shown = total["exit:shown"] ?? 0;
              return (
                <div key={key} className="flex items-baseline justify-between text-small">
                  <span className="text-ink">{label}</span>
                  <span className="text-ink-soft">
                    {value.toLocaleString("de-DE")}
                    {key !== "shown" && shown > 0 && (
                      <span className="ml-2 font-medium text-ink">{pct(value, shown)}</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </Panel>

        {/* Geräte & Herkunft */}
        <Panel title="Geräte &amp; Herkunft">
          <div className="flex items-baseline justify-between text-small">
            <span className="text-ink">Mobil</span>
            <span className="text-ink-soft">
              {mobile.toLocaleString("de-DE")} · {pct(mobile, mobile + desktop)}
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between text-small">
            <span className="text-ink">Desktop</span>
            <span className="text-ink-soft">
              {desktop.toLocaleString("de-DE")} · {pct(desktop, mobile + desktop)}
            </span>
          </div>
          <p className="mt-5 mb-2 text-small font-medium text-ink">Woher kommen die Besucher?</p>
          {sources.length === 0 ? (
            <Empty />
          ) : (
            <ul className="space-y-1.5">
              {sources.map(([host, n]) => (
                <li key={host} className="flex items-baseline justify-between text-small">
                  <span className="text-ink">{host === "direct" ? "Direkt / Lesezeichen" : host}</span>
                  <span className="text-ink-soft">{n.toLocaleString("de-DE")}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {/* Verlauf */}
      <Panel title="Verlauf">
        <div className="flex items-end gap-1 overflow-x-auto">
          {perDay.map(({ day, stats }) => {
            const v = sum(stats, "pv:");
            const max = Math.max(1, ...perDay.map((d) => sum(d.stats, "pv:")));
            return (
              <div key={day} className="flex min-w-[18px] flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-accent/80"
                  style={{ height: `${Math.max(2, (v / max) * 120)}px` }}
                  title={`${day}: ${v} Aufrufe`}
                />
                <span className="text-[10px] text-ink-soft">{day.slice(8)}</span>
              </div>
            );
          })}
        </div>
      </Panel>

      <p className="text-small text-ink-soft">
        Alle Werte sind anonyme Summen. Es werden keine Cookies gesetzt, keine IP-Adressen und
        keine Einzelprofile gespeichert.{" "}
        <Link href="/" className="text-accent underline">
          Zur Website
        </Link>
      </p>
    </div>
  );
}

function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="card p-5">
      <p className="text-small text-ink-soft">{label}</p>
      <p className="mt-1 text-h2 font-bold tracking-tight text-ink">{value}</p>
      {hint && <p className="mt-1 text-[11px] text-ink-soft">{hint}</p>}
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card p-6">
      <h2 className="mb-4 text-h3 font-semibold text-ink">{title}</h2>
      {children}
    </section>
  );
}

function Empty() {
  return <p className="text-small text-ink-soft">Noch keine Daten im gewählten Zeitraum.</p>;
}
