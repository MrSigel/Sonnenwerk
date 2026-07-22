-- ============================================================================
-- Sonnenwerk – Datenmodell & RLS (§17.2)
-- Reproduzierbare Migration. Wird NICHT automatisch ausgeführt — Enrico startet
-- sie später im Supabase-SQL-Editor (Anleitung: SETUP.md).
-- ============================================================================

-- Extensions -----------------------------------------------------------------
create extension if not exists "pgcrypto";

-- Rollen-Enum ----------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('admin', 'partner');
  end if;
end $$;

-- Tabelle: profiles ----------------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  role       public.user_role not null default 'partner',
  created_at timestamptz not null default now()
);

-- Tabelle: leads -------------------------------------------------------------
create table if not exists public.leads (
  id                     uuid primary key default gen_random_uuid(),
  vorname                text not null,
  name                   text not null,
  strasse                text not null,
  hausnummer             text not null,
  plz                    text not null,
  ort                    text not null,
  telefon                text not null,
  email                  text not null,
  hauseigentuemer        boolean not null,
  solar_interesse        boolean not null,
  newsletter_opt_in      boolean not null default false,
  newsletter_confirmed   boolean not null default false,
  datenschutz_akzeptiert boolean not null default true,
  quelle                 text not null default 'Sonnenwerk-Landingpage',
  created_at             timestamptz not null default now()
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_email_idx on public.leads (lower(email));
create index if not exists leads_plz_idx on public.leads (plz);

-- Tabelle: invite_codes ------------------------------------------------------
create table if not exists public.invite_codes (
  id         uuid primary key default gen_random_uuid(),
  code       text not null unique,
  email      text,
  role       public.user_role not null default 'partner',
  used_by    uuid references auth.users (id) on delete set null,
  used_at    timestamptz,
  created_at timestamptz not null default now()
);

-- Hilfsfunktion: ist der aktuelle Nutzer Admin? ------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

-- Hilfsfunktion: hat der aktuelle Nutzer überhaupt ein Profil? ---------------
create or replace function public.is_registered()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p where p.id = auth.uid()
  );
$$;

-- ============================================================================
-- Row Level Security (§17.2)
-- ============================================================================
alter table public.leads        enable row level security;
alter table public.invite_codes enable row level security;
alter table public.profiles     enable row level security;

-- leads: alle registrierten Nutzer (admin ODER partner) sehen ALLE Leads.
--        INSERT/UPDATE ausschließlich serverseitig via Service-Role (umgeht RLS).
drop policy if exists "leads_select_registered" on public.leads;
create policy "leads_select_registered"
  on public.leads for select
  to authenticated
  using (public.is_registered());

-- profiles: eigenes Profil lesbar; Admin darf alle lesen/verwalten.
drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_admin_all"
  on public.profiles for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- invite_codes: nur Admin darf lesen/verwalten (Erstellung/Verbrauch serverseitig).
drop policy if exists "invites_admin_all" on public.invite_codes;
create policy "invites_admin_all"
  on public.invite_codes for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Hinweis: Der Service-Role-Key (nur serverseitig, §17.1) umgeht RLS und wird
-- für Lead-Insert, Registrierung (Code prüfen/verbrauchen) und Seed genutzt.
