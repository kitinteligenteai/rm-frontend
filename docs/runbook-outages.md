\# Reinicio Metabólico — Runbook de Caídas e Incidentes



\## Objetivo



Procedimiento para revisar caídas generales del sistema RM: frontend, Supabase, Edge Functions, pagos o correo.



\## Incidente: el sitio no carga



Revisar:



\- Vercel deployment.

\- Dominio reiniciometabolico.net.

\- DNS.

\- Último commit desplegado.

\- Consola del navegador.



Acciones:



\- Revisar logs de Vercel.

\- Confirmar si local funciona con npm run dev.

\- Confirmar si build pasa con npm run build.



\## Incidente: checkout no abre



Revisar:



\- mp-generate-preference-v2.

\- Variables de Mercado Pago.

\- Respuesta del botón de checkout.

\- Consola del navegador.

\- Logs de Supabase Function.



\## Incidente: pago aprobado pero no se refleja



Revisar:



\- Webhook Mercado Pago.

\- Logs de mp-webhook-v3.

\- Tabla checkout\_sessions.

\- Tabla purchases.

\- Tabla outbox\_emails.



\## Incidente: usuario no puede entrar a plataforma



Revisar:



\- Supabase Auth.

\- Sesión del usuario.

\- Vista my\_entitlements.

\- Estado del entitlement.

\- Correo usado en compra vs correo usado en login.



\## Incidente: error después de cambio en Supabase



Acciones:



\- No ejecutar más SQL.

\- Revisar cambio aplicado.

\- Revisar security\_audit\_log.

\- Validar grants.

\- Validar RLS.

\- Preparar rollback específico.



\## Comandos locales útiles



Ejecutar solo cuando se esté diagnosticando un incidente local:



git status --short



git log --oneline -5



npm run build



npm run dev



\## Reglas críticas



\- No ejecutar supabase db push durante incidente sin revisar diff.

\- No tocar funciones de pago sin rollback.

\- No rotar secrets sin actualizar Supabase/Vercel.

\- No mezclar arreglos UX con arreglos de pagos.

\- Documentar causa, acción y validación.

