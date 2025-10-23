

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."confirm_checkout"("p_session_id" "text", "p_email" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_clean_email TEXT := lower(trim(p_email));
  v_session_updated BOOLEAN := false;
  v_purchase_id TEXT;
BEGIN
  -- 1. Actualiza la sesión de forma segura
  UPDATE checkout_sessions
  SET email_final = v_clean_email
  WHERE id::text = p_session_id;

  IF FOUND THEN
    v_session_updated := true;
  END IF;

  -- 2. Busca la compra 'approved'
  SELECT provider_payment_id
  INTO v_purchase_id
  FROM purchases
  WHERE session_id::text = p_session_id AND status = 'approved'
  ORDER BY created_at DESC
  LIMIT 1;

  -- 3. Encola el correo de forma idempotente
  IF v_purchase_id IS NOT NULL THEN
    INSERT INTO outbox_emails(to_email, template, payload, status)
    VALUES (
      v_clean_email, 'welcome_kit_7_dias',
      jsonb_build_object('purchase_id', v_purchase_id, 'customer_email', v_clean_email),
      'queued'
    )
    ON CONFLICT ((payload->>'purchase_id'), template) DO NOTHING;
  END IF;

  -- 4. Devuelve un resultado claro
  RETURN jsonb_build_object(
    'success', true,
    'session_updated', v_session_updated,
    'purchase_id_found', v_purchase_id
  );
END;
$$;


ALTER FUNCTION "public"."confirm_checkout"("p_session_id" "text", "p_email" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."confirm_purchase_and_enqueue_email"("p_session_id" "text", "p_email" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_clean_email TEXT := lower(trim(p_email));
    v_session_updated BOOLEAN := false;
    v_purchase_id TEXT;
BEGIN
    -- Paso 1: Actualizar la sesión de checkout.
    -- La conversión id::text es la clave para evitar el error "uuid = text".
    UPDATE checkout_sessions
    SET email_final = v_clean_email
    WHERE id::text = p_session_id;

    -- Verificamos si la actualización fue exitosa.
    IF FOUND THEN
        v_session_updated := true;
    END IF;

    -- Paso 2: Encontrar la compra asociada.
    SELECT provider_payment_id
    INTO v_purchase_id
    FROM purchases
    WHERE session_id::text = p_session_id AND status = 'approved'
    ORDER BY created_at DESC
    LIMIT 1;

    -- Paso 3: Encolar el correo de forma idempotente si se encontró una compra.
    -- ON CONFLICT evita correos duplicados si la función se llama varias veces.
    IF v_purchase_id IS NOT NULL THEN
        INSERT INTO outbox_emails(to_email, template, payload, status)
        VALUES (
            v_clean_email,
            'welcome_kit_7_dias',
            jsonb_build_object('purchase_id', v_purchase_id, 'customer_email', v_clean_email),
            'queued'
        )
        -- Cláusula de idempotencia robusta para el encolado de correos.
        ON CONFLICT ((payload->>'purchase_id'), template) DO NOTHING;
    END IF;

    -- Devolver un JSON claro con el resultado de la operación.
    RETURN jsonb_build_object(
        'success', true,
        'session_updated', v_session_updated,
        'purchase_id_found', v_purchase_id
    );
END;
$$;


ALTER FUNCTION "public"."confirm_purchase_and_enqueue_email"("p_session_id" "text", "p_email" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_purchase_and_enqueue_email"("p_provider_payment_id" "text", "p_session_id" "text", "p_product_id" "text", "p_status" "text", "p_email" "text", "p_meta" "jsonb") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_is_new BOOLEAN;
BEGIN
    -- Paso 1: Intenta insertar la compra. Si ya existe, no hace nada.
    INSERT INTO public.purchases (provider, provider_payment_id, session_id, product_id, status, email, meta)
    VALUES ('mercadopago', p_provider_payment_id, p_session_id, p_product_id, p_status, p_email, p_meta)
    ON CONFLICT (provider_payment_id) DO NOTHING;

    -- Paso 2: Verifica si la inserción fue exitosa (es decir, si la compra era nueva)
    GET DIAGNOSTICS v_is_new = ROW_COUNT;

    -- Paso 3: Si la compra es NUEVA, y solo si es nueva, encola el correo.
    IF v_is_new THEN
        INSERT INTO public.outbox_emails (to_email, template, payload, status)
        VALUES (
            p_email,
            'welcome_kit_7_dias',
            jsonb_build_object('purchase_id', p_provider_payment_id, 'session_id', p_session_id),
            'queued'
        );
        
        RETURN TRUE; -- Devuelve 'verdadero' porque se encoló un correo.
    END IF;

    RETURN FALSE; -- Devuelve 'falso' porque la compra ya existía y no se hizo nada.
END;
$$;


ALTER FUNCTION "public"."create_purchase_and_enqueue_email"("p_provider_payment_id" "text", "p_session_id" "text", "p_product_id" "text", "p_status" "text", "p_email" "text", "p_meta" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."enqueue_welcome_email"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare
  email_body_html text;
  email_body_text text;
  pdf_link text := 'https://reiniciometabolico.net/kits/kit-7-dias.pdf'; -- El enlace que creamos
begin
  -- Solo actuar si el estado de la compra es 'approved'
  if new.status = 'approved' then

    -- Generar el cuerpo del correo en formato HTML
    email_body_html := format(
      '<!DOCTYPE html><html lang="es"><body style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">' ||
      '<h2>¡Bienvenido a Reinicio Metabólico!</h2>' ||
      '<p>Gracias por tu compra. Aquí tienes tu acceso al Kit de 7 días.</p>' ||
      '<p><a href="%s" style="background:#28a745;color:#fff;padding:10px 15px;text-decoration:none;border-radius:4px;">Acceder al Kit</a></p>' ||
      '<p>Si tienes alguna duda, contáctanos en <a href="mailto:soporte@reiniciometabolico.net">soporte@reiniciometabolico.net</a>.</p>' ||
      '<p>Saludos,  
El equipo de Reinicio Metabólico</p>' ||
      '</body></html>',
      pdf_link
     );

    -- Generar el cuerpo del correo en formato Texto Plano
    email_body_text := format(
      '¡Bienvenido a Reinicio Metabólico!\n\n' ||
      'Gracias por tu compra. Aquí tienes tu acceso al Kit de 7 días:\n' ||
      '%s\n\n' ||
      'Si tienes alguna pregunta, escríbenos a soporte@reiniciometabolico.net\n\n' ||
      'Saludos,\nEl equipo de Reinicio Metabólico',
      pdf_link
    );

    -- Insertar el correo en la tabla de salida (outbox)
    insert into public.outbox_emails (to_email, subject, html, text, meta)
    values (
      new.buyer_email,
      'Tu acceso al Kit de 7 días – Reinicio Metabólico',
      email_body_html,
      email_body_text,
      jsonb_build_object(
        'purchase_id', new.id,
        'provider_payment_id', new.provider_payment_id
      )
    );
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."enqueue_welcome_email"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."exec_sql"("q" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  execute q;
end;
$$;


ALTER FUNCTION "public"."exec_sql"("q" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_notification_if_not_exists"("p_payment_id" "text", "p_channel" "text", "p_meta" "jsonb") RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  was_inserted BOOLEAN;
BEGIN
  -- Intenta insertar un nuevo registro. Si el payment_id ya existe, no hará nada.
  INSERT INTO public.admin_notifications_log (provider_payment_id, channel, meta)
  VALUES (p_payment_id, p_channel, p_meta)
  ON CONFLICT (provider_payment_id) DO NOTHING;

  -- GET DIAGNOSTICS obtiene el número de filas afectadas por el último comando.
  -- Si se insertó una fila, ROW_COUNT será 1. Si no, será 0.
  GET DIAGNOSTICS was_inserted = ROW_COUNT;

  RETURN was_inserted;
END;
$$;


ALTER FUNCTION "public"."log_notification_if_not_exists"("p_payment_id" "text", "p_channel" "text", "p_meta" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."resolve_session_uuid"("p_session_id" "text") RETURNS "uuid"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  select id
  from checkout_sessions
  where id::text = p_session_id
  limit 1
$$;


ALTER FUNCTION "public"."resolve_session_uuid"("p_session_id" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_purchase_email_from_session"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE public.purchases
  SET email = NEW.email_final
  WHERE session_id::uuid = NEW.id -- ✅ Cast de text → uuid
    AND (
      email IS NULL
      OR email = ''
      OR email LIKE '%@testuser.com%'
    );

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."sync_purchase_email_from_session"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_checkout_email_final"("p_session_id" "text", "p_email" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
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
$$;


ALTER FUNCTION "public"."update_checkout_email_final"("p_session_id" "text", "p_email" "text") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."admin_notifications_log" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "channel" "text" NOT NULL,
    "provider_payment_id" "text" NOT NULL,
    "meta" "jsonb"
);


ALTER TABLE "public"."admin_notifications_log" OWNER TO "postgres";


ALTER TABLE "public"."admin_notifications_log" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."admin_notifications_log_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."checkout_sessions" (
    "id" "uuid" NOT NULL,
    "preference_id" "text",
    "payment_id" "text",
    "status" "text",
    "email_from_mp" "text",
    "email_final" "text",
    "raw_mp" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "email_verified_at" timestamp with time zone,
    "correction_token" "uuid" DEFAULT "gen_random_uuid"(),
    "correction_attempts" integer DEFAULT 0,
    CONSTRAINT "checkout_sessions_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'in_process'::"text", 'rejected'::"text", 'refunded'::"text", 'cancelled'::"text", 'chargeback'::"text"])))
);


ALTER TABLE "public"."checkout_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."entitlements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "email" "text" NOT NULL,
    "product_id" "text" NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "purchase_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "entitlements_email_check" CHECK (("email" ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::"text"))
);


ALTER TABLE "public"."entitlements" OWNER TO "postgres";


COMMENT ON TABLE "public"."entitlements" IS 'Derechos de acceso de un usuario a un producto específico.';



CREATE OR REPLACE VIEW "public"."my_entitlements" AS
 SELECT "product_id",
    "status",
    "created_at",
    "updated_at"
   FROM "public"."entitlements"
  WHERE ((("auth"."uid"() IS NOT NULL) AND ("user_id" = "auth"."uid"())) OR (("auth"."jwt"() ->> 'email'::"text") = "email"));


ALTER VIEW "public"."my_entitlements" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."outbox_emails" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "to_email" "text" NOT NULL,
    "template" "text" NOT NULL,
    "payload" "jsonb" NOT NULL,
    "status" "text" DEFAULT 'queued'::"text" NOT NULL,
    "attempts" integer DEFAULT 0 NOT NULL,
    "last_error" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "subject" "text",
    "provider_message_id" "text"
);


ALTER TABLE "public"."outbox_emails" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."progress_logs" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" DEFAULT "gen_random_uuid"(),
    "weight" double precision,
    "waist" double precision,
    "energy_level" integer,
    "sleep_quality" integer,
    "notes" "text"
);


ALTER TABLE "public"."progress_logs" OWNER TO "postgres";


COMMENT ON TABLE "public"."progress_logs" IS 'Almacena las entradas de progreso semanales de los usuarios.';



ALTER TABLE "public"."progress_logs" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."progress_logs_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."purchases" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "provider" "text" NOT NULL,
    "provider_payment_id" "text" NOT NULL,
    "email" "text",
    "product_id" "text" NOT NULL,
    "status" "text" NOT NULL,
    "meta" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "session_id" "text",
    CONSTRAINT "purchases_email_check" CHECK (("email" ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::"text"))
);


ALTER TABLE "public"."purchases" OWNER TO "postgres";


COMMENT ON TABLE "public"."purchases" IS 'Registro crudo e inmutable de cada transacción de pago.';



CREATE OR REPLACE VIEW "public"."sales_dashboard" AS
 SELECT ("p"."created_at" AT TIME ZONE 'America/Mexico_City'::"text") AS "fecha_local",
    "p"."provider_payment_id" AS "pago_mp_id",
    COALESCE("cs"."email_final", "cs"."email_from_mp", "p"."email") AS "correo_cliente",
    "p"."product_id",
    "p"."status" AS "estado_pago",
    "oe"."status" AS "estado_email",
    "oe"."provider_message_id",
    "oe"."last_error"
   FROM (("public"."purchases" "p"
     LEFT JOIN "public"."outbox_emails" "oe" ON ((("oe"."payload" ->> 'purchase_id'::"text") = "p"."provider_payment_id")))
     LEFT JOIN "public"."checkout_sessions" "cs" ON (("cs"."id" = ("p"."session_id")::"uuid")));


ALTER VIEW "public"."sales_dashboard" OWNER TO "postgres";


ALTER TABLE ONLY "public"."admin_notifications_log"
    ADD CONSTRAINT "admin_notifications_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."checkout_sessions"
    ADD CONSTRAINT "checkout_sessions_payment_id_key" UNIQUE ("payment_id");



ALTER TABLE ONLY "public"."checkout_sessions"
    ADD CONSTRAINT "checkout_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."checkout_sessions"
    ADD CONSTRAINT "checkout_sessions_preference_id_key" UNIQUE ("preference_id");



ALTER TABLE ONLY "public"."entitlements"
    ADD CONSTRAINT "entitlements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."outbox_emails"
    ADD CONSTRAINT "outbox_emails_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."progress_logs"
    ADD CONSTRAINT "progress_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."purchases"
    ADD CONSTRAINT "purchases_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."purchases"
    ADD CONSTRAINT "purchases_provider_payment_id_unique" UNIQUE ("provider_payment_id");



ALTER TABLE ONLY "public"."purchases"
    ADD CONSTRAINT "unique_payment" UNIQUE ("provider", "provider_payment_id");



ALTER TABLE ONLY "public"."admin_notifications_log"
    ADD CONSTRAINT "unique_provider_payment_id" UNIQUE ("provider_payment_id");



CREATE INDEX "idx_admin_notifications_log_payment_id" ON "public"."admin_notifications_log" USING "btree" ("provider_payment_id");



CREATE INDEX "idx_checkout_sessions_id" ON "public"."checkout_sessions" USING "btree" ("id");



CREATE INDEX "idx_entitlements_email_product" ON "public"."entitlements" USING "btree" ("email", "product_id");



CREATE INDEX "idx_outbox_emails_payload_purchase_id" ON "public"."outbox_emails" USING "btree" ((("payload" ->> 'purchase_id'::"text")));



CREATE INDEX "idx_outbox_status" ON "public"."outbox_emails" USING "btree" ("status");



CREATE INDEX "idx_purchases_created_at" ON "public"."purchases" USING "btree" ("created_at" DESC);



CREATE UNIQUE INDEX "purchases_session_id_key" ON "public"."purchases" USING "btree" ("session_id");



CREATE UNIQUE INDEX "uniq_outbox_on_email_template_purchase" ON "public"."outbox_emails" USING "btree" ("to_email", "template", (("payload" ->> 'purchase_id'::"text")));



CREATE UNIQUE INDEX "uq_outbox_by_purchase_template" ON "public"."outbox_emails" USING "btree" ((("payload" ->> 'purchase_id'::"text")), "template");



CREATE UNIQUE INDEX "uq_outbox_welcome_by_purchase" ON "public"."outbox_emails" USING "btree" ((("payload" ->> 'purchase_id'::"text"))) WHERE ("template" = 'welcome_kit_7_dias'::"text");



CREATE UNIQUE INDEX "ux_entitlements_email_product" ON "public"."entitlements" USING "btree" ("email", "product_id");



CREATE UNIQUE INDEX "ux_purchases_provider_payment" ON "public"."purchases" USING "btree" ("provider", "provider_payment_id");



CREATE OR REPLACE TRIGGER "trg_sync_purchase_email" AFTER INSERT OR UPDATE OF "email_final" ON "public"."checkout_sessions" FOR EACH ROW EXECUTE FUNCTION "public"."sync_purchase_email_from_session"();



ALTER TABLE ONLY "public"."entitlements"
    ADD CONSTRAINT "entitlements_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "public"."purchases"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."entitlements"
    ADD CONSTRAINT "entitlements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



CREATE POLICY " Los usuarios pueden borrar sus propios registros" ON "public"."progress_logs" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Enable read access for all users" ON "public"."progress_logs" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Los usuarios pueden crear sus propios registros." ON "public"."progress_logs" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Los usuarios pueden editar sus propios registros" ON "public"."progress_logs" FOR UPDATE USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."entitlements" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "entitlements_select_own" ON "public"."entitlements" FOR SELECT TO "authenticated" USING (((("auth"."uid"() IS NOT NULL) AND ("user_id" = "auth"."uid"())) OR (("auth"."jwt"() ->> 'email'::"text") = "email")));



ALTER TABLE "public"."progress_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."purchases" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

















































































































































































GRANT ALL ON FUNCTION "public"."confirm_checkout"("p_session_id" "text", "p_email" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."confirm_checkout"("p_session_id" "text", "p_email" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."confirm_checkout"("p_session_id" "text", "p_email" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."confirm_purchase_and_enqueue_email"("p_session_id" "text", "p_email" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."confirm_purchase_and_enqueue_email"("p_session_id" "text", "p_email" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."confirm_purchase_and_enqueue_email"("p_session_id" "text", "p_email" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_purchase_and_enqueue_email"("p_provider_payment_id" "text", "p_session_id" "text", "p_product_id" "text", "p_status" "text", "p_email" "text", "p_meta" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."create_purchase_and_enqueue_email"("p_provider_payment_id" "text", "p_session_id" "text", "p_product_id" "text", "p_status" "text", "p_email" "text", "p_meta" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_purchase_and_enqueue_email"("p_provider_payment_id" "text", "p_session_id" "text", "p_product_id" "text", "p_status" "text", "p_email" "text", "p_meta" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."enqueue_welcome_email"() TO "anon";
GRANT ALL ON FUNCTION "public"."enqueue_welcome_email"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."enqueue_welcome_email"() TO "service_role";



GRANT ALL ON FUNCTION "public"."exec_sql"("q" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."exec_sql"("q" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."exec_sql"("q" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."log_notification_if_not_exists"("p_payment_id" "text", "p_channel" "text", "p_meta" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."log_notification_if_not_exists"("p_payment_id" "text", "p_channel" "text", "p_meta" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_notification_if_not_exists"("p_payment_id" "text", "p_channel" "text", "p_meta" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."resolve_session_uuid"("p_session_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."resolve_session_uuid"("p_session_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."resolve_session_uuid"("p_session_id" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_purchase_email_from_session"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_purchase_email_from_session"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_purchase_email_from_session"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_checkout_email_final"("p_session_id" "text", "p_email" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_checkout_email_final"("p_session_id" "text", "p_email" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_checkout_email_final"("p_session_id" "text", "p_email" "text") TO "service_role";
























GRANT ALL ON TABLE "public"."admin_notifications_log" TO "anon";
GRANT ALL ON TABLE "public"."admin_notifications_log" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_notifications_log" TO "service_role";



GRANT ALL ON SEQUENCE "public"."admin_notifications_log_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."admin_notifications_log_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."admin_notifications_log_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."checkout_sessions" TO "anon";
GRANT ALL ON TABLE "public"."checkout_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."checkout_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."entitlements" TO "anon";
GRANT ALL ON TABLE "public"."entitlements" TO "authenticated";
GRANT ALL ON TABLE "public"."entitlements" TO "service_role";



GRANT ALL ON TABLE "public"."my_entitlements" TO "anon";
GRANT ALL ON TABLE "public"."my_entitlements" TO "authenticated";
GRANT ALL ON TABLE "public"."my_entitlements" TO "service_role";



GRANT ALL ON TABLE "public"."outbox_emails" TO "anon";
GRANT ALL ON TABLE "public"."outbox_emails" TO "authenticated";
GRANT ALL ON TABLE "public"."outbox_emails" TO "service_role";



GRANT ALL ON TABLE "public"."progress_logs" TO "anon";
GRANT ALL ON TABLE "public"."progress_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."progress_logs" TO "service_role";



GRANT ALL ON SEQUENCE "public"."progress_logs_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."progress_logs_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."progress_logs_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."purchases" TO "anon";
GRANT ALL ON TABLE "public"."purchases" TO "authenticated";
GRANT ALL ON TABLE "public"."purchases" TO "service_role";



GRANT ALL ON TABLE "public"."sales_dashboard" TO "anon";
GRANT ALL ON TABLE "public"."sales_dashboard" TO "authenticated";
GRANT ALL ON TABLE "public"."sales_dashboard" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;
