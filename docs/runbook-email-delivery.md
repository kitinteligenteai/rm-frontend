# Reinicio Metabólico — Runbook de Entrega de Correos

## Objetivo
Procedimiento para revisar problemas de entrega de correos transaccionales del Kit de 7 Días o Programa Completo.

## Flujo esperado
1. Compra aprobada.
2. Se crea o actualiza registro en `purchases`.
3. Se encola correo en `outbox_emails`.
4. `email-worker-v2` procesa correos `queued`.
5. Resend envía el correo.
6. `outbox_emails.status` cambia a `sent`.

## Revisar correos pendientes

```sql
select *
from public.outbox_emails
where status = 'queued'
order by created_at asc;
```

## Revisar correos con error

```sql
select *
from public.outbox_emails
where status = 'error'
order by updated_at desc;
```

## Revisar correo de un cliente

```sql
select *
from public.outbox_emails
where to_email = 'correo@cliente.com'
order by created_at desc;
```

## Revisar si el worker está funcionando
- Abrir Supabase Functions.
- Revisar logs de `email-worker-v2`.
- Confirmar que no existan errores de `RESEND_API_KEY`.
- Confirmar que Resend no esté rechazando dominio/remitente.

## Posibles causas
- Correo quedó en `queued`.
- Resend falló.
- Template incorrecto.
- Payload incompleto.
- Dominio no autenticado.
- Cliente escribió mal su correo.
- Webhook de pago no generó compra o sesión correctamente.

## Acciones seguras
- Revisar `last_error`.
- Confirmar `attempts`.
- Verificar `template`.
- Verificar `payload`.
- Confirmar `provider_message_id`.

## Reglas críticas
- No reenviar manualmente sin revisar si ya existe un correo `sent`.
- No duplicar registros en `outbox_emails`.
- No modificar `email-worker-v2` sin prueba controlada.
- Toda corrección manual debe documentarse.