"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setPassword("");
        router.refresh();
        return;
      }
      if (res.status === 429) setError("Zu viele Versuche. Bitte später erneut versuchen.");
      else if (res.status === 503) setError("Analytics ist noch nicht konfiguriert.");
      else setError("Passwort falsch.");
    } catch {
      setError("Verbindungsproblem. Bitte erneut versuchen.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-h2 font-bold tracking-tight text-ink">Analytics</h1>
      <p className="mt-2 text-small text-ink-soft">
        Dieser Bereich ist geschützt. Bitte melden Sie sich an.
      </p>
      <form onSubmit={submit} className="card mt-6 p-6">
        <label htmlFor="admin-pw" className="field-label">
          Passwort
        </label>
        <input
          id="admin-pw"
          type="password"
          className="field-input"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
        />
        {error && (
          <p role="alert" className="mt-3 text-small text-accent">
            {error}
          </p>
        )}
        <button type="submit" className="btn-primary mt-5 w-full" disabled={busy || !password}>
          {busy ? "Wird geprüft…" : "Anmelden"}
        </button>
      </form>
    </div>
  );
}
