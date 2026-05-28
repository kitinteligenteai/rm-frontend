# Reinicio Metabólico — Runbook de Pagos

## Objetivo
Procedimiento operativo para revisar y recuperar incidentes relacionados con pagos, sesiones de checkout, compras y entrega posterior.

## Flujo esperado
1. Usuario inicia checkout desde frontend.
2. `mp-generate-preference-v2` crea sesión en `checkout_sessions`.
3. Mercado Pago procesa el pago.
4. `mp-webhook-v3` recibe notificación.
5. Se registra compra en `purchases`.
6. Se actualiza `checkout_sessions`.
7. Se encola correo en `outbox_emails`.
8. `email-worker-v2` envía el correo.
9. Usuario recibe acceso/entrega.

## Incidente: usuario pagó y no recibió correo

### Revisar sesión

```sql
select *
from public.checkout_sessions
where email_final = 'correo@cliente.com'
   or email_from_mp = 'correo@cliente.com'
order by created_at desc;
```

### Revisar compra

```sql
select *
from public.purchases
where email = 'correo@cliente.com'
order by created_at desc;
```

### Revisar outbox

```sql
select *
from public.outbox_emails
where to_email = 'correo@cliente.com'
order by created_at desc;
```

## Incidente: Mercado Pago aprobado pero no aparece compra

1. Buscar por `provider_payment_id` en `purchases`.
2. Buscar por `payment_id` en `checkout_sessions`.
3. Revisar logs de `mp-webhook-v3`.
4. Confirmar en Mercado Pago si el pago está `approved`.
5. No crear registros manuales sin documentar evidencia.

### Buscar por payment_id / provider_payment_id

```sql
select *
from public.purchases
where provider_payment_id = 'ID_DE_PAGO_MP';

select *
from public.checkout_sessions
where payment_id = 'ID_DE_PAGO_MP';
```

## Incidente: correo quedó en queued

```sql
select *
from public.outbox_emails
where status = 'queued'
order by created_at asc;
```

Acción:
- Confirmar que `email-worker-v2` está activo.
- Revisar logs de la función.
- Confirmar que `RESEND_API_KEY` sigue vigente.

## Incidente: correo falló

```sql
select *
from public.outbox_emails
where status = 'error'
order by updated_at desc;
```

Revisar:
- `last_error`
- `attempts`
- `template`
- `payload`
- `provider_message_id`

## Incidente: compra duplicada

Revisar índices:
- `purchases_provider_payment_id_unique`
- `unique_payment`
- `ux_purchases_provider_payment`

Consulta:

```sql
select provider, provider_payment_id, count(*)
from public.purchases
group by provider, provider_payment_id
having count(*) > 1;
```

## Reglas críticas
- No ejecutar `supabase db push` durante un incidente sin revisar diff.
- No modificar `update_checkout_email_final` sin backup.
- No tocar `mp-webhook-v3` sin prueba controlada.
- No exponer `SUPABASE_SERVICE_ROLE_KEY`.
- Toda corrección manual debe quedar registrada en `security_audit_log`.

## Estado post-hardening
El 2026-05-27 se revocó acceso directo de `anon` y `authenticated` a tablas críticas.
El frontend conserva acceso solo a `my_entitlements` para usuarios autenticados.