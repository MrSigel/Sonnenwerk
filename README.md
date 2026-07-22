# Sonnenwerk – Landingpage & Admin

Single-Page-Landingpage für **Sonnenwerk** (Lead-Vermittlung für Solaranlagen) mit
DSGVO-konformem Formular, E-Mail-Versand über Resend, Newsletter-Double-Opt-in,
consent-gatetem Meta-Pixel und einem geschützten Admin-Bereich (Supabase).

> **Slogan:** „Geprüfte Solar-Angebote aus Ihrer Region."

## Tech-Stack

- **Next.js** (App Router, TypeScript) + **Tailwind CSS** (Custom-Tokens: Jägergrün + Weiß)
- **React Hook Form** + **Zod** (Formular & Validierung, client- und serverseitig identisch)
- **Resend** – gesamter E-Mail-Verkehr (Lead-Mail, Kundenbestätigung, Newsletter-DOI)
- **Supabase** – Datenbank & Login für den Admin-Bereich (EU-Region)
- **Meta-Pixel** – nur nach Einwilligung; `Lead`-Event auf `/danke`
- **Rate-Limiting** – In-Memory-Default, optional Upstash (Redis) per ENV

## Lokaler Start

```bash
# 1. Abhängigkeiten installieren
npm install

# 2. Umgebungsvariablen anlegen (Werte eintragen – siehe SETUP.md)
cp .env.example .env.local
#   .env.local öffnen und Werte befüllen. Ohne Werte läuft die App ebenfalls,
#   externe Features (Mail/DB/Pixel) sind dann inaktiv (kein Crash).

# 3. Entwicklung
npm run dev
# → http://localhost:3000

# 4. Produktions-Build (läuft auch mit komplett leeren ENV-Werten)
npm run build
npm start
```

## Wichtige Routen

| Route | Zweck |
|---|---|
| `/` | Landingpage mit Kontaktformular |
| `/danke` | Erfolgsseite nach Absenden (noindex, Meta-`Lead`-Event) |
| `/impressum`, `/datenschutz` | Rechtstexte |
| `/newsletter-bestaetigt`, `/newsletter-link-ungueltig` | DOI-Ergebnisseiten |
| `/admin/login`, `/admin/registrieren` | Zugang (Registrierung nur mit Einladungscode) |
| `/admin` | Lead-Liste (Suche/Filter/CSV-Export) |
| `/admin/leads/[id]` | Lead-Detail |
| `/admin/einladungen` | Einladungscodes verwalten (nur Admin) |
| `/api/lead` | Lead-Verarbeitung (Speichern + Mailversand) |
| `/api/newsletter/confirm` | Double-Opt-in-Bestätigung |

## Umgebungsvariablen

Alle Variablen sind in [`.env.example`](.env.example) dokumentiert. Details zur Beschaffung der
Werte und alle manuellen Schritte (DNS/Resend, Supabase-Migration/Seed, Meta-Pixel, Vercel-ENV)
stehen in [`SETUP.md`](SETUP.md).

Grundprinzip: **Secrets ausschließlich über ENV**, nichts hartkodiert. Der Service-Role-Key und der
Resend-Key werden nie an den Client gegeben. Fehlende ENV führt nie zu einem Crash – betroffene
Features sind dann sauber inaktiv.

## Datenbank

SQL-Migration: [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql)
(Tabellen `leads`, `invite_codes`, `profiles` + RLS). Seed: [`scripts/seed.mjs`](scripts/seed.mjs)
(legt den Admin an und erzeugt den ersten Einladungscode). Beides wird **nicht** automatisch
ausgeführt – siehe SETUP.md.

## Deployment

Standard-Next.js-Projekt, ohne Sonderkonfiguration auf **Vercel** deploybar. ENV in den
Vercel-Projekteinstellungen setzen (siehe SETUP.md), dann deployen.
