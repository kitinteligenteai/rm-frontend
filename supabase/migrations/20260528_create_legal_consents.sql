-- 20260528_create_legal_consents.sql
-- Reinicio Metabólico — consentimiento legal trazable
-- Nota: esta tabla fue creada primero en Supabase producción el 2026-05-28.
-- Este archivo documenta y versiona el cambio en el repositorio.

create table if not exists public.legal_consents (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null,
  product_id text not null,
  email text,
  terms_version text not null,
  privacy_version text not null,
  refunds_version text not null,
  consented_at timestamptz not null default now(),
  ip_hash text,
  user_agent text,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.legal_consents enable row level security;

revoke all on table public.legal_consents from anon, authenticated;

grant select, insert, update, delete on table public.legal_consents to service_role;

create index if not exists idx_legal_consents_session_id
on public.legal_consents(session_id);

create index if not exists idx_legal_consents_email
on public.legal_consents(email);

create index if not exists idx_legal_consents_product_id
on public.legal_consents(product_id);