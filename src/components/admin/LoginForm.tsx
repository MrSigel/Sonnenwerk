"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 429) {
        setError("Zu viele Versuche. Bitte warten Sie einige Minuten.");
        return;
      }
      if (!res.ok) {
        setError(data?.error || "Anmeldung fehlgeschlagen.");
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Verbindungsproblem. Bitte versuchen Sie es erneut.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="mt-5 space-y-4">
      <div>
        <label htmlFor="login-email" className="field-label">
          E-Mail
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="username"
          className="field-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="login-password" className="field-label">
          Passwort
        </label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          className="field-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-accent/30 bg-accent/5 px-4 py-2.5 text-small text-accent">
          {error}
        </p>
      )}

      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? "Anmelden …" : "Anmelden"}
      </button>
    </form>
  );
}
