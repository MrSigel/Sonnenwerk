# SETUP – Manuelle Schritte für Enrico

> Diese Datei listet **alle** Schritte, die außerhalb des Codes nötig sind. Der Code selbst ist
> fertig und deploybar; nichts hiervon wurde automatisch ausgeführt. Arbeite die Punkte in der
> angegebenen **Reihenfolge** ab.

## Reihenfolge auf einen Blick

1. Domain in Resend verifizieren (DNS setzen)
2. Supabase-Projekt anlegen (EU-Region) → Migration → Seed
3. Meta-Pixel-ID besorgen
4. Alle ENV-Werte in Vercel eintragen
5. Deployen und testen

---

## 1. E-Mail / Resend (DNS)

1. Konto bei [resend.com](https://resend.com) anlegen und einloggen.
2. **Domain hinzufügen:** `strom-distributor.de`.
3. Die von Resend angezeigten **DNS-Einträge** bei deinem Domain-/DNS-Anbieter setzen:
   - **SPF** (TXT-Eintrag)
   - **DKIM** (mehrere CNAME/TXT-Einträge – genau die, die Resend anzeigt)
   - empfohlener **Return-Path / MX**-Eintrag
   - _(Die konkreten Werte stehen im Resend-Dashboard – bitte von dort kopieren, nicht erfinden.)_
4. Optional, aber empfohlen: **DMARC** (TXT-Eintrag) für bessere Zustellbarkeit.
5. Warten, bis Resend die Domain als **verifiziert** anzeigt.
6. In Resend einen **API-Key** erstellen → wird später als `RESEND_API_KEY` in Vercel gesetzt.

Danach:
- `MAIL_FROM` = Absenderadresse auf der verifizierten Domain, z. B. `Sonnenwerk <anfrage@strom-distributor.de>`
- `LEAD_RECIPIENT` = Postfach, das die Lead-Benachrichtigungen erhält, z. B. `office@strom-distributor.de`

> Ohne diese Schritte werden **keine** Mails verschickt. Die Seite läuft trotzdem fehlerfrei
> (Leads werden – sofern Supabase eingerichtet ist – weiterhin gespeichert).

---

## 2. Supabase (Datenbank + Login, EU-Region)

1. Projekt auf [supabase.com](https://supabase.com) anlegen. **Region: EU** (z. B. Frankfurt) wählen (DSGVO).
2. Unter **Project Settings → API** notieren:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` Key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` Key → `SUPABASE_SERVICE_ROLE_KEY` _(geheim, nur serverseitig!)_
3. **Migration einspielen:** SQL-Editor öffnen und den kompletten Inhalt von
   [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) einfügen und ausführen.
   Das legt die Tabellen `leads`, `invite_codes`, `profiles`, die Rollen und die RLS-Policies an.
4. **Seed ausführen (legt Sebastian als Admin an + ersten Einladungscode):**
   - Lokal die Werte in `.env.local` eintragen (mindestens `NEXT_PUBLIC_SUPABASE_URL`,
     `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_SEED_EMAIL`, `ADMIN_SEED_PASSWORD`).
   - Dann im Projektordner ausführen:
     ```bash
     node --env-file=.env.local scripts/seed.mjs
     ```
   - Das Skript gibt am Ende den **ersten Einladungscode** aus. Diesen an den ersten Partner geben.
5. **Admin-Login:** `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` sind Sebastians Zugang unter `/admin/login`.
   Weitere Partner registrieren sich unter `/admin/registrieren` mit einem Einladungscode, den
   Sebastian im Admin-Bereich unter **„Einladungen"** erzeugt.

> Ohne Supabase läuft die Landingpage ebenfalls (Formular, Mailversand). Es werden dann nur keine
> Leads gespeichert und der Admin-Bereich ist inaktiv.

---

## 3. Meta-Pixel

1. Im [Meta Events Manager](https://business.facebook.com/events_manager) den Pixel anlegen bzw. die
   **Pixel-ID** kopieren.
2. Diese ID als `NEXT_PUBLIC_META_PIXEL_ID` in Vercel setzen.

> Der Pixel lädt **nur** nach aktiver Marketing-Einwilligung im Cookie-Banner. Das `Lead`-Event
> feuert genau einmal auf `/danke`. Ohne ID/Consent wird nichts geladen.

---

## 4. Newsletter-DOI & Basis-URL

- `NEXT_PUBLIC_SITE_URL` = finale öffentliche URL, z. B. `https://sonnenwerk.de` (für Links in E-Mails).
- `DOI_SECRET` = langer Zufallswert zum Signieren der Double-Opt-in-Tokens. Erzeugen z. B. mit:
  ```bash
  node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
  ```

---

## 5. Optional: verteiltes Rate-Limiting (Upstash)

Für Serverless/Multi-Instanz-Betrieb (Vercel) empfiehlt sich ein geteilter Zähler. Ohne diese Werte
greift automatisch ein In-Memory-Limiter (kein Fehler).

1. Bei [upstash.com](https://upstash.com) eine **Redis**-Datenbank anlegen (REST aktiv).
2. `UPSTASH_REDIS_REST_URL` und `UPSTASH_REDIS_REST_TOKEN` in Vercel setzen.

---

## 6. ENV in Vercel eintragen & Deployen

1. Projekt in Vercel importieren (Framework: **Next.js**, keine Sonderkonfiguration nötig).
2. Unter **Settings → Environment Variables** alle Variablen aus `.env.example` mit den echten
   Werten hinterlegen:

   | Variable | Quelle |
   |---|---|
   | `RESEND_API_KEY` | Resend-Dashboard |
   | `MAIL_FROM` | Absender auf verifizierter Domain |
   | `LEAD_RECIPIENT` | Empfänger-Postfach |
   | `NEXT_PUBLIC_SITE_URL` | finale Domain |
   | `DOI_SECRET` | selbst erzeugter Zufallswert |
   | `NEXT_PUBLIC_META_PIXEL_ID` | Meta Events Manager |
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase API-Settings |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase API-Settings |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase API-Settings (geheim!) |
   | `ADMIN_SEED_EMAIL` | Sebastians Login-E-Mail |
   | `ADMIN_SEED_PASSWORD` | Sebastians Login-Passwort |
   | `UPSTASH_REDIS_REST_URL` | optional (Upstash) |
   | `UPSTASH_REDIS_REST_TOKEN` | optional (Upstash) |

3. **Deploy** auslösen.

---

## 7. Bilder austauschen

- Das Hero-Bild (`public/img/hero-haus.jpg`) ist die vom Kunden gelieferte Aufnahme: moderne
  Sichtbeton-Immobilie mit integrierter Solaranlage auf dem Dach, klare Linien, kühle Lichtstimmung.
  Es wird als Vollflächen-Hintergrund über `next/image` optimiert ausgeliefert (JPG, ~164 KB).
  Zum Austauschen einfach `public/img/hero-haus.jpg` überschreiben (gleicher Dateiname → keine
  Code-Änderung nötig; Querformat, mind. ~1600 px Breite empfohlen).
- Zum Austauschen gegen finale Immobilien-Fotografie einfach `public/img/hero-haus.jpg` durch das
  eigene Bild ersetzen (gleicher Dateiname → keine Code-Änderung nötig). Empfehlung: Querformat,
  mind. 1600 px Breite, moderne, cleane Architektur mit integrierter Solaranlage.

---

## Abschluss-Test (nach Deploy)

- [ ] Startseite lädt, Formular absenden → Weiterleitung auf `/danke`.
- [ ] Lead-Mail kommt bei `LEAD_RECIPIENT` an, Kundenbestätigung beim Kunden.
- [ ] Newsletter angehakt → Bestätigungs-Mail → Link klicken → `/newsletter-bestaetigt`, Beleg beim Empfänger.
- [ ] Cookie-Banner: „Ablehnen" lädt keinen Pixel; „Akzeptieren" lädt Pixel, `Lead` feuert auf `/danke`.
- [ ] `/admin/login` mit Seed-Zugang → Lead-Liste sichtbar; Einladungscode erzeugbar.
