-- REVIEW ONLY: do not apply to production without explicit release approval.
-- Based on live catalog inspected 2026-10-28 (America/Monterrey).
begin;

alter table public.checkout_sessions enable row level security;
alter table public.outbox_emails enable row level security;
alter table public.admin_notifications_log enable row level security;
revoke all on public.checkout_sessions, public.outbox_emails, public.admin_notifications_log,
  public.purchases, public.legal_consents, public.security_audit_log from anon, authenticated;
revoke all on public.sales_dashboard from public, anon, authenticated;
alter view public.sales_dashboard set (security_invoker = true);

-- The invoker view needs SELECT on its underlying table, protected by RLS.
grant select on public.entitlements to authenticated;
alter view public.my_entitlements set (security_invoker = true);
revoke all on public.my_entitlements from public, anon;
grant select on public.my_entitlements to authenticated;

-- Internal RPCs must never be callable by a browser. Preserve service-role jobs.
do $$ declare f record; begin
  for f in select p.oid::regprocedure as signature from pg_proc p
    join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.prokind='f' and
      (p.prosecdef or p.proname in ('log_notification_if_not_exists','enqueue_welcome_email','sync_purchase_email_from_session'))
  loop
    execute format('revoke execute on function %s from public, anon, authenticated', f.signature);
    execute format('grant execute on function %s to service_role', f.signature);
    execute format('alter function %s set search_path = public, pg_temp', f.signature);
  end loop;
end $$;

-- New state is per account and supports returns from another device.
create table if not exists public.program_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  planner jsonb not null default '{}'::jsonb,
  gym jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.program_state enable row level security;
revoke all on public.program_state from public, anon, authenticated;
grant select, insert, update on public.program_state to authenticated;
create policy program_state_owner on public.program_state for all to authenticated
  using ((select auth.uid()) = user_id and exists (
    select 1 from public.entitlements e where e.status='active' and e.product_id='programa-completo'
      and (e.user_id=(select auth.uid()) or e.email=(select auth.jwt()->>'email'))))
  with check ((select auth.uid()) = user_id and exists (
    select 1 from public.entitlements e where e.status='active' and e.product_id='programa-completo'
      and (e.user_id=(select auth.uid()) or e.email=(select auth.jwt()->>'email'))));

create or replace function public.save_program_state(p_section text, p_value jsonb)
returns void language plpgsql security invoker set search_path = public, pg_temp as $$
begin
  if auth.uid() is null or p_section not in ('planner','gym') or jsonb_typeof(p_value) <> 'object'
     or octet_length(p_value::text)>200000 then raise exception 'Invalid state'; end if;
  if p_section='planner' then
    insert into public.program_state(user_id,planner) values(auth.uid(),p_value)
    on conflict(user_id) do update set planner=excluded.planner,updated_at=now();
  else
    insert into public.program_state(user_id,gym) values(auth.uid(),p_value)
    on conflict(user_id) do update set gym=excluded.gym,updated_at=now();
  end if;
end $$;
revoke all on function public.save_program_state(text,jsonb) from public,anon;
grant execute on function public.save_program_state(text,jsonb) to authenticated;

-- Serialize confirmation and never grant access based only on a session UUID.
-- The edge handler first validates payment with Mercado Pago and a browser-only token.
create or replace function public.update_checkout_email_final(p_session_id text,p_email text)
returns void language plpgsql security invoker set search_path = public, pg_temp as $$
declare s public.checkout_sessions%rowtype; p public.purchases%rowtype;
  v_email text := lower(trim(p_email)); v_product text; v_template text;
begin
  if v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' or length(v_email)>254 then
    raise exception 'Invalid email'; end if;
  select * into s from public.checkout_sessions where id=p_session_id::uuid for update;
  if not found then raise exception 'Session not found'; end if;
  select * into p from public.purchases where session_id=p_session_id and status='approved'
    order by created_at desc limit 1 for update;
  if not found then raise exception 'Approved payment required'; end if;
  v_product := s.raw_mp->>'requested_product';
  if v_product not in ('kit-7-dias','programa-completo') then raise exception 'Unknown product'; end if;
  if s.email_final is not null and lower(s.email_final)<>v_email then
    raise exception 'Email already confirmed; contact support'; end if;
  update public.checkout_sessions set email_final=v_email,updated_at=now()
    where id=s.id;
  update public.purchases set email=v_email where id=p.id;
  insert into public.entitlements(email,product_id,status,purchase_id)
    values(v_email,v_product,'active',p.id)
    on conflict(email,product_id) do update set status='active',purchase_id=excluded.purchase_id,updated_at=now();
  v_template := case when v_product='programa-completo' then 'welcome-program' else 'welcome-kit' end;
  insert into public.outbox_emails(to_email,template,payload,status)
    values(v_email,v_template,jsonb_build_object('purchase_id',p.provider_payment_id,
      'session_id',s.id,'customer_email',v_email),'queued')
    on conflict ((payload->>'purchase_id'),template) do nothing;
end $$;
revoke all on function public.update_checkout_email_final(text,text) from public,anon,authenticated;
grant execute on function public.update_checkout_email_final(text,text) to service_role;

-- Only service role calls this after fetching the current payment from MP.
create or replace function public.record_verified_payment(p_session_id text, p_payment jsonb)
returns void language plpgsql security invoker set search_path = public, pg_temp as $$
declare s public.checkout_sessions%rowtype; v_product text; v_price numeric; v_id uuid;
begin
  select * into s from public.checkout_sessions where id=p_session_id::uuid for update;
  if not found then raise exception 'Unknown session'; end if;
  v_product := s.raw_mp->>'requested_product';
  v_price := case v_product when 'kit-7-dias' then 139 when 'programa-completo' then 1299 else null end;
  if v_price is null or p_payment->>'external_reference' is distinct from p_session_id
    or (p_payment->>'transaction_amount')::numeric is distinct from v_price
    or p_payment->>'currency_id' is distinct from 'MXN'
    or p_payment->'metadata'->>'product_type' is distinct from v_product
    or coalesce(p_payment->>'id','') !~ '^[0-9]+$' then raise exception 'Payment mismatch'; end if;
  -- A second attempt cannot overwrite an already approved purchase in this session.
  if exists(select 1 from public.purchases where session_id=p_session_id and status='approved'
      and provider_payment_id<>p_payment->>'id') then raise exception 'Duplicate payment needs review'; end if;
  insert into public.purchases(provider,provider_payment_id,session_id,product_id,status,email,meta)
    values('mercadopago',p_payment->>'id',p_session_id,v_product,p_payment->>'status',s.email_final,p_payment)
    on conflict(session_id) do update set provider_payment_id=excluded.provider_payment_id,
      status=excluded.status,meta=excluded.meta,product_id=excluded.product_id
    returning id into v_id;
  update public.checkout_sessions set payment_id=p_payment->>'id',status=p_payment->>'status',updated_at=now()
    where id=s.id;
  if p_payment->>'status'='approved' and s.email_final is not null then
    perform public.update_checkout_email_final(p_session_id,s.email_final);
  elsif p_payment->>'status' in ('refunded','charged_back','cancelled','rejected') then
    update public.entitlements set status='revoked',updated_at=now() where purchase_id=v_id;
  end if;
end $$;
revoke all on function public.record_verified_payment(text,jsonb) from public,anon,authenticated;
grant execute on function public.record_verified_payment(text,jsonb) to service_role;

-- Avoid casting historical free-text session IDs across the entire purchases table.
create or replace function public.sync_purchase_email_from_session()
returns trigger language plpgsql security invoker set search_path = public, pg_temp as $$
begin
  if new.email_final is not null then
    update public.purchases set email=new.email_final where session_id=new.id::text
      and (email is null or email='' or email like '%@testuser.com%');
  end if;
  return new;
end $$;
revoke all on function public.sync_purchase_email_from_session() from public,anon,authenticated;
grant execute on function public.sync_purchase_email_from_session() to service_role;

-- Jobs are claimed atomically; attempts are bounded; ambiguous delivery must be reconciled.
create or replace function public.claim_email_jobs()
returns setof public.outbox_emails language sql security invoker set search_path = public, pg_temp as $$
  update public.outbox_emails set status='processing',attempts=attempts+1,updated_at=now()
  where id in (select id from public.outbox_emails where status in ('queued','failed') and attempts<5
    and (attempts=0 or updated_at < now()-interval '5 minutes')
    order by created_at for update skip locked limit 5) returning *;
$$;
revoke all on function public.claim_email_jobs() from public,anon,authenticated;
grant execute on function public.claim_email_jobs() to service_role;
commit;
