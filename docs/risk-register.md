# Reinicio Metabólico — Registro de Riesgos

Última actualización: 2026-06-01

## Estado ejecutivo

El blindaje comercial base ya está implementado y validado para el flujo del Kit de 7 Días.

Se consideran mitigados:
- Hardening P0 de Supabase/RLS/grants.
- Legal/compliance web básico.
- Consentimiento trazable en checkout Mercado Pago.
- Rutas de pago fallido y pago pendiente.
- UX post-pago del Kit.
- Ruta pública correcta del PDF.
- Hardening mínimo de `mp-webhook-v3`.
- Documentación operativa base y runbooks.

Pendientes principales:
- Prueba controlada completa del Programa Completo.
- Validación de firma/origen de Mercado Pago en webhook.
- Lint rojo.
- CI ausente.
- Limpieza de `dist/`.
- NTFY sonido/visibilidad en iPhone.
- Componentes UX preparados sin integración.

---

## Riesgos P0 — Bloquean comercialización seria

### Supabase RLS / permisos amplios en tablas críticas

- Estado: Mitigado el 2026-05-27.
- Hallazgo: `anon` y `authenticated` tenían permisos amplios sobre tablas críticas, incluyendo `checkout_sessions`, `purchases`, `outbox_emails`, `entitlements`, `admin_notifications_log` y `security_audit_log`.
- Acción aplicada: se revocó acceso directo de `anon` y `authenticated` a tablas críticas.
- Excepción mantenida: `authenticated` conserva `SELECT` sobre la vista `my_entitlements`.
- Validación: consulta posterior de grants mostró únicamente `authenticated | my_entitlements | SELECT`.
- Impacto: Home, login y navegación interna fueron validados localmente después del cambio.
- Riesgo residual: se recomienda crear una migración consolidada reproducible de hardening de grants para evitar que una restauración futura deje permisos abiertos.

### Legal visible incompleto

- Estado: Mitigado el 2026-05-28.
- Acción aplicada:
  - Se crearon `/terminos`, `/privacidad` y `/devoluciones`.
  - Se agregó `LegalFooter`.
  - Se agregaron enlaces legales visibles.
  - Se agregó disclaimer educativo/no médico.
  - Se actualizó `sitemap.xml`.
- Validación: rutas legales probadas visualmente.
- Riesgo residual: el contenido legal debe revisarse por un profesional si se escala tráfico fuerte.

### Consentimiento no trazable

- Estado: Mitigado el 2026-05-28.
- Acción aplicada:
  - Se creó tabla `public.legal_consents`.
  - RLS activo.
  - Sin acceso directo para `anon` ni `authenticated`.
  - Registro desde Edge Function con `service_role`.
  - Checkout exige aceptación de términos, privacidad y devoluciones.
  - Se guardan versiones legales, timestamp, `session_id`, `product_id`, `ip_hash`, `user_agent` y `meta`.
- Validación:
  - Sin consentimiento: `legal_consent_required`.
  - Con consentimiento: crea `preferenceId` e `initPoint`.
  - Se registra en `legal_consents`.
  - Se guarda copia en `checkout_sessions.raw_mp.legal_consent`.
- Riesgo residual:
  - El flujo USD/Gumroad solo exige checkbox visual, pero no registra consentimiento interno en Supabase.
  - El backend debe validar versiones legales exactas en una mejora posterior.

### Webhook Mercado Pago no auditado recientemente

- Estado: Mitigado parcialmente el 2026-06-01.
- Acción aplicada:
  - Hardening mínimo de `mp-webhook-v3`.
  - Valida método `POST`/`OPTIONS`.
  - Valida presencia de `MP_ACCESS_TOKEN`.
  - Resuelve `product_id` desde:
    1. `payment.metadata.product_type`
    2. `payment.additional_info.items[0].id`
    3. `payment.description`
  - NTFY usa texto ASCII para reducir problemas de encoding.
  - Se mantiene `meta: payment` completo por trazabilidad forense.
- Validación sin compra:
  - `GET /mp-webhook-v3` responde `method_not_allowed`.
  - `POST {}` responde `{ "ok": true, "ignored": true }`.
- Riesgo residual:
  - Aún no se valida firma/origen de Mercado Pago.
  - `meta: payment` puede guardar demasiado payload.
  - No hay rate limiting visible.
  - Requiere prueba completa posterior con Kit y Programa.

### Programa Completo sin prueba end-to-end reciente

- Estado: Pendiente.
- Riesgo: vender el producto de mayor ticket sin confirmar entrega/acceso/correo puede generar tickets, reembolsos o pérdida de confianza.
- Impacto: alto.
- Mitigación recomendada:
  - Prueba controlada del flujo `programa-completo`.
  - Confirmar precio de $1299 MXN.
  - Confirmar webhook.
  - Confirmar `purchases.product_id`.
  - Confirmar `checkout_sessions`.
  - Confirmar `outbox_emails` con `welcome-program`.
  - Confirmar acceso/entitlement.
  - Confirmar `/gracias-upsell`.

---

## Riesgos P1 — Importantes antes de escalar

### Rutas de pago fallido y pendiente ausentes

- Estado: Mitigado el 2026-06-01.
- Acción aplicada:
  - Se creó `/pago-fallido`.
  - Se creó `/pago-pendiente`.
  - `App.jsx` fue actualizado.
- Validación: ambas rutas fueron probadas visualmente.
- Riesgo residual: revisar copy después de pruebas reales con pagos rechazados o pendientes.

### Latencia de email-worker

- Estado: Mitigado por UX, pendiente optimización técnica.
- Hallazgo: el correo del Kit puede tardar aproximadamente 5 minutos por ejecución programada del worker.
- Acción aplicada:
  - `/gracias-kit` ahora explica que el correo puede tardar unos minutos.
  - Se indica revisar principal, promociones y spam.
  - Se indica escribir a soporte si no llega después de 10 minutos.
- Riesgo residual:
  - Se puede optimizar después para envío casi inmediato.
  - No tocar mientras el flujo esté estable.

### NTFY sin sonido/visibilidad suficiente

- Estado: Pendiente.
- Hallazgo: la notificación llega, pero puede no sonar o perderse si el iPhone está en uso.
- Impacto: riesgo operativo, especialmente por antecedente del caso Claudia.
- Mitigación recomendada:
  - Revisar configuración de iPhone/app ntfy.
  - Probar prioridad, canal, sonido y visibilidad.
  - Evaluar respaldo por correo administrativo o dashboard de ventas.

### Lint rojo por deuda técnica

- Estado: Pendiente.
- Riesgo: no se puede usar lint como gate obligatorio de CI.
- Impacto: regresiones silenciosas y menor calidad automática.
- Mitigación:
  - Resolver deuda por fases.
  - No mezclar con pagos ni backend crítico.
  - Activar CI primero con build, y lint como warning si es necesario.

### CI inexistente

- Estado: Pendiente.
- Riesgo: cambios llegan a producción sin gate automático.
- Impacto: regresiones silenciosas.
- Mitigación:
  - Crear GitHub Actions con `npm ci` y `npm run build`.
  - Agregar lint como no bloqueante al inicio.
  - Volverlo bloqueante cuando el lint esté limpio.

### `dist/` genera ruido al hacer build

- Estado: Pendiente.
- Hallazgo: `npm run build` modifica/regenera archivos en `dist`, incluyendo el PDF con nombre largo.
- Impacto: riesgo de commitear ruido o borrar/modificar PDF accidentalmente.
- Mitigación:
  - Definir `public/kits/kit-7-dias.pdf` como fuente oficial.
  - Dejar de depender de `dist`.
  - Revisar si `dist/` debe dejar de estar versionado.
  - Agregar estrategia clara a `.gitignore`.

---

## Riesgos P2 — Mejoras posteriores

### Bundle principal pesado

- Estado: Detectado.
- Riesgo: peor velocidad móvil.
- Impacto: posible menor conversión.
- Mitigación:
  - Code splitting.
  - Lazy loading.
  - Revisión de dependencias.
  - No atacar antes de cerrar Programa Completo y CI básico.

### Componentes preparados sin uso

- Estado: Detectado.
- Archivos:
  - `src/components/TodayPlan.jsx`
  - `src/components/navigation/ModuleHeader.jsx`
- Riesgo: ruido si se commitean sin integración.
- Impacto: bajo.
- Mitigación:
  - Dejarlos fuera del commit hasta integrarlos o eliminarlos.
  - Si se integran, hacerlo en un bloque UX separado.

### Documentación Markdown escapada

- Estado: En corrección.
- Hallazgo: algunos documentos quedaron con `\#`, `\-` o entidades como `&#x20;`.
- Impacto: baja calidad de lectura en GitHub o visores Markdown.
- Mitigación:
  - Reemplazar documentos afectados por Markdown limpio.
  - Priorizar `risk-register.md`, `architecture.md`, `legal-compliance.md` y `edge-functions-deploy.md`.

### `meta: payment` guarda payload completo de Mercado Pago

- Estado: Aceptado temporalmente.
- Riesgo: guarda payload amplio con datos operativos y posibles datos personales.
- Impacto: privacidad/ruido forense.
- Mitigación futura:
  - Reducir `meta` a campos necesarios.
  - Mantener una estrategia de auditoría.
  - Revisar política de retención.

---

## Antecedente operativo clave: Caso Claudia

El caso Claudia dejó una lección central: una venta cobrada sin entrega visible ni alerta suficientemente perceptible puede pasar desapercibida y terminar en reembolso, disculpa manual y pérdida de confianza.

Medidas aplicadas a partir de esa lección:
- Registro de compras en `purchases`.
- Estado de sesión en `checkout_sessions`.
- Cola de correos en `outbox_emails`.
- Notificación administrativa por NTFY.
- Deduplicación en `admin_notifications_log`.
- Runbooks de pagos y correo.
- UX post-pago explicando tiempos de entrega.
- Hardening mínimo de `mp-webhook-v3`.

Pendiente relacionado:
- Mejorar sonido/visibilidad de NTFY.
- Evaluar respaldo adicional para alertas críticas.
- Probar Programa Completo end-to-end antes de venderlo de forma activa.

---

## Criterio actual de salida para escalar Kit

El Kit de 7 Días puede considerarse validado técnicamente para pruebas controladas de tráfico si se mantiene:

- Pago MXN funcional.
- Consentimiento legal obligatorio.
- Webhook operativo.
- Compra registrada.
- Correo enviado.
- PDF recibido.
- NTFY recibido.
- Runbooks disponibles.
- Soporte monitoreado.

No escalar fuerte sin:
- Revisión periódica de ventas/correos.
- Prueba de NTFY audible o respaldo administrativo.
- Revisión manual diaria durante campaña inicial.