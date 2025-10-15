-- ✅ Eliminamos versiones viejas para evitar conflicto de overloads (uuid/text)
drop function if exists public.update_checkout_email(uuid, text);
drop function if exists public.update_checkout_email(text, text);

-- ✅ Creamos la función correcta
create or replace function public.update_checkout_email(
  p_session_id uuid,
  p_email text
)
returns void as $$
begin
  update public.checkout_sessions
  set email_final     = p_email,
      email_from_rm   = p_email,
      email_verified  = now(),
      updated_at      = now()
  where id = p_session_id; -- 👈 ya no hay cast, todo es uuid
end;
$$ language plpgsql security definer;
