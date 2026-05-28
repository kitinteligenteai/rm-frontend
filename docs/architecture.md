\# Reinicio Metabólico — Arquitectura Técnica



\## Estado

Documento inicial de baseline para blindaje comercial.



\## Stack

\- Frontend: React + Vite

\- Hosting: Vercel

\- Backend: Supabase

\- Base de datos: PostgreSQL / Supabase

\- Edge Functions: Supabase Functions

\- Pagos: Mercado Pago Checkout Pro

\- Correos transaccionales: Resend

\- Dominio/correo: reiniciometabolico.net / Zoho



\## Flujo comercial principal

Landing

→ Checkout Mercado Pago

→ Supabase Edge Function

→ Webhook Mercado Pago

→ Supabase DB

→ Outbox de correos

→ Resend

→ Entrega del Kit de 7 Días

→ Upsell al Programa Completo



\## Funciones críticas conocidas

\- mp-generate-preference-v2

\- mp-webhook-v3

\- confirm-purchase

\- email-worker-v2

\- claim-purchase-v2



\## Tablas críticas conocidas

\- checkout\_sessions

\- purchases

\- outbox\_emails

\- admin\_notifications\_log



\## Reglas de protección

\- No ejecutar supabase db push sin revisar diff.

\- No tocar confirm-purchase sin prueba controlada.

\- No tocar mp-webhook-v3 sin prueba sandbox/real.

\- No modificar update\_checkout\_email\_final sin comparar contra producción.

\- No exponer service\_role en frontend.

\- Precio y producto deben definirse en backend.



\## Pendiente de confirmar

\- RLS real en producción.

\- Grants reales en producción.

\- Cron jobs activos.

\- Secrets reales en Supabase y Vercel.

\- Configuración actual del webhook en Mercado Pago.

\- Estado actual de Resend/Zoho.

