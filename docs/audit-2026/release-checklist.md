# Puerta objetiva de lanzamiento

**Estado: BLOQUEADO. No fusionar/aplicar/desplegar como un cambio aislado de frontend.**

## Preparado y comprobable sin tocar producción

- [x] Inspección real del catálogo/permisos de Supabase y código desplegado accesible.
- [x] Correcciones de seguridad y UX en rama; main preservada.
- [x] SQL probado en PostgreSQL embebido con roles/RLS, no contra datos reales.
- [x] Pruebas de handlers con dependencias simuladas, sin pagos ni correos reales.
- [x] Evidencia móvil con cuenta ficticia y revisión visual.
- [x] PDF candidato revisado, sin subir al producto.
- [x] Precios conservados: Kit US$7/MXN139; Programa US$75/MXN1299.
- [x] Configuración en rama para impedir su despliegue Git automático en Vercel.

## Antes de autorizar una prueba real de lanzamiento

- [ ] Autorizar acceso de lectura a equipo Vercel y confirmar proyecto, dominio, commit y variables por nombre/entorno; no exportar valores secretos.
- [ ] Disponer de backend de pruebas aislado. No usar credenciales LIVE en previews ni pruebas que escriban en producción. Si crear el entorno cuesta, aprobar coste antes de crearlo.
- [ ] Resolver historial de migraciones: hay archivos antiguos con prefijos `9999` y snapshots. No ejecutar `db push` indiscriminadamente sobre esta rama.
- [ ] Aplicar solo la migración de auditoría en staging y repetir advisors/permisos/RLS reales por API.
- [ ] Configurar PUBLIC_SITE_URL del entorno aislado, PAYMENT_ENV=test, PAYMENTS_ENABLED=true y credenciales MP TEST en staging, más MP_WEBHOOK_SECRET y RESEND_WEBHOOK_SECRET correctos. Confirmar allowlist de redirección Auth.
- [ ] Probar approved/rejected/pending, reintentos duplicados, notificaciones fuera de orden y reembolso en sandbox. Guardar IDs de prueba y evidencia sin secretos.
- [ ] Verificar transacción: una compra aprobada → un entitlement correcto → un trabajo de correo; Kit nunca autoriza Programa.
- [ ] Probar Resend con destinatario de prueba autorizado: enviado, entregado, rebote, reintento, concurrencia, fallo ambiguo y reconciliación. El worker exige service-role; actualizar cron de forma coordinada.
- [ ] Verificar que una cuenta nueva recibe enlace, crea contraseña y entra; una cuenta existente conserva su acceso y puede recuperar contraseña. Enlace caducado debe permitir reenvío.
- [ ] Probar devolución desde la app de MP, Safari y navegador interno de anuncio. Validar que conservar el token no bloquea compradores móviles; definir recuperación si cambian de navegador.
- [ ] Validar de forma independiente Gumroad USD: producto/importe correctos, entrega del Kit, activación y entitlement del Programa. No hay integración verificable en esta rama que cierre ese flujo.
- [ ] Aprobar candidato de PDF y su coherencia culinaria/editorial. Subirlo al bucket privado de staging, generar descarga y comprobar PDF real, no HTML.
- [ ] Coordinar bucket privado + endpoint + plantilla de correo + retirada del PDF público + recuperación para compradores anteriores. Comprobar que la antigua URL web y la antigua URL pública de Storage ya no entregan PDF.
- [ ] Reconciliar compras históricas sin accesos correctos, sin modificar usuarios durante la auditoría. Cifras existentes pueden incluir pruebas; no asumir ventas reales.
- [ ] Decidir duración de acceso y condiciones contractuales: el sitio mezclaba anual/vitalicio sin expiración en entitlements. La rama evita repetir la contradicción, pero no redefine el contrato.
- [ ] Acordar lote piloto/inversión publicitaria. Ningún precio ni compromiso comercial nuevo fue aprobado por este trabajo.

## Liberación productiva (requiere autorización expresa separada)

1. Registrar commit exacto, respaldo privado, checks, plan de reversión y ventana.
2. Aprobar por separado SQL/políticas, funciones/secrets/cron y frontend/PDF. No liberar solo una de las partes.
3. Aplicar controles críticos, desplegar lo aprobado y comprobar advisors. No dejar una función alternativa antigua abierta.
4. Validar el recorrido acordado y el soporte sin improvisar cobros LIVE.
5. Observar errores, correo y soporte durante el piloto. Escalar publicidad solo después de evidencia de pago→entrega→acceso→uso→regreso.

## Reversión

- Revertir frontend y funciones al commit/versiones registradas si hay regresión.
- No reabrir permisos públicos peligrosos para recuperar funcionalidad.
- No borrar compras, consentimientos, usuarios ni entitlements para repetir pruebas.
- Si un envío pudo haber ocurrido, reconciliar con el proveedor antes de reintentar fuera de su ventana de idempotencia.
- Las migraciones preparadas no incluyen un rollback que vuelva a exponer vistas o RPCs.
