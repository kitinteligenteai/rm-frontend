-- ✅ Función final estable - update_checkout_email_final()
-- Última revisión: 2025-10-17
-- Propósito: sincroniza correo tras confirmación de compra (checkout_sessions → purchases → outbox_emails)

CREATE OR REPLACE FUNCTION public.update_checkout_email_final(
  p_session_id TEXT,
  p_email TEXT
) RETURNS VOID AS $$
BEGIN 
  -- 1️⃣ Actualiza correo en checkout_sessions (UUID)
  UPDATE public.checkout_sessions
  SET email_final = LOWER(TRIM(p_email)),
      updated_at = NOW()
  WHERE id = p_session_id::UUID;

  -- 2️⃣ Sincroniza con purchases (TEXT)
  UPDATE public.purchases
  SET email = LOWER(TRIM(p_email))
  WHERE session_id = p_session_id  -- 👈 sin cast, porque es TEXT
    AND (email IS NULL OR email = '');

  -- 3️⃣ Inserta en outbox_emails sólo si no existe
  INSERT INTO public.outbox_emails (to_email, template, payload, status)
  SELECT LOWER(TRIM(p_email)), 'welcome-kit',
         JSONB_BUILD_OBJECT(
           'session_id', p_session_id,
           'customer_email', LOWER(TRIM(p_email))
         ),
         'queued'
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.outbox_emails
    WHERE to_email = LOWER(TRIM(p_email))
      AND template = 'welcome-kit'
      AND (
        (payload->>'session_id') IS NOT NULL
        AND LENGTH(payload->>'session_id') = 36
        AND (payload->>'session_id')::UUID = p_session_id::UUID
      )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
