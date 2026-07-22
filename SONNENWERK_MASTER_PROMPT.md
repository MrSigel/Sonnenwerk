# MASTER-PROMPT — Sonnenwerk Landingpage (Claude Code)

> Dieser Prompt ist die **verbindliche, vollständige Bauanweisung**. Setze alles **1:1** um.
> Keine Platzhalter, keine Lorem-ipsum-Texte, keine erfundenen Daten. Alle Inhalte, Texte,
> Adressen und Feldbezeichnungen stehen unten wörtlich drin und werden exakt so eingebaut.
> Bei Unklarheit gilt: exakt das umsetzen, was hier steht — nichts hinzufügen, nichts weglassen.

**Marke:** Sonnenwerk · **Slogan:** „Geprüfte Solar-Angebote aus Ihrer Region."

### So arbeitest du (Claude Code) dieses Projekt ab — Grundregeln
1. **Nur Code & Dateien erzeugen.** Lege **keine** externen Konten an (Supabase, Resend, Meta,
   Domain), verifiziere nichts, versende keine echten Mails. Alles Externe macht Enrico danach selbst.
2. **`.env.local` vorbereiten** mit **allen** benötigten Variablen als **leere Platzhalter**
   (Schlüssel vorhanden, Werte leer). Zusätzlich eine identische `.env.example` als Referenz.
   **Niemals** echte Keys/Secrets schreiben. Enrico trägt die Werte später selbst ein.
3. **Vercel-deploybar** bauen: Standard-Next.js-Projekt, das ohne Sondertricks auf Vercel läuft.
   Alle Secrets ausschließlich über ENV (lokal `.env.local`, in Produktion Vercel-ENV). Nichts
   hartkodieren. `.gitignore` enthält `.env*`, `node_modules`, `.next`.
4. **Fehlende ENV = kein Absturz beim Build.** Die App muss `npm run build` **erfolgreich**
   durchlaufen, auch wenn alle ENV-Werte leer sind. Zur Laufzeit fehlende Keys sauber abfangen
   (freundliche Fehlermeldung / Feature inaktiv), niemals harte Crashes.
5. **In Phasen bauen** (siehe §18) und am Ende den **Selbst-Check** (§19) abarbeiten.
6. Manuelles Setup (DNS, Keys, Konten) gehört **nur** in `SETUP.md` als To-do-Liste für Enrico —
   nicht ausführen.

---

## 0. Ziel & Kontext

Single-Page Landingpage für **Sonnenwerk** — ein Lead-Vermittlungsdienst für Solaranlagen.
Der einzige Zweck der Seite: Besucher füllen **ein Kontaktformular** aus. Alles, was nicht
zur Eintragung führt, gehört nicht auf die Seite.

Kernprinzip (Grundregel aus dem Briefing): **Weniger ist mehr.** Jedes Element braucht einen
Grund. Der Kunde soll in Sekunden verstehen, worum es geht, und sich eintragen.

---

## 1. Tech-Stack (fix)

- **Next.js** (App Router, TypeScript)
- **Tailwind CSS** (Custom-Tokens, siehe §3 — niemals rohe `slate-`/`gray-` Utilities)
- **React Hook Form** + **Zod** für Formular & Validierung
- **Lead-Zustellung: eigenes Formular + Resend** — der Website-eigene API-Endpunkt versendet die
  E-Mails direkt an den Empfänger (siehe §8). Kein CRM, kein Bitrix, kein n8n.
- **Datenhaltung + Admin-Bereich:** alle Leads werden zusätzlich in **Supabase** (DB + Auth)
  gespeichert und unter **`/admin`** gebündelt angezeigt (siehe §17). E-Mail-Versand bleibt
  ausschließlich Resend; Supabase ist Datenbank & Login, kein Maildienst.
- **E-Mail:** [Resend](https://resend.com) via offizielles `resend` npm-SDK, Versand aus einer
  Next.js Server-Route (Node-Runtime). **Der gesamte E-Mail-Verkehr — Lead-Mail, Kundenbestätigung
  UND Newsletter-Double-Opt-in — läuft ausschließlich über Resend.** Kein weiterer Maildienst.
- **Newsletter: Double-Opt-in (DOI)** komplett über Resend abgebildet (siehe §8A).
- **Consent/Cookie-Banner** (siehe §14) — Pflicht, da die Seite über **Meta Ads** ausgespielt wird.
- **Meta-Pixel** sauber und **consent-gated** eingebunden (siehe §15).
- **Rate-Limiting** auf allen schreibenden API-Routen (siehe §16).
- Deployment-ready (Vercel-kompatibel); `.env.local` + `.env.example` nach §8.5 mitliefern
- Mobile First — die Seite wird **zuerst fürs Smartphone** gebaut, Desktop ist die Erweiterung

---

## 2. Design-Vorgaben (Briefing §1) — verbindlich

- **Farben: Jägergrün + Weiß — sonst nichts.** Viel Weißraum. Jägergrün gezielt für
  Überschriften, Buttons und Akzente.
- **Stil: komplett clean, Apple-like, eher kühl und hochwertig.** Keine verspielten Elemente,
  keine Stock-Foto-Familien mit Daumen hoch.
- **Bildwelt:** cleane, moderne Immobilien — reduzierte Architektur-Fotografie, klare Linien,
  kühle Lichtstimmung, Solaranlagen elegant integriert.
- **Typografie:** eine klare, moderne Schrift im **SF-/Helvetica-Neue-/Inter-Stil**. Große,
  ruhige Überschriften, viel Luft. → Verwende **Inter** via `next/font` (Kundenvorgabe; diese
  Vorgabe hat Vorrang vor abweichenden Haus-Defaults).
- **Aufbau:** ein Kontaktformular mit ein paar Highlights — keine überladene Seite.

> **Design-Disziplin trotz Inter/clean:** kein Default-Tailwind-Look. Cards mit `border`-Hairline
> statt `shadow-lg`, dezente Radien, Weißraum als Gestaltungsmittel, ein einziges Akzent-Signal
> (Jägergrün) pro Screen. Kein zweiter Akzentton.

---

## 3. Design-Tokens (in `tailwind.config.ts` registrieren)

```
colors:
  paper:        #FFFFFF   /* reines Weiß, Haupthintergrund (Briefing: Weiß) */
  paper-sunk:   #F4F7F5   /* minimal kühl abgesetzte Flächen für Sektionswechsel */
  ink:          #0F1A15   /* fast-schwarze, leicht grünstichige Tinte, Haupttext */
  ink-soft:     #47514B   /* Sekundärtext */
  line:         #E3E8E4   /* Hairline-Rahmen / Divider */
  accent:       #1F4A38   /* JÄGERGRÜN — der einzige Akzent */
  accent-hover: #183B2C
  accent-ink:   #FFFFFF   /* Text auf Jägergrün-Flächen */
```

- Body-Text: `ink` auf `paper` (WCAG AA erfüllt).
- Akzent (`accent`) nur für interaktive/hervorgehobene Elemente: Buttons, Überschriften-Akzente,
  Badges, Häkchen.
- Font: `Inter` als `--font-body` und `--font-display` (gleiche Familie, unterschiedliche Weights:
  Headings 600–700, Body 400–500). Große Type-Sprünge, `tracking-tight` auf Headings.

Type-Scale (Desktop):
```
hero-h1   clamp(2.5rem, 5vw, 4.25rem)  line-height 1.03  tracking -0.02em  weight 700
h2        clamp(1.75rem, 3vw, 2.5rem)  line-height 1.1   tracking -0.015em weight 700
h3        1.25rem                       line-height 1.25  weight 600
body      1.0625rem                     line-height 1.6   weight 400
small     0.9375rem                     line-height 1.5
```

---

## 4. Seitenaufbau (Briefing §2) — Reihenfolge exakt einhalten

### 4.1 Kopfbereich
- **Nur das Sonnenwerk-Logo, links.** Keine Navigation, keine Links, keine Ablenkung.

### 4.2 Hero-Bereich (sofort sichtbar, above the fold)
- Großes, cleanes Immobilien-Bild mit Solaranlage (kühle Lichtstimmung, moderne Architektur).
- **Überschrift (H1, wörtlich):**
  „Ihre Solaranlage. Mehrere Angebote. Eine Anfrage."
- **Unterzeile (wörtlich):**
  „Wir holen für Sie unterschiedliche Angebote von geprüften Fachbetrieben aus Ihrer Region ein –
  kostenlos, unverbindlich und innerhalb von 24–48 Stunden."
- **Direkt daneben (Desktop) bzw. darunter (Mobile): das Kontaktformular** (§6).
- **Trust-Elemente prominent im sichtbaren Bereich, direkt beim Formular** — der Kunde muss sie
  sehen, **bevor** er scrollt:
  - Button/Badge: **„Bereits über 780.000 Anfragen vermittelt"**
  - Badge: **„900 Fachpartner aus ganz Deutschland"**

> **MOBILE-FIRST-PFLICHT:** Auf dem Smartphone müssen **Formular und Trust-Elemente ohne Scrollen**
> erreichbar sein. Hero-Bild kompakt halten, Formular direkt in den ersten Viewport.

### 4.3 Highlights (ruhige Häkchen-Liste, KEINE Icon-Flut)
Genau diese fünf Punkte, als schlichte Checkmarks (Jägergrün-Haken):
- ✓ Wir holen mehrere, unterschiedliche Angebote von geprüften Fachbetrieben ein – der Kunde
  vergleicht und wählt das beste
- ✓ 100 % kostenlos und unverbindlich – keine versteckten Gebühren
- ✓ Angebote innerhalb von 24–48 Stunden
- ✓ Nur geprüfte, regionale Fachbetriebe
- ✓ Wir sind der beste Partner, weil wir dem Kunden die Arbeit abnehmen: Er stellt 1 Anfrage –
  wir besorgen ihm die Auswahl

### 4.4 Warum wir (kurzer Block)
Text (wörtlich):
„Sie müssen nicht selbst suchen, vergleichen und hinterhertelefonieren. Sie stellen eine Anfrage –
wir besorgen Ihnen die Auswahl. Mehrere, unterschiedliche Angebote von geprüften Fachbetrieben,
damit Sie das beste für Ihr Zuhause wählen können."

### 4.5 So funktioniert es (3 Schritte)
1. Formular ausfüllen – dauert nur 60 Sekunden
2. Fachpartner aus Ihrer Region meldet sich innerhalb von 24–48 Stunden
3. Angebote vergleichen und in Ruhe entscheiden

### 4.6 Fußbereich
- **Impressum** (§10, wörtlich) und **Datenschutzerklärung** (§11) verlinkt, plus dezenter Link
  **„Cookie-Einstellungen"** (öffnet das Consent-Banner erneut, §14). Sonst nichts.

---

## 5. Trust-Elemente (Briefing §3) — Pflicht

| Element | Text | Platzierung |
|---|---|---|
| Button/Badge | **780.000+** Anfragen bereits vermittelt | prominent, direkt beim Formular, above the fold |
| Badge | **900** Fachpartner aus ganz Deutschland | prominent, direkt beim Formular, above the fold |

Beide müssen im sichtbaren Bereich stehen, bevor gescrollt wird.

---

## 6. Kontaktformular — 10 Felder (Briefing §4) — exakt

Bewusst aufs Minimum reduziert, mobil-optimiert, maximale Abschlussquote. Alle Felder mit `*`
sind Pflicht. Reihenfolge und Beschriftung **exakt** wie folgt:

**PERSÖNLICHE DATEN**
1. **Vorname*** — Platzhalter/Beispiel: „Max"
2. **Name*** — Beispiel: „Mustermann"

**ADRESSE (wird validiert)**
3. **Straße*** — Beispiel: „Musterstraße"
4. **Hausnummer*** — Beispiel: „42"
5. **Postleitzahl*** — 5-stellig, Beispiel: „10115"
6. **Ort*** — Beispiel: „Berlin"

**KONTAKT (wird validiert)**
7. **Telefonnummer*** — Beispiel: „+49 30 123456789" — Hinweis: Fachpartner rufen zuerst an
8. **E-Mail-Adresse*** — Beispiel: „max@example.de" — für Bestätigung und Angebots-Zustellung

**QUALIFIZIERUNG**
9. **Sind Sie Hauseigentümer?*** — Auswahl: **Ja / Nein**
10. **Haben Sie Interesse an einem Solarangebot?*** — Auswahl: **Ja / Nein**

**Datenschutz-Häkchen (Pflichtfeld, unter den Feldern):**
„Ich stimme der Kontaktaufnahme durch Solarpartner zu und akzeptiere die Datenschutzerklärung."
→ Muss angehakt sein, sonst kein Absenden. „Datenschutzerklärung" verlinkt auf die DS-Seite.

**Newsletter-Opt-in (optional, KEIN Pflichtfeld):**
Checkbox: „Ja, ich möchte Tipps und Förder-Updates per Newsletter erhalten." (unangehakt als Default)

**Absende-Button (volle Breite, Jägergrün, abgerundete Ecken):**
Text: **„Jetzt kostenlos Angebote erhalten"**

**Direkt unter dem Button (kleine Häkchen-Zeile):**
✓ Völlig kostenlos ✓ Keine versteckten Gebühren ✓ Angebote in 24–48h

---

## 7. Validierung (Briefing §5 — Pflicht) — Format-Validierung

Client- und serverseitig via **Zod** (dasselbe Schema in beiden Richtungen verwenden):

- **Vorname / Name:** nicht leer, min. 2 Zeichen.
- **Straße:** nicht leer. **Hausnummer:** nicht leer.
- **Postleitzahl:** exakt **5 Ziffern** (`/^\d{5}$/`).
- **Ort:** nicht leer.
- **Telefonnummer:** Format-Validierung, deutsche/internationale Schreibweise zulassen
  (`/^[+]?[0-9\s\/()-]{6,20}$/`), führende `+49`/`0` erlaubt.
- **E-Mail-Adresse:** RFC-nahe E-Mail-Regex, valide Domain-Struktur.
- **Hauseigentümer / Solar-Interesse:** einer der Werte „Ja"/„Nein" muss gewählt sein.
- **Datenschutz-Checkbox:** muss `true` sein.

Fehlermeldungen deutsch, freundlich, direkt am Feld. Kein Absenden bei Fehlern.
Die Server-Route validiert **erneut** mit demselben Zod-Schema und lehnt ungültige Requests mit
Status 400 ab, bevor irgendeine E-Mail verschickt wird.

> Keine externen Validierungs-APIs (Google Address / Telefon-Lookup) — reine Format-Validierung
> nach obigen Regeln ist ausreichend.

---

## 8. Nach dem Absenden & E-Mail-Versand (eigenes Formular + Resend)

### 8.1 Erfolgs-Ansicht — eigene Route `/danke`
Nach erfolgreichem Submit **weiterleiten auf `/danke`** (eigene URL, nicht nur Inline-State) —
das ist die Conversion-Seite für Meta Ads (dort feuert das `Lead`-Event, siehe §15). Inhalt:
- ✓ Zusage: „Fachpartner in Ihrer Region kontaktiert Sie innerhalb von 24–48 Stunden."
- ✓ Bestätigung, dass die erfassten Daten übermittelt wurden (kurze Zusammenfassung der Eingabe).
- ✓ Hinweis auf die (bereits im Formular gewählte) Newsletter-Option — inkl. Satz, dass bei
  aktiviertem Newsletter noch eine **Bestätigungs-E-Mail** zum Abschluss der Anmeldung kommt (DOI).
- `/danke` ist `noindex` (nicht in Suchmaschinen), und ohne gültigen Submit sinnvoll abgesichert
  (z. B. kurzlebiges Flag/Query-Param) — kein direkter Deep-Link-Missbrauch für falsche Conversions.

### 8.2 E-Mail-Versand über Resend (eigene Server-Route, kein CRM)
- Der Submit ruft die Next.js **Server-Route** `app/api/lead/route.ts` (Node-Runtime, **nicht** Edge,
  da das Resend-SDK Node benötigt) auf. Ablauf in der Route:
  1. Body mit dem Zod-Schema aus §7 validieren (bei Fehler `400` zurückgeben).
  2. **Lead in Supabase speichern** (`leads`-Tabelle, siehe §17.3) — geht dem Mailversand voraus,
     damit kein Lead verloren geht.
  3. **Zwei E-Mails** über das `resend`-SDK versenden:
     - **A) Lead-Mail an den Empfänger** (das Unternehmen): enthält **alle** Formularfelder
       sauber formatiert (siehe Feldliste unten), `reply_to` = E-Mail-Adresse des Kunden, damit
       direkt geantwortet werden kann. Empfänger = `LEAD_RECIPIENT` (ENV).
     - **B) Bestätigungs-Mail an den Kunden** (an die im Formular angegebene E-Mail): freundliche
       Bestätigung mit den erfassten Daten und der 24–48-Stunden-Zusage. Absender = `MAIL_FROM` (ENV).
  4. Erfolg (`200 { ok: true }`), sobald der Lead gespeichert ist. Schlägt der Mailversand fehl,
     ist der Lead dank Schritt 2 trotzdem im Admin sichtbar — Fehler loggen, dem Nutzer eine
     freundliche „Bitte später erneut versuchen"-Meldung zeigen. Schlägt schon das Speichern fehl,
     `500` zurückgeben und nichts versenden.
- **Kein** CRM, **kein** Bitrix, **kein** n8n, **kein** Webhook. E-Mail ausschließlich über Resend,
  Speicherung ausschließlich in Supabase.
- `RESEND_API_KEY` und `SUPABASE_SERVICE_ROLE_KEY` niemals im Client verwenden — nur serverseitig.

> **Wichtig:** Die Lead-Zustellung (A + B) ist **unabhängig** vom Newsletter. Auch wenn der Kunde
> den Newsletter NICHT anhakt, werden A und B immer versendet. Der Newsletter-DOI (§8A) ist ein
> zusätzlicher, separater Schritt und darf den Lead-Versand nie blockieren.

### 8A. Newsletter Double-Opt-in (DOI) — vollständig über Resend

Rechtlich nötig, damit der Newsletter sauber ist. Ablauf **nur**, wenn `newsletter_opt_in === true`:

1. In der Lead-Route zusätzlich einen **Bestätigungs-Token** erzeugen: signiertes, ablaufendes
   Token (HMAC mit `DOI_SECRET`, Gültigkeit z. B. 7 Tage), das `email` + Timestamp enthält —
   **stateless**, keine Datenbank nötig (passt zum reinen Resend-Setup).
2. Über Resend eine **dritte E-Mail** an den Kunden senden (Betreff: „Bitte bestätigen Sie Ihre
   Newsletter-Anmeldung"): freundlicher Text + ein Button/Link auf
   `https://<domain>/api/newsletter/confirm?token=<TOKEN>`. Absender = `MAIL_FROM`.
   Klarer Hinweis: „Nur wenn Sie bestätigen, erhalten Sie unseren Newsletter."
3. **Verify-Route** `app/api/newsletter/confirm/route.ts` (GET): prüft Token (Signatur + Ablauf).
   - Gültig → Anmeldung bestätigt: eine Resend-**Benachrichtigung an `LEAD_RECIPIENT`**
     („Newsletter bestätigt: <email>"), damit das Unternehmen die bestätigte Anmeldung hat
     (= die „Liste" liegt so als bestätigte Mails im Empfänger-Postfach). Danach Redirect auf
     `/newsletter-bestaetigt` (kurze Bestätigungsseite, `noindex`).
   - Ungültig/abgelaufen → Redirect auf `/newsletter-link-ungueltig` mit Hinweis, erneut anzufragen.
4. **Nachweisbarkeit (Opt-in-Beleg):** In der DOI-Bestätigungs-E-Mail an den Empfänger Zeitpunkt
   der Anmeldung, Zeitpunkt der Bestätigung und die E-Mail protokollieren (für die DSGVO-Nachweispflicht).
5. Kein Double-Opt-in ohne Anhaken — ist die Checkbox leer, wird **keine** DOI-Mail erzeugt.

> Ergebnis: Anmeldung, Bestätigung und Beleg laufen zu 100 % über Resend, ohne Fremddienst und
> ohne Datenbank. `DOI_SECRET` kommt aus der ENV (§8.5).

### 8.3 Felder in der Lead-Mail an den Empfänger (vollständig, in dieser Reihenfolge)
```
Neue Solar-Anfrage über Sonnenwerk

Vorname:            <vorname>
Name:               <name>
Straße:             <strasse>
Hausnummer:         <hausnummer>
Postleitzahl:       <plz>
Ort:                <ort>
Telefonnummer:      <telefon>
E-Mail:             <email>
Hauseigentümer:     <Ja|Nein>
Solar-Interesse:    <Ja|Nein>
Newsletter:         <Ja|Nein>
Datenschutz:        akzeptiert
Eingegangen am:     <ISO-8601 / lokal formatiert>
Quelle:             Sonnenwerk-Landingpage
```
Als saubere HTML-Mail (Tabelle/Definitionsliste) **und** Text-Fallback (`text`-Feld) senden.

### 8.4 Betreffzeilen
- Lead-Mail an Empfänger: `Neue Solar-Anfrage – <Vorname> <Name>, <PLZ> <Ort>`
- Bestätigung an Kunde: `Ihre Anfrage bei Sonnenwerk ist eingegangen`
- Newsletter-DOI an Kunde: `Bitte bestätigen Sie Ihre Newsletter-Anmeldung`
- Newsletter bestätigt (an Empfänger): `Newsletter bestätigt – <email>`

### 8.5 Umgebungsvariablen — **eine** vollständige `.env.local` (+ identische `.env.example`)

Erzeuge **genau eine** `.env.local` mit **allen** Variablen des Projekts als **leere Platzhalter**
(Werte leer lassen — Enrico füllt sie später). Lege eine inhaltsgleiche `.env.example` als
eingecheckte Referenz an (`.env.local` selbst wird über `.gitignore` ausgeschlossen). Dies ist die
**einzige** ENV-Definition im Projekt — §16 und §17 verweisen hierauf, keine zweite Liste.

```dotenv
# ── E-Mail (Resend) ────────────────────────────────────────────────
# Server-seitig, niemals im Client
RESEND_API_KEY=
# Absenderadresse (muss zur in Resend verifizierten Domain gehören), z. B.:
# Sonnenwerk <anfrage@strom-distributor.de>
MAIL_FROM=
# Empfänger der Lead-Benachrichtigungen, z. B. office@strom-distributor.de
LEAD_RECIPIENT=

# ── Seite / Newsletter-DOI ─────────────────────────────────────────
# Öffentliche Basis-URL (für Links in E-Mails), z. B. https://sonnenwerk.de
NEXT_PUBLIC_SITE_URL=
# Langer Zufallswert zum Signieren der Double-Opt-in-Tokens
DOI_SECRET=

# ── Meta-Pixel (lädt erst nach Consent, §15) ───────────────────────
NEXT_PUBLIC_META_PIXEL_ID=

# ── Supabase (DB + Auth, EU-Region, §17) ───────────────────────────
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
# NUR serverseitig verwenden!
SUPABASE_SERVICE_ROLE_KEY=
# Initialer Admin-Zugang (Seed für Sebastian)
ADMIN_SEED_EMAIL=
ADMIN_SEED_PASSWORD=

# ── Optional: verteiltes Rate-Limiting (§16); leer = In-Memory-Fallback ─
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

> Alle Werte leer. Nichts vorbelegen, nichts erfinden. Die Beispiel-Adressen stehen nur als
> Kommentar dabei, damit Enrico weiß, was hineingehört. `MAIL_FROM`/`LEAD_RECIPIENT`/`NEXT_PUBLIC_SITE_URL`
> setzt Enrico je nach finaler Domain.

### 8.6 DNS / Resend-Setup (Teil der manuellen Schritte in `SETUP.md`)
Am Ende eine kurze `SETUP.md` erzeugen mit genau diesen Schritten:
1. Domain in Resend hinzufügen (`strom-distributor.de`).
2. Die von Resend angezeigten DNS-Einträge setzen: **SPF** (TXT), **DKIM** (CNAME/TXT, mehrere),
   sowie den empfohlenen **Return-Path/MX**-Eintrag. (Die konkreten Werte kommen aus dem Resend-
   Dashboard — nicht erfinden, nur als auszufüllende Platzhalter benennen.)
3. Optional **DMARC**-TXT-Eintrag für bessere Zustellbarkeit.
4. Nach Verifizierung: `RESEND_API_KEY`, `MAIL_FROM`, `LEAD_RECIPIENT` in den Deployment-ENV setzen.
> Sonst sind **keine** manuellen Schritte nötig — Formular und Versand laufen dann automatisch.

---

## 9. Weitere technische Anforderungen (Briefing §5)

- **Mobile first** — Formular + Trust-Elemente ohne Scrollen erreichbar (siehe §4.2).
- **Schnelle Ladezeit** — Bilder optimiert (`next/image`, moderne Formate, passende Größen),
  kein unnötiger Ballast, keine schweren Libraries.
- **Impressum und Datenschutzerklärung** im Fußbereich verlinkt (eigene Routen `/impressum`,
  `/datenschutz`).
- **Spam-Schutz** am Formular: unsichtbares Honeypot-Feld + einfache Zeitfalle (Submit unter
  ~2 Sekunden verwerfen). Kein externes Captcha nötig.
- Semantisches HTML, sichtbarer Keyboard-Focus (Focus-Ring in Jägergrün), `alt`-Texte,
  `prefers-reduced-motion` respektieren, Kontrast AA.
- Deutsche Copy: aktive Verben, saubere Satzzeichen, kein Denglisch.

---

## 10. Impressum (Briefing §7) — wörtlich in `/impressum`

**Angaben gemäß § 5 TMG**

Strom Distributor Vertriebs GmbH
Talstraße 28a
66424 Homburg / Saarland

**Vertreten durch den Geschäftsführer:** Florian Feit

**Kontakt**
E-Mail: office@strom-distributor.de
Telefon: 06024 – 3061638

**Eintragung im Handelsregister**
Registerort: Saarbrücken · Registernummer: HRB 103579

**Steuernummer**
040/120/53571 · Finanzamt Saarbrücken

---

## 11. Datenschutzerklärung — `/datenschutz`

Erstelle eine vollständige, DSGVO-konforme Datenschutzerklärung passend zu genau dieser Seite.
Inhaltlich abzudecken: Verantwortlicher (Angaben aus §10), Art der erhobenen Daten (die 10
Formularfelder + Newsletter-Opt-in), Zweck (Vermittlung an Solar-Fachpartner), Rechtsgrundlage
(Art. 6 Abs. 1 lit. a & b DSGVO — Einwilligung & Vertragsanbahnung), Weitergabe an Fachpartner,
Verarbeitung der Formular- und Versanddaten über den **E-Mail-Dienstleister Resend** (Resend, Inc.,
USA — als Auftragsverarbeiter; Hinweis auf Datenübermittlung in Drittland mit geeigneten Garantien),
Speicherdauer, Betroffenenrechte (Auskunft, Löschung, Widerruf), Newsletter-Widerruf, Kontakt für
Datenschutzanfragen (office@strom-distributor.de).

Zusätzlich abzudecken:
- **Newsletter / Double-Opt-in:** Erhebung der E-Mail, Bestätigungsverfahren, Protokollierung von
  An- und Bestätigungszeitpunkt als Nachweis, jederzeitiger Widerruf (Art. 6 Abs. 1 lit. a DSGVO).
- **Meta-Pixel / Meta Ads:** Nutzung des Meta-Pixels (Meta Platforms Ireland Ltd.), Zweck
  (Conversion-Messung/Reichweite), Rechtsgrundlage **Einwilligung** (Art. 6 Abs. 1 lit. a DSGVO)
  über das Consent-Banner, Widerruf über „Cookie-Einstellungen", Hinweis auf Datenübermittlung an Meta
  (auch USA) mit geeigneten Garantien.
- **Cookies/Einwilligung:** notwendige vs. Marketing-Cookies, Speicherdauer des Consent-Cookies,
  Widerrufsmöglichkeit.

- **Speicherung / Admin:** Leads werden bei **Supabase** (Datenbank & Login, EU-Region) als
  Auftragsverarbeiter gespeichert und in einem zugangsgeschützten internen Bereich verarbeitet.
  Zweck: Bearbeitung und Nachverfolgung der Anfragen. Rechtsgrundlage Art. 6 Abs. 1 lit. b/f DSGVO.

Klare, verständliche Sprache. Als externe Dienstleister/Empfänger **nur** nennen: **Resend**
(E-Mail), **Supabase** (Datenspeicherung/Login) und **Meta** (Pixel/Ads). Kein Bitrix, kein n8n,
keine sonst erfundenen Dienste.

---

## 12. Assets

- Hero-/Immobilienbild: cleane moderne Architektur mit integrierter Solaranlage, kühle
  Lichtstimmung. (Optimiertes Platzhalter-Bild einsetzen und im Code klar als austauschbar
  markieren — Enrico liefert finale Bilder separat.)
- **Logo:** Sonnenwerk-Logo (Variante „aufgehende Sonne", Jägergrün + Weiß) wird als SVG geliefert.
  Dateien: `sonnenwerk-lockup-hell.svg` (Header auf Weiß), `sonnenwerk-lockup-dunkel.svg`
  (auf Jägergrün, z. B. Footer), `sonnenwerk-icon-gruen.svg` / `-weiss.svg` (reines Icon),
  `sonnenwerk-appicon-gruen.svg` / `-weiss.svg` (Favicon/App-Icon). Logo links im Header einbinden,
  Icon-Variante als Favicon verwenden. Slogan des Logos: „Geprüfte Solar-Angebote aus Ihrer Region."

---

## 13. Abnahme-Checkliste (vor „fertig")

- [ ] Marke durchgängig „Sonnenwerk", Slogan korrekt.
- [ ] Nur Jägergrün + Weiß, ein Akzentton, viel Weißraum, clean/Apple-like.
- [ ] Header: nur Logo links, keine Navigation.
- [ ] Hero: H1 + Unterzeile wörtlich, Bild, Formular daneben/darunter.
- [ ] Beide Trust-Elemente (780.000+ / 900 Fachpartner) above the fold beim Formular.
- [ ] Mobile: Formular + Trust ohne Scrollen sichtbar.
- [ ] Alle 10 Felder in exakter Reihenfolge & Beschriftung, Beispiele als Platzhalter.
- [ ] Datenschutz-Checkbox als Pflichtfeld, Newsletter-Checkbox optional.
- [ ] Button-Text „Jetzt kostenlos Angebote erhalten", Häkchen-Zeile darunter.
- [ ] Validierung client- UND serverseitig (gleiches Zod-Schema): PLZ 5-stellig, Telefon & E-Mail Regex.
- [ ] Erfolg → eigene Route `/danke` (noindex), mit 24–48h-Zusage + Datenzusammenfassung + Newsletter-Hinweis.
- [ ] Submit → `app/api/lead/route.ts` → Resend: Lead-Mail an Empfänger (reply_to = Kunde)
      + Bestätigungsmail an Kunde. Kein CRM/Bitrix/n8n/Webhook.
- [ ] Newsletter-DOI vollständig über Resend: Token-Mail → `/api/newsletter/confirm` → Beleg an Empfänger.
      Lead-Versand läuft unabhängig davon, auch ohne Newsletter-Haken.
- [ ] Cookie-/Consent-Banner: „Akzeptieren"/„Ablehnen" gleichwertig, Marketing default AUS,
      Footer-Link „Cookie-Einstellungen", Auswahl gespeichert.
- [ ] Meta-Pixel lädt NUR nach Consent; `PageView` nach Consent, `Lead`-Event genau einmal auf `/danke`.
- [ ] Rate-Limiting auf `lead` und `newsletter/confirm` (In-Memory-Default, Upstash per ENV zuschaltbar), 429 bei Missbrauch.
- [ ] `RESEND_API_KEY` / `DOI_SECRET` nur serverseitig, nie im Client.
- [ ] Honeypot + Zeitfalle als Spam-Schutz aktiv.
- [ ] Highlights (5 Punkte), Warum-wir, 3-Schritte — Texte wörtlich.
- [ ] Footer: Impressum + Datenschutz + „Cookie-Einstellungen" verlinkt, sonst nichts.
- [ ] `/impressum` wörtlich, `/datenschutz` vollständig (Resend + Meta als Empfänger genannt).
- [ ] **Eine** `.env.local` (+ `.env.example`) nach §8.5 mit ALLEN Variablen als **leere** Platzhalter;
      keine echten Keys; `.env.local` in `.gitignore`. `npm run build` läuft auch mit leeren Werten.
- [ ] `SETUP.md` mit DNS-/Resend-Schritten, Supabase-Setup (Projekt, EU-Region, Migrationen, Seed)
      UND Reihenfolge (Domain verifizieren → Supabase anlegen → ENV setzen → Pixel-ID eintragen).
- [ ] Lead-Route speichert in Supabase (`leads`) VOR dem Mailversand; Lead überlebt Mail-Fehler.
- [ ] `/admin`: Login + Registrierung nur mit gültigem, einmaligem Einladungscode; kein offenes Signup.
- [ ] Sebastian als `admin` per Seed; Partner registrieren sich per Code. Alle registrierten sehen alle Leads.
- [ ] Admin-UI: Lead-Liste (neueste zuerst), Suche/Filter, Detailansicht, CSV-Export, Einladungen (nur admin).
- [ ] RLS aktiv; Service-Role-Key nur serverseitig; `/admin/*` noindex und ohne Pixel.
- [ ] Rate-Limiting auch auf Login-/Registrierungs-Routen.
- [ ] Logo-SVGs eingebunden (Header hell, Footer dunkel), Icon als Favicon.
- [ ] Ladezeit optimiert, AA-Kontrast, Keyboard-Focus, reduced-motion.

---

## 14. Cookie-/Consent-Banner (Pflicht — Seite läuft über Meta Ads)

Da über **Meta Ads** ausgespielt wird und ein **Meta-Pixel** (§15) gesetzt wird, ist ein
Consent-Banner nach TDDDG/DSGVO Pflicht. Anforderungen:

- **Opt-in vor Tracking:** Der Meta-Pixel und alle nicht zwingend nötigen Skripte laden **erst
  nach aktiver Einwilligung**. Kein Pixel-Load beim ersten Seitenaufruf ohne Zustimmung.
- **Gleichwertige Buttons:** „Alle akzeptieren" und „Ablehnen" gleich prominent (gleiche Größe/
  Gewichtung, keine Dark Patterns). Optional „Einstellungen" für die Kategorien.
- **Kategorien:** „Notwendig" (immer an, nicht abwählbar — Formularfunktion, Consent-Speicherung)
  und „Marketing" (Meta-Pixel, standardmäßig AUS).
- **Speicherung:** Auswahl in einem First-Party-Cookie (z. B. `sw_consent`, Laufzeit 6 Monate)
  + im `localStorage`. Consent-Status global lesbar (z. B. React Context) machen, damit §15 daran hängt.
- **Widerruf jederzeit:** dezenter Link im Footer „Cookie-Einstellungen", der das Banner erneut öffnet.
  Bei Widerruf Marketing-Cookies löschen und Pixel nicht mehr laden.
- **Stil:** dezent, im Jägergrün/Weiß-System, ruhig, nicht bildschirmfüllend — passt zum Apple-clean-Look.
- **Umsetzung:** leichtgewichtig selbst gebaut (kein schwergewichtiges CMP nötig). Wenn ein fertiges
  CMP gewünscht ist, ist das später austauschbar — die Consent-Logik so kapseln, dass §15 nur den
  Status „Marketing erlaubt: ja/nein" abfragt.

---

## 15. Meta-Pixel (sauber & consent-gated)

- Pixel-ID aus `NEXT_PUBLIC_META_PIXEL_ID`. **Nur laden, wenn Consent „Marketing" = true** (§14).
- Einbindung über `next/script` mit `strategy="afterInteractive"`, aber **erst gerendert, nachdem
  der Consent gesetzt wurde** — nicht schon im initialen HTML feuern.
- **Events:**
  - `PageView` — nach Consent auf allen Seiten.
  - `Lead` — **genau einmal** auf der `/danke`-Seite (echte Conversion nach erfolgreichem Submit),
    nicht schon beim Klick auf den Button. So zählt Meta nur tatsächlich abgeschickte Anfragen.
- **Kein** Versand personenbezogener Formularinhalte an Meta (keine Advanced Matching mit
  Klartextdaten ohne gesonderte Rechtsgrundlage). Nur das Standard-`Lead`-Event.
- **Optional vorbereitet (aus, per ENV aktivierbar):** Meta **Conversions API (CAPI)** serverseitig
  als späteres Upgrade — nur als klar markierter, deaktivierter Slot. Standard bleibt der Browser-Pixel.
- Datenschutzerklärung muss den Pixel + Meta als Empfänger nennen (§11).

---

## 16. Rate-Limiting & Missbrauchsschutz (API-Routen)

Gilt für `app/api/lead/route.ts` und `app/api/newsletter/confirm/route.ts`:

- **IP-basiertes Rate-Limit:** z. B. max. 5 Submits pro IP / 10 Minuten und ein Tages-Cap.
  Bei Überschreitung `429 Too Many Requests` mit freundlicher Meldung.
- **Umsetzung ohne Zusatzkosten wenn möglich:** In-Memory-Limiter (LRU/Map mit Zeitfenster) als
  Default. Slot für **Upstash Ratelimit** (Redis) vorsehen und per ENV (`UPSTASH_REDIS_REST_URL`,
  `UPSTASH_REDIS_REST_TOKEN`) aktivierbar machen — für Serverless/Multi-Instanz-Betrieb (Vercel),
  wo In-Memory nicht instanzübergreifend hält. Wenn ENV leer → In-Memory-Fallback, kein Fehler.
- **Zusätzlich:** Honeypot + Zeitfalle (aus §9) bleiben aktiv. Request-Größe begrenzen,
  Content-Type prüfen, nur `POST` erlauben.
- Rate-Limit-Treffer serverseitig loggen (zur Missbrauchserkennung), aber ohne personenbezogene Daten.

Die Variablen `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` sind bereits in der
konsolidierten `.env.local` (§8.5) enthalten — keine zweite ENV-Liste anlegen.

---

## 17. Admin-Bereich `/admin` (Supabase — DB + Auth)

Zusätzlich zum E-Mail-Versand werden **alle Leads persistent gespeichert** und in einem
geschützten Admin-Bereich gebündelt angezeigt. So gehen Leads nie verloren, auch wenn eine
E-Mail übersehen wird.

### 17.1 Stack & Grundsatz
- **Supabase** als Datenbank **und** Auth (schlankste Lösung). EU-Region wählen (DSGVO).
- Supabase-Zugriff **nur serverseitig** über den Service-Role-Key in Server-Routes/Server-Components.
  Der `anon`-Key darf clientseitig nur für Auth-Flows genutzt werden. **Service-Role-Key niemals
  an den Client geben.**
- **Row Level Security (RLS)** auf allen Tabellen aktiv.

### 17.2 Datenmodell (Supabase)
- `leads` — ein Datensatz pro Anfrage. Spalten (snake_case): `id` (uuid), `vorname`, `name`,
  `strasse`, `hausnummer`, `plz`, `ort`, `telefon`, `email`, `hauseigentuemer` (bool/enum),
  `solar_interesse` (bool/enum), `newsletter_opt_in` (bool), `newsletter_confirmed` (bool, default false),
  `datenschutz_akzeptiert` (bool), `quelle` (text), `created_at` (timestamptz, default now()).
- `invite_codes` — `code` (text, unique), `email` (optional, an wen vergeben), `used_by` (uuid, null),
  `used_at` (timestamptz, null), `created_at`. Einmal-Codes: nach Registrierung als verbraucht markiert.
- `profiles` — `id` (= auth.user id), `email`, `role` (`admin` | `partner`), `created_at`.
  Rolle `admin` = Sebastian, `partner` = seine Kunden.
- **RLS-Policies:**
  - `leads`: SELECT nur für eingeloggte Nutzer mit gültigem Profil (admin ODER partner) —
    **alle registrierten sehen alle Leads** (keine Zuteilung, so gewünscht). INSERT ausschließlich
    serverseitig über Service-Role (die Lead-Route), **nicht** durch Clients.
  - `invite_codes` / `profiles`: nur admin darf lesen/verwalten; normale Partner nur ihr eigenes Profil.

### 17.3 Lead-Speicherung (Ergänzung zu §8.2)
Die Route `app/api/lead/route.ts` schreibt den validierten Lead **zuerst in Supabase** (`leads`)
und versendet **danach** die Resend-Mails.
- Reihenfolge robust: Gelingt der DB-Insert, aber der Mailversand schlägt fehl → Lead ist trotzdem
  gesichert (im Admin sichtbar), Fehler loggen, dem Nutzer freundliche Fehlermeldung. Gelingt der
  Insert nicht → `500`, nichts versenden, Nutzer um erneuten Versuch bitten.
- `newsletter_confirmed` wird durch die DOI-Verify-Route (§8A) auf `true` gesetzt (Lookup per E-Mail).

### 17.4 Zugang & Registrierung (fester Zugang + Einladungscode, einmalig)
- **Kein offenes Signup.** Registrierung nur mit gültigem **Einladungscode** aus `invite_codes`.
- Flow `/admin` (nicht eingeloggt) → Login. Zusätzlich `/admin/registrieren`:
  1. Nutzer gibt Einladungscode + E-Mail + Passwort ein.
  2. Server prüft: Code existiert und ist unbenutzt. Wenn ungültig/verbraucht → klare Fehlermeldung.
  3. Gültig → Supabase-Auth-User anlegen, `profiles`-Eintrag mit passender Rolle, Code als
     `used_by`/`used_at` markieren (einmalig verbraucht).
- **Sebastian (admin)** wird initial per **Seed** angelegt (siehe §17.6) — sein Zugang ist der
  „feste Zugang". Weitere Partner registrieren sich selbst per Code, den Sebastian im Admin erzeugt.
- Passwörter: ausschließlich über Supabase Auth (kein Eigenbau). Login mit E-Mail + Passwort.
  Passwort-Reset über Supabase-Standard (Reset-Mail kann über Supabase laufen).
- Sinnvolle Session-Dauer, Logout-Button, alle `/admin`-Seiten nur mit gültiger Session
  (Middleware/Server-seitiger Guard, Redirect auf Login).

### 17.5 Admin-UI (`/admin`) — im Jägergrün/Weiß-System, clean
- **Lead-Liste:** Tabelle aller Leads, neueste zuerst. Spalten: Datum, Name, PLZ/Ort, Telefon,
  E-Mail, Hauseigentümer, Solar-Interesse, Newsletter (bestätigt/offen).
- **Suche & Filter:** Freitextsuche (Name/Ort/PLZ/E-Mail), Filter nach Zeitraum und
  Hauseigentümer/Solar-Interesse. Sortierbar nach Datum.
- **Detailansicht** pro Lead mit allen Feldern; `tel:`- und `mailto:`-Links für schnellen Kontakt.
- **CSV-Export** der (gefilterten) Leads.
- **Nur für admin (Sebastian):** Bereich „Einladungen" — neuen Einladungscode erzeugen (optional an
  E-Mail gebunden), Liste offener/verbrauchter Codes, Partner-Übersicht.
- Reduziert, schnell, mobil bedienbar. Kein Fremd-Framework nötig; Tabelle sauber und ruhig halten.
- `/admin/*` ist `noindex` und von Meta-Pixel/Tracking ausgenommen.

### 17.6 ENV & Seed
Die Supabase- und Admin-Seed-Variablen (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_SEED_EMAIL`, `ADMIN_SEED_PASSWORD`) sind bereits in der
konsolidierten `.env.local` (§8.5) enthalten — keine zweite ENV-Liste anlegen.
- Ein **Seed-Skript** (oder SQL-Migration) mitliefern, das: die Tabellen + RLS-Policies anlegt,
  Sebastian als `admin` anlegt (aus `ADMIN_SEED_*`) und einen ersten Einladungscode erzeugt.
  Das Skript wird **nicht** automatisch ausgeführt — Enrico startet es später mit seinen echten
  Supabase-Werten (Anleitung dazu in `SETUP.md`).
- Migrationen als SQL im Repo ablegen (`/supabase/migrations` o. ä.), damit alles reproduzierbar ist.

### 17.7 Sicherheit
- Rate-Limiting (§16) auch auf Login- und Registrierungs-Routen (Brute-Force-Schutz), 429 bei Missbrauch.
- Keine Lead-Daten in Client-Bundles; Admin-Daten nur über server-seitig geschützte Abfragen.
- Fehlermeldungen bei Login/Registrierung generisch halten (keine Hinweise, ob E-Mail existiert).

---

## 18. Bau-Reihenfolge (in dieser Phasenfolge umsetzen)

Baue schrittweise. Nach **jeder** Phase muss `npm run build` fehlerfrei sein und das bis dahin
Gebaute funktionieren (mit leeren ENV kein Crash). Nicht alles in einem Rutsch.

- **Phase 1 – Grundgerüst & Landingpage (statisch):** Next.js-Projekt, Tailwind-Tokens (§3),
  Inter-Font, Logo im Header, komplette Landingpage-Struktur mit allen Texten und Sektionen
  (§4–§5), Impressum (§10) und Datenschutz-Seitengerüst (§11). Noch ohne Formular-Logik.
- **Phase 2 – Formular + Validierung:** 10-Felder-Formular (§6), Zod-Schema (§7) client- und
  serverseitig, Honeypot + Zeitfalle, Fehler-/Ladezustände, `/danke`-Seite (§8.1). Submit-Route
  existiert, schreibt aber zunächst nur einen validierten Response (noch ohne Mail/DB).
- **Phase 3 – E-Mail via Resend:** Lead-Mail + Kundenbestätigung (§8.2–§8.4) und
  Newsletter-Double-Opt-in (§8A). Bei leeren ENV: Feature inaktiv, sauberer Fehler, kein Crash.
- **Phase 4 – Consent & Meta-Pixel:** Cookie-Banner (§14), consent-gateter Pixel mit `Lead`-Event
  auf `/danke` (§15).
- **Phase 5 – Supabase & Admin:** DB-Schema + RLS + Migrationen, Lead-Insert in der Route (§8.2/§17.3),
  `/admin` mit Login, Einladungscode-Registrierung, Lead-Liste/Detail/Export, Einladungsverwaltung
  (§17). Seed-Skript bereitstellen (nicht ausführen).
- **Phase 6 – Rate-Limiting & Feinschliff:** Rate-Limiting auf allen schreibenden Routen + Login
  (§16), Ladezeit-/A11y-Feinschliff, `SETUP.md` und `README.md` finalisieren.

---

## 19. Selbst-Check vor „fertig" (Claude Code hakt das selbst ab)

Am Ende ausführen und im Chat kurz bestätigen:

- [ ] `npm install` sauber, `npm run build` **erfolgreich** — auch mit komplett leeren ENV-Werten.
- [ ] `npm run dev` startet, Startseite + `/danke` + `/impressum` + `/datenschutz` + `/admin`
      (Login-Screen) sind erreichbar, keine Laufzeit-Crashes bei leeren ENV.
- [ ] `.env.local` + `.env.example` vorhanden, **alle** Variablen aus §8.5 als leere Platzhalter,
      keine echten Secrets im Repo, `.env.local` durch `.gitignore` ausgeschlossen.
- [ ] Keine hartkodierten Keys/URLs; alles über ENV. Service-Role-Key & `RESEND_API_KEY`
      werden nirgends im Client-Bundle referenziert.
- [ ] Projekt ist unverändert auf Vercel deploybar (keine Sonderkonfiguration nötig).
- [ ] `SETUP.md` listet alle manuellen Schritte für Enrico (Domain/Resend/DNS, Supabase-Projekt +
      Migration/Seed, Meta-Pixel-ID, ENV in Vercel eintragen) — als To-do, **nicht** ausgeführt.
- [ ] `README.md` mit lokalem Start (install → `.env.local` befüllen → `dev`) vorhanden.
- [ ] Abnahme-Checkliste §13 vollständig erfüllt.

> Erst wenn alle Haken sitzen, gilt das Projekt als fertig. Alles, was echte Keys/Konten braucht,
> bleibt bewusst offen und ist in `SETUP.md` dokumentiert.
