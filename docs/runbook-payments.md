\# Reinicio Metabólico — Runbook de Pagos



\## Objetivo

Procedimiento operativo para revisar y recuperar incidentes relacionados con pagos, sesiones de checkout, compras y entrega posterior.



\## Flujo esperado

1\. Usuario inicia checkout desde frontend.

2\. `mp-generate-preference-v2` crea sesión en `checkout\_sessions`.

3\. Mercado Pago procesa el pago.

4\. `mp-webhook-v3` recibe notificación.

5\. Se registra compra en `purchases`.

6\. Se actualiza `checkout\_sessions`.

7\. Se encola correo en `outbox\_emails`.

8\. `email-worker-v2` envía el correo.

9\. Usuario recibe acceso/entrega.



\## Incidente: usuario pagó y no recibió correo



\### Revisar sesión

```sql

select \*

from public.checkout\_sessions

where email\_final = 'correo@cliente.com'

&#x20;  or email\_from\_mp = 'correo@cliente.com'

order by created\_at desc;

