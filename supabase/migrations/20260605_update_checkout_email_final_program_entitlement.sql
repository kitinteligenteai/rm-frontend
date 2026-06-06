-- 20260605_update_checkout_email_final_program_entitlement.sql
-- Reinicio Metabolico
-- Objetivo:
-- - Mantener flujo Kit: welcome-kit.
-- - Mantener flujo Programa: welcome-program.
-- - Crear/actualizar entitlement active para programa-completo.
-- - Evitar duplicar correos por session_id/template.
-- - Evitar duplicar entitlement por email/product_id.

create or replace function public.update_checkout_email_final(
  p_session_id text,
  p_email text
)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_email text := lower(trim(p_email));
  v_product_id text;
  v_purchase_id uuid;
begin
  -- 1. Actualizar checkout
  update public.checkout_sessions
  set email_final = v_email,
      updated_at = now()
  where id = p_session_id::uuid;

  -- 2. Detectar producto y compra
  select p.product_id, p.id
    into v_product_id, v_purchase_id
  from public.purchases p
  where p.session_id = p_session_id
  order by p.created_at desc
  limit 1;

  -- 3. Actualizar purchase con email final
  update public.purchases
  set email = v_email
  where session_id = p_session_id
    and (email is null or email = '');

  -- 4. Programa Completo / Premium
  if v_product_id ilike '%programa%' or v_product_id ilike '%premium%' then

    -- 4A. Encolar correo de acceso al Programa
    insert into public.outbox_emails (
      to_email,
      template,
      payload,
      status
    )
    select
      v_email,
      'welcome-program',
      jsonb_build_object(
        'session_id', p_session_id,
        'customer_email', v_email
      ),
      'queued'
    where not exists (
      select 1
      from public.outbox_emails
      where to_email = v_email
        and template = 'welcome-program'
        and payload->>'session_id' = p_session_id
    );

    -- 4B. Crear/actualizar entitlement premium
    insert into public.entitlements (
      email,
      product_id,
      status,
      purchase_id,
      updated_at
    )
    values (
      v_email,
      'programa-completo',
      'active',
      v_purchase_id,
      now()
    )
    on conflict (email, product_id)
    do update set
      status = 'active',
      purchase_id = coalesce(excluded.purchase_id, public.entitlements.purchase_id),
      updated_at = now();

    return;
  end if;

  -- 5. Kit de 7 Dias / default
  insert into public.outbox_emails (
    to_email,
    template,
    payload,
    status
  )
  select
    v_email,
    'welcome-kit',
    jsonb_build_object(
      'session_id', p_session_id,
      'customer_email', v_email
    ),
    'queued'
  where not exists (
    select 1
    from public.outbox_emails
    where to_email = v_email
      and template = 'welcome-kit'
      and payload->>'session_id' = p_session_id
  );
end;
$function$;