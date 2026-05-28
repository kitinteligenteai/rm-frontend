\# Reinicio Metabólico — Registro de Riesgos



\## Riesgos P0 — Bloquean comercialización seria



\### RLS / permisos Supabase no auditados

\- Estado: Pendiente confirmar

\- Riesgo: tablas sensibles accesibles con permisos amplios.

\- Impacto: exposición de compras, correos o sesiones.

\- Mitigación: auditoría solo lectura de RLS, policies y grants antes de cambios SQL.



\### Webhook Mercado Pago no auditado recientemente

\- Estado: Pendiente confirmar

\- Riesgo: pagos aprobados sin registro, duplicados o estados inconsistentes.

\- Impacto: pérdida de ventas, soporte manual, mala experiencia.

\- Mitigación: revisar `mp-webhook-v3`, índices únicos y prueba sandbox/real.



\### Legal visible incompleto

\- Estado: Pendiente implementar

\- Riesgo: venta de producto de bienestar sin términos, privacidad, devoluciones y disclaimer visibles.

\- Impacto: riesgo comercial/legal.

\- Mitigación: crear páginas legales y enlaces en footer/checkout.



\### Consentimiento no confirmado

\- Estado: Pendiente confirmar

\- Riesgo: no poder demostrar aceptación de términos/privacidad.

\- Impacto: menor trazabilidad comercial.

\- Mitigación: tabla o mecanismo de consentimiento versionado.



\## Riesgos P1 — Importantes antes de escalar



\### CI inexistente

\- Estado: Pendiente implementar

\- Riesgo: cambios llegan a producción sin gate automático.

\- Impacto: regresiones silenciosas.

\- Mitigación: GitHub Actions con `npm ci`, `npm run build`, `npm run lint` y `npm test --if-present`.



\### Lint rojo por deuda técnica

\- Estado: Detectado

\- Riesgo: dificulta usar lint como gate inmediato.

\- Impacto: menor calidad automática.

\- Mitigación: resolver por fases, no mezclar con pagos.



\### Runbooks inexistentes

\- Estado: Pendiente implementar

\- Riesgo: incidentes de pago/correo sin procedimiento.

\- Impacto: soporte lento y errores manuales.

\- Mitigación: crear runbooks de pagos, correo y caídas.



\## Riesgos P2 — Mejoras posteriores



\### Bundle principal pesado

\- Estado: Detectado

\- Riesgo: peor velocidad móvil.

\- Impacto: posible menor conversión.

\- Mitigación: code splitting y revisión de dependencias después de blindaje P0/P1.



\### Componentes preparados sin uso

\- Estado: Detectado

\- Archivos:

&#x20; - `src/components/TodayPlan.jsx`

&#x20; - `src/components/navigation/ModuleHeader.jsx`

\- Riesgo: ruido si se commitean sin integración.

\- Impacto: bajo.

\- Mitigación: dejarlos fuera del commit hasta integrarlos o eliminarlos.

