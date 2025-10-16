create or replace function update_checkout_email(
  p_session_id text,
  p_email text
)
returns void
language plpgsql
as $$
begin
  update checkout_sessions
  set email_final = lower(trim(p_email))
  where id = p_session_id::uuid;

  update purchases
  set email = lower(trim(p_email))
  where session_id = p_session_id::uuid
    and (email is null or email = '');

  insert into outbox_emails (to_email, template, payload, status)
  select lower(trim(p_email)), 'welcome-kit',
         jsonb_build_object('session_id', p_session_id, 'customer_email', lower(trim(p_email))),
         'queued'
  where not exists (
    select 1 from outbox_emails
    where to_email = lower(trim(p_email))
      and template = 'welcome-kit'
      and payload->>'session_id' = p_session_id
  );
end;
$$;
