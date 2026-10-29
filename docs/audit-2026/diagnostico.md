# Reinicio Metabólico — auditoría y recuperación 2026

Fecha de referencia: 28 octubre 2026, America/Monterrey. Base GitHub: `7689d03f2d69d70ca06859f4a559ace3ed10b028`. Rama de revisión: `work/rm-launch-audit-2026`.

**Decisión: NO APTO todavía para lanzamiento masivo.** Hay correcciones preparadas y pruebas locales. Las protecciones productivas siguen como se encontraron: esta rama no cambia la base, las funciones desplegadas, los precios ni main. No se ejecutó ningún cobro ni envío real.

## Qué se inspeccionó realmente

- Repositorio público completo y metadatos GitHub; historial de 269 commits y 532 blobs candidatos para patrones de secretos.
- Supabase `mgjzlohapnepvrqlxmpo`: catálogo de tablas/permisos, políticas, vistas, funciones privilegiadas, índices, triggers, buckets/objetos, advisors de seguridad y agregados sin datos personales.
- Código desplegado de confirm-purchase v32, MP preference v64, MP webhook v57, email-worker-v2 v53, set-upsell-email v2 y mantenimiento v14. Resend webhook v14 aparece activo, pero recuperar su código desplegado falló dos veces; se revisó y corrigió su versión del repositorio, sin certificar identidad con la versión desplegada.
- HTML del sitio público y PDF actual de 25 páginas. El PDF descargado coincide con el de HEAD, no se sustituyó por el adjunto histórico.
- 12 ilustraciones de gimnasio descargadas e inspeccionadas; 61 objetos de recetas y 61 registros culinarios. No se generaron imágenes nuevas.
- Vercel identifica `rm-frontend` / `prj_U9x1bMCjKSZ0HafZbQF9djpFVa04`; consultar configuración/despliegues devuelve 403 por falta de autorización al equipo. No se inspeccionaron ni exportaron secretos Vercel. La identidad exacta del commit desplegado queda pendiente.
- Se consultó el changelog actual de Supabase y documentación oficial de RLS, firmas MP, idempotencia de correo y configuración Git de Vercel.

## P0 — impiden publicar

| ID | Evidencia vigente | Riesgo | Preparación en rama / pendiente |
|---|---|---|---|
| SEC-01 | `sales_dashboard` usa privilegios del propietario y anon tiene SELECT | Lectura potencial de correos, pagos y estados saltando RLS de tablas | Revocar acceso de navegador y convertir a invoker; SQL probado localmente, NO aplicado |
| SEC-02 | Siete funciones SECURITY DEFINER ejecutables por anon/authenticated; incluye creación de compra y modificación de correo | Operaciones de pago/acceso privilegiadas desde API pública | Revocar EXECUTE de navegador, fijar search_path y mantener solo service_role; NO aplicado |
| SEC-03 | `update_checkout_email_final` no exige compra aprobada antes de activar entitlement | Acceso premium sin prueba de aprobación | Confirmación transaccional exige approved, producto reconocido y correo inmutable; handler verifica token y pago con MP |
| SEC-04 | `ProtectedRoute` solo valida sesión | Cualquier cuenta puede entrar a módulos premium | Compra activa exacta de programa-completo y fallo de consulta cierran acceso; Kit accede a Mis Compras |
| PAY-01 | Webhook MP desplegado declara no validar firma; no coteja importe/moneda con sesión | Notificaciones no autenticadas y asociación insuficiente de pagos | HMAC/timestamp, consulta actual al proveedor y cotejo de sesión/producto/importe/moneda/modo; NO desplegado |
| DELIVERY-01 | PDF en `/kits/kit-7-dias.pdf` y bucket productos-digitales público | Descarga accesible sin compra | Endpoint de descarga con compra/token o sesión autorizada y URL firmada; PDF público retirado de rama. Privacidad del bucket debe coordinarse explícitamente |
| CLIN-01 | PDF/Dante sugieren sal, ayuno y cambios amplios sin precauciones suficientes | Riesgo para diabetes/SGLT2, embarazo, enfermedad renal/cardiovascular | Contenido activo revisado y candidato PDF de 25 páginas. Revisar/aprobar antes de reemplazar el producto |
| RELEASE-01 | No hay entorno aislado con credenciales de prueba verificado; Gumroad no tiene webhook/entitlement visible en el repo ni entre las ocho funciones activas | Cobrar no demuestra que el comprador reciba y utilice el producto | Integración real en sandbox y prueba de entrega/activación pendientes. Ausencia de código no prueba que no exista entrega configurada dentro de Gumroad |

No se explotó ninguna función productiva ni se leyó un listado de clientes como visitante para demostrar el riesgo. Los hallazgos de exposición se basan en permisos y definiciones reales.

## P1 — funcionamiento y continuidad

| ID | Antes | Cambio preparado |
|---|---|---|
| DATA-01 | checkout_sessions, outbox_emails y admin_notifications_log sin RLS, con permisos directos ya revocados | RLS adicional sin abrir políticas de navegador |
| DATA-02 | my_entitlements como vista de propietario, aunque filtra por usuario/correo | Invoker con SELECT subyacente y política de propietario existente |
| MAIL-01 | Worker lee queued sin reclamar en transacción; sin Idempotency-Key ni provider_message_id guardado | Claim con SKIP LOCKED, intentos acotados, cuerpo persistido, clave estable Resend y estado de reconciliación |
| MAIL-02 | Webhook Resend del repo acepta cuerpo sin firma y registra payload completo | Validación de cuerpo crudo/Svix, sin log de datos personales; versión productiva no pudo recuperarse |
| MAIL-03 | Endpoint de mantenimiento sin JWT y endpoint alterno de correo | Retirar rutas heredadas en rama; coordinar cron antes de desplegar |
| UX-01 | Día/fases derivados de tiempo y demasiadas acciones simultáneas | Una acción principal, tres tareas y 28 días basados en marcas guardadas; recuperación tras ausencia |
| UX-02 | Navegación de herramientas no disponible en móvil | Enlaces móviles a los ocho módulos existentes |
| GYM-01 | Selección inicial de equipo nula, variantes ausentes, 27 referencias Vimeo provisionales | Rutinas base con variantes completas de peso corporal, sin falsos videos; alternativas e instrucciones |
| GYM-02 | Marcas desaparecen al recargar y temporizador sensible a cambios | Estado por cuenta, dos vueltas, temporizador con hora límite, pausa/reinicio y fase de descanso |
| PLAN-01 | Menú en localStorage compartido entre cuentas, JSON corrupto rompe carga | Caché por usuario y guardado de secciones en program_state; errores de carga impiden sobrescribir estado desconocido |
| LOG-01 | Bitácora anuncia éxito ignorando errores de Supabase; cálculo de pérdida con signo inverso | Errores visibles conservan formulario, validación numérica, historial con fecha conservada y diferencia correcta |
| ENV-01 | Frontend y notification_url contenían referencias fijas al backend productivo | Endpoints derivados del entorno y PUBLIC_SITE_URL obligatorio para checkout/correo; pruebas aisladas no deben caer a producción |
| AUTH-01 | Recuperación depende solo del hash, puede rechazar sesión ya consumida | Validación de sesión real, PASSWORD_RECOVERY/PKCE y ruta de recuperación accesible |
| COPY-01 | +100 recetas, drag & drop, favoritos, duración anual y vitalicia contradictorias | Promesas ajustadas a 61 recetas y herramientas presentes; duración contractual pendiente de decisión explícita |

## P2 — mantenimiento y límites

- Auditoría npm: 37 avisos al inicio (1 crítico, 21 altos, 11 moderados, 4 bajos); después de actualizar versiones compatibles y retirar SDKs sin uso: 4 bajos, sin críticos/altos/moderados. Los bajos restantes pertenecen a deepmerge/workbox; no se aplicó el downgrade forzado sugerido por npm.
- Build correcto; persiste advertencia de chunk principal >500 kB. Se dividieron módulos por ruta, sin convertir el proyecto en otra arquitectura.
- Lint de los componentes nuevos y del núcleo modificado pasa. El lint global heredado contiene errores fuera de ese alcance y no se declara aprobado.
- Advisors productivos: contraseña filtrada no protegida, versión Postgres con parches pendientes y pg_net en public. Cambios administrativos pendientes, no ejecutados.
- No se confirmó service_role, clave privada MP ni Resend privada en los patrones analizados. El JWT del respaldo era anon; la clave MP identificada era pública; el pooler contenía un marcador de contraseña. Se retiraron respaldos de la rama. El historial sigue disponible; el escaneo por patrones no garantiza ausencia de cualquier secreto.
- El bucket gimnasio es público y algunas imágenes son grandes. Las 12 se conectaron sin crear nuevas. La imagen de marcha repite la postura en ambas mitades: se aclara que debe alternarse siguiendo el texto. Los rótulos de lagartija de pared no corresponden perfectamente al orden de sus posturas. No equivalen a una revisión profesional de técnica.
- La sincronización de planner/gym usa última escritura por sección; no hay edición simultánea con resolución de conflictos. Los cambios sin sincronizar se avisan y conservan en ese navegador cuando el almacenamiento lo permite.
- La confirmación posterior al pago exige el token conservado en el navegador que inició checkout. Cambios de navegador/app pueden requerir soporte; este recorrido móvil debe validarse con MP antes de vender.
- Alertas Bark/NTFY se conservan como notificación administrativa con deduplicación y estado de revisión para fallos; su entrega real no fue ejecutada.
- La protección de rutas no constituye DRM: los contenidos estáticos mostrados al navegador pueden copiarse. Los permisos de datos personales y la autorización de descargas se comprueban en servidor/DB.
- Crear enlaces de recuperación y guardarlos en outbox implica conservar temporalmente una capacidad de acceso; la tabla y sus payloads quedan solo para service_role. Definir retención/redacción tras confirmar entrega antes de operar a escala.

## Antes / después verificable

| Recorrido | Producción/base inspeccionada | Rama |
|---|---|---|
| Acceso | Sesión bastaba | Sesión + entitlement activo exacto |
| Confirmación | Correo podía activar acceso sin approved | Token + consulta MP + transacción approved |
| Comprador Kit | PDF público; podía navegar premium con cuenta | Mis Compras accesible; premium denegado; descarga autorizada |
| Retorno tras ausencia | Calendario empujaba fases | Continúa desde tareas guardadas |
| Gimnasio | Sin imágenes y progreso volátil | 12 ilustraciones, rutinas sin saltos obligatorios, marcas por cuenta |
| Planeador | Caché global del dispositivo | Caché por cuenta + guardado remoto preparado |
| Salud | Sal/ayuno y garantías metabólicas | Límites claros y orientación general con fuentes |

Las capturas antes/después usan una cuenta ficticia y servicios simulados. No contienen datos de compradores. Comparan la versión base con la rama local; no son capturas de una nueva publicación.
