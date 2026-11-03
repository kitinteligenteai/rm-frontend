-- REVIEW ONLY. Apply only after the reconciled security migration, in isolated staging first.
begin;
create or replace function public.record_verified_gumroad_sale(
 p_session_id uuid,p_sale_id text,p_product_id text,p_email text,p_price integer,p_status text,p_meta jsonb)
returns void language plpgsql security invoker set search_path=public,pg_temp as $$
declare v_id uuid; v_email text:=lower(trim(p_email)); v_provider_id text:='gumroad:'||p_sale_id;
  v_expected integer; v_existing public.purchases%rowtype;
begin
 v_expected:=case p_product_id when 'kit-7-dias' then 700 when 'programa-completo' then 7500 else null end;
 if v_expected is null or p_price<>v_expected or p_status not in ('approved','refunded')
   or length(p_sale_id) not between 4 and 160 or p_meta->>'currency' is distinct from 'usd'
   or v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then raise exception 'Sale mismatch'; end if;
 -- Concurrent pings for the same sale cannot create different sessions or deliveries.
 perform pg_advisory_xact_lock(hashtextextended(v_provider_id,0));
 select * into v_existing from public.purchases where provider_payment_id=v_provider_id for update;
 if found and (v_existing.email is distinct from v_email or v_existing.product_id<>p_product_id
    or v_existing.session_id is distinct from p_session_id::text) then raise exception 'Sale identity changed'; end if;
 insert into public.checkout_sessions(id,status,email_final,raw_mp)
  values(p_session_id,p_status,v_email,jsonb_build_object('requested_product',p_product_id,'provider','gumroad'))
  on conflict(id) do update set status=excluded.status,updated_at=now();
 insert into public.purchases(provider,provider_payment_id,session_id,product_id,status,email,meta)
  values('gumroad',v_provider_id,p_session_id::text,p_product_id,p_status,v_email,p_meta)
  on conflict(provider_payment_id) do update set status=excluded.status,meta=excluded.meta returning id into v_id;
 if p_status='approved' then perform public.update_checkout_email_final(p_session_id::text,v_email);
 else update public.entitlements set status='revoked',updated_at=now() where purchase_id=v_id;
 end if;
end $$;
revoke all on function public.record_verified_gumroad_sale(uuid,text,text,text,integer,text,jsonb) from public,anon,authenticated;
grant execute on function public.record_verified_gumroad_sale(uuid,text,text,text,integer,text,jsonb) to service_role;
commit;
