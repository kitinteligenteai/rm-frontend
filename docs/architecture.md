\# Reinicio Metabólico — Arquitectura Técnica



Última actualización: 2026-06-01



\## Estado



Documento de arquitectura técnica para continuidad operativa del proyecto Reinicio Metabólico.



El sistema ya cuenta con blindaje comercial base para el Kit de 7 Días:



\- Pago MXN vía Mercado Pago.

\- Precio definido en backend.

\- Consentimiento legal trazable.

\- Rutas legales públicas.

\- Rutas de pago fallido y pendiente.

\- Webhook de Mercado Pago con hardening mínimo.

\- Entrega del Kit por correo vía outbox/email-worker.

\- Notificación administrativa por NTFY.

\- Runbooks operativos.



El Programa Completo existe como flujo técnico, pero aún requiere prueba controlada end-to-end antes de escalarlo comercialmente.



\---



\## Stack



\- Frontend: React + Vite.

\- Hosting: Vercel.

\- Backend: Supabase.

\- Base de datos: PostgreSQL / Supabase.

\- Edge Functions: Supabase Functions.

\- Pagos MXN: Mercado Pago Checkout Pro.

\- Pagos USD: Gumroad externo.

\- Correos transaccionales: Resend.

\- Dominio/correo: reiniciometabolico.net / Zoho.

\- Notificaciones administrativas: NTFY.



\---



\## Productos



\### Kit de 7 Días



\- Product ID: kit-7-dias.

\- Precio MXN backend: $139 MXN.

\- Precio USD externo: $7 USD.

\- Entrega: PDF por correo y acceso desde Mis Compras.

\- PDF fuente oficial: public/kits/kit-7-dias.pdf.

\- Ruta pública: /kits/kit-7-dias.pdf.



\### Programa Completo



\- Product ID: programa-completo.

\- Precio MXN backend: $1299 MXN.

\- Precio USD externo: $75 USD.

\- Entrega esperada: acceso a plataforma / Programa Completo.

\- Estado: pendiente prueba controlada end-to-end antes de escalar.



\---



\## Flujo comercial principal — Kit MXN



Landing

→ SmartCheckoutCTA

→ Checkbox legal obligatorio

→ MercadoPagoButton

→ mp-generate-preference-v2

→ Mercado Pago Checkout Pro

→ mp-webhook-v3

→ checkout\_sessions

→ purchases

→ NTFY avisa venta aprobada al administrador

→ /gracias-kit

→ confirm-purchase

→ update\_checkout\_email\_final

→ outbox\_emails

→ email-worker-v2

→ Resend

→ Cliente recibe PDF



Nota importante:

NTFY confirma evento administrativo de venta/pago aprobado. No debe interpretarse como confirmación final de entrega del PDF, salvo que el email-worker o Resend-webhook generen una alerta específica de entrega.



\---



\## Flujo de consentimiento legal



El consentimiento se captura antes de crear la preferencia de Mercado Pago.



Archivos involucrados:



\- src/components/SmartCheckoutCTA.jsx

\- src/components/common/MercadoPagoButton.jsx

\- supabase/functions/mp-generate-preference-v2/index.ts



Tabla:



\- public.legal\_consents



Datos registrados:



\- session\_id

\- product\_id

\- terms\_version

\- privacy\_version

\- refunds\_version

\- consented\_at

\- ip\_hash

\- user\_agent

\- meta



Reglas:



\- anon: sin acceso directo.

\- authenticated: sin acceso directo.

\- service\_role: acceso backend.

\- RLS activo.



Versiones legales actuales:



\- terminos-2026-05-28

\- privacidad-2026-05-28

\- devoluciones-2026-05-28



\---



\## Rutas públicas principales



\- /

\- /programa

\- /terminos

\- /privacidad

\- /devoluciones

\- /pago-fallido

\- /pago-pendiente

\- /gracias-kit

\- /gracias-upsell



\---



\## Rutas privadas / plataforma



\- /plataforma/\*



La plataforma privada se maneja desde src/pages/Plataforma.jsx y sus subrutas internas.



\---



\## Funciones críticas



\### mp-generate-preference-v2



Propósito:



\- Crear preferencia de Mercado Pago.

\- Definir producto/precio desde backend.

\- Exigir consentimiento legal.

\- Crear checkout\_sessions.

\- Insertar legal\_consents.

\- Enviar metadata a Mercado Pago.



Deploy requerido:



npx supabase functions deploy mp-generate-preference-v2 --project-ref mgjzlohapnepvrqlxmpo --no-verify-jwt



Razón:



\- El checkout público ocurre antes de que el usuario tenga sesión.

\- No debe desplegarse con verificación JWT activa.



\### mp-webhook-v3



Propósito:



\- Recibir notificaciones de Mercado Pago.

\- Consultar la API de Mercado Pago como fuente de verdad.

\- Actualizar checkout\_sessions.

\- Insertar/actualizar purchases.

\- Enviar notificación administrativa por NTFY.

\- Evitar notificaciones duplicadas mediante admin\_notifications\_log.



Hardening mínimo aplicado el 2026-06-01:



\- Valida métodos POST y OPTIONS.

\- Rechaza otros métodos.

\- Valida presencia de MP\_ACCESS\_TOKEN.

\- Resuelve product\_id desde:

&#x20; 1. payment.metadata.product\_type

&#x20; 2. payment.additional\_info.items\[0].id

&#x20; 3. payment.description

\- Usa texto ASCII en NTFY para reducir problemas de encoding.

\- Mantiene meta: payment completo por trazabilidad forense.



Deploy requerido:



npx supabase functions deploy mp-webhook-v3 --project-ref mgjzlohapnepvrqlxmpo --no-verify-jwt



Pendiente posterior:



\- Validación de firma/origen de Mercado Pago.

\- Reducción del payload guardado en meta.



\### confirm-purchase



Propósito:



\- Confirmar el correo del comprador después del pago.

\- Llamar a update\_checkout\_email\_final.

\- Sincronizar correo final.

\- Evitar confirmaciones duplicadas.



\### update\_checkout\_email\_final



Propósito:



\- Actualizar checkout\_sessions.email\_final.

\- Sincronizar purchases.email.

\- Detectar si la compra corresponde a Kit o Programa.

\- Encolar welcome-kit o welcome-program según product\_id.

\- Evitar correos duplicados por session\_id/template.



Regla crítica:



No modificar esta función sin comparar contra producción y tener rollback listo.



\### email-worker-v2



Propósito:



\- Procesar outbox\_emails.

\- Enviar correos transaccionales vía Resend.

\- Marcar correos como sent, delivered, failed o estado correspondiente.



Comportamiento actual:



\- El correo puede tardar algunos minutos.

\- /gracias-kit comunica esta expectativa al cliente.



\### resend-webhook-v2



Propósito:



\- Actualizar estado de correos a partir de eventos de Resend.



\### maintenance-email-worker



Propósito:



\- Mantenimiento/limpieza de correos de prueba o estados antiguos.



\---



\## Tablas críticas



\### checkout\_sessions



Registra sesiones de checkout.



Campos relevantes:



\- id

\- preference\_id

\- payment\_id

\- status

\- email\_final

\- raw\_mp

\- created\_at

\- updated\_at



\### purchases



Registra compras aprobadas o estados de pago desde Mercado Pago.



Campos actuales:



\- id

\- provider

\- provider\_payment\_id

\- email

\- product\_id

\- status

\- meta

\- created\_at

\- session\_id



\### outbox\_emails



Registra correos transaccionales pendientes o enviados.



Templates actuales observados:



\- welcome-kit

\- welcome-program



\### legal\_consents



Registra consentimiento legal trazable.



\### admin\_notifications\_log



Registra notificaciones administrativas para deduplicación.



\### entitlements



Registra accesos del usuario.



Estado actual:



\- Existe tabla entitlements.

\- Existe vista my\_entitlements.

\- authenticated conserva SELECT sobre my\_entitlements.

\- Pendiente: revisar estrategia final de entitlements para Programa Completo antes de escalar.



\---



\## Supabase hardening



Aplicado:



\- Se revocó acceso directo de anon y authenticated a tablas críticas:

&#x20; - checkout\_sessions

&#x20; - purchases

&#x20; - outbox\_emails

&#x20; - entitlements

&#x20; - admin\_notifications\_log

&#x20; - security\_audit\_log



Excepción:



\- authenticated mantiene SELECT sobre my\_entitlements.



Pendiente:



\- Crear migración consolidada reproducible con el hardening completo de grants.

\- Revisar default privileges futuros.

\- Revisar policies heredadas si se agregan nuevas tablas.



\---



\## Rutas de pago fallido / pendiente



Se agregaron el 2026-06-01:



\- /pago-fallido

\- /pago-pendiente



Objetivo:



\- Evitar que Mercado Pago regrese al usuario al Home sin explicación.

\- Dar instrucciones claras en pagos rechazados o pendientes.

\- Reducir tickets de soporte.



\---



\## Sitemap



El sitemap se genera con:



\- scripts/generate-sitemap.mjs



Incluye:



\- /

\- /programa

\- /terminos

\- /privacidad

\- /devoluciones

\- /gracias-kit

\- /gracias-upsell

\- /pago-fallido

\- /pago-pendiente



Nota:



\- npm run build ejecuta prebuild, que regenera public/sitemap.xml y public/robots.txt.

\- Esto puede modificar fechas lastmod.

\- Evitar commitear cambios de sitemap cuando solo sean ruido de fecha.



\---



\## PDF descargable



Fuente oficial:



\- public/kits/kit-7-dias.pdf



Ruta pública:



\- /kits/kit-7-dias.pdf



Nota:



\- dist/ no debe tratarse como fuente oficial.

\- El build puede regenerar/modificar archivos en dist.

\- Pendiente: limpiar estrategia de versionado de dist/.



\---



\## Notificaciones administrativas



Canal:



\- NTFY.



Uso:



\- Avisos de venta aprobada.

\- Dedupe vía admin\_notifications\_log.



Estado:



\- Notificación llega.

\- Pendiente revisar sonido/visibilidad en iPhone.



Antecedente:



\- Caso Claudia evidenció que una venta cobrada sin alerta visible puede pasar desapercibida y generar reembolso/soporte manual.



\---



\## Reglas de protección



\- No ejecutar supabase db push sin revisar diff.

\- No tocar confirm-purchase sin prueba controlada.

\- No tocar mp-webhook-v3 sin prueba controlada.

\- No modificar update\_checkout\_email\_final sin comparar contra producción.

\- No exponer service\_role en frontend.

\- Precio y producto deben definirse en backend.

\- No enviar precios desde frontend.

\- No desplegar mp-generate-preference-v2 sin --no-verify-jwt.

\- No desplegar mp-webhook-v3 sin --no-verify-jwt.

\- No mezclar cambios UX con cambios de pagos/backend.

\- No escalar tráfico sin monitoreo manual al inicio.

\- No probar Programa Completo con venta real hasta que el contenido esté suficientemente presentable.



\---



\## Validaciones recientes



\### Kit de 7 Días



Validado:



\- Checkbox legal bloquea si no se acepta.

\- Con checkbox abre Mercado Pago.

\- Compra real/controlada de $139 MXN completada.

\- Redirección a /gracias-kit.

\- Confirmación de correo.

\- Correo con PDF recibido.

\- NTFY recibido.

\- legal\_consents registrado.

\- checkout\_sessions.raw\_mp.legal\_consent registrado.

\- purchases registrado.

\- outbox\_emails enviado.



\### Webhook



Validado sin compra:



\- GET /mp-webhook-v3 responde method\_not\_allowed.

\- POST {} responde { ok: true, ignored: true }.



\---



\## Pendientes técnicos



\### P0/P1



\- Prueba controlada completa del Programa Completo.

\- Confirmar acceso/entitlement del Programa Completo.

\- Revisar firma/origen de Mercado Pago en mp-webhook-v3.

\- Revisar si meta: payment debe reducirse.

\- Mejorar sonido/visibilidad de NTFY.



\### P1/P2



\- Crear CI básico.

\- Resolver lint rojo.

\- Limpiar estrategia dist/.

\- Integrar o eliminar:

&#x20; - src/components/TodayPlan.jsx

&#x20; - src/components/navigation/ModuleHeader.jsx

\- Revisar flujo USD/Gumroad y consentimiento trazable fuera de Mercado Pago.

\- Revisar performance/bundle.

