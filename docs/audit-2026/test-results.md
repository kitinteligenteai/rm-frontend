# Evidencia de pruebas

Fecha de referencia: 28 octubre 2026 (America/Monterrey). Resultado local de la rama, no certificación productiva.

| Verificación ejecutada | Resultado | Alcance real |
|---|---|---|
| `npm test` | 21/21 aprobadas | PostgreSQL embebido/PGlite, reglas de pago y firmas, handlers con dependencias simuladas |
| Playwright Chromium móvil | 17/17 aprobadas | Viewport de iPhone, backend simulado, bloqueo de tráfico externo de escritura |
| Playwright WebKit móvil | 17/17 aprobadas | Motor WebKit de prueba; no dispositivo iPhone físico |
| `npm run build` | Aprobado | Vite/PWA; advertencia de chunk >500kB pendiente |
| ESLint del núcleo nuevo/modificado | Aprobado | Hook de persistencia, contexto, guard, panel, Dante, timer, gimnasio, planeador, bitácora y descarga |
| `npm run lint` global | No aprobado | Errores heredados en componentes/configuración fuera del núcleo; no se oculta el resultado |
| `npm audit` tras correcciones | 4 bajos | 0 críticos, 0 altos, 0 moderados; inicialmente 37 avisos |
| PDF candidato | 25 páginas renderizadas; secciones modificadas revisadas visualmente | No publicado; conserva las 21 recetas del documento base |
| Imágenes de gimnasio | 12 objetos descargados e inspeccionados | Mapeo explícito; no se fabricaron videos ni nuevas imágenes |

## Qué comprueban los tests

- Visitante → login; cuenta sin compra/Kit/revocada → denegación premium; error de entitlements → acceso cerrado.
- SQL: RLS y privilegios; pago pendiente/rechazado sin entitlement; rechazo de importe/moneda/producto/referencia incorrectos; aprobación y confirmación repetidas sin duplicar correo; Kit autoriza solo Kit; reembolso revoca.
- Separación entre cuentas y preservación de planner al guardar gym y viceversa.
- Reclamo de trabajos sin reclamo duplicado secuencial y límite de intentos. Concurrencia multiinstancia real aún pendiente.
- Firmas MP y Resend válidas, manipuladas, ausentes o vencidas; consulta al proveedor antes de confirmar; API de mantenimiento retirada; worker sin credencial rechazado.
- Cabecera de idempotencia Resend estable y tratamiento del error de proveedor. No se envió correo real.
- Panel basado en tareas, no antigüedad de cuenta; regreso tras siete días simulados; fallo de guardado sin progreso falso.
- Gimnasio: imágenes, series guardadas, pausa/reinicio, rutinas sin impacto obligatorio y estado recuperable en otro contexto sin caché local.
- Planeador editable y persistente; fallo de carga sin copia local impide sobrescribir datos desconocidos.
- Bitácora conserva formulario ante error; recuperación valida sesión y hace PUT de nueva contraseña; petición de recuperación y enlace vencido.
- Landing/legal/estados y todos los módulos privados sin excepciones de runtime en los recorridos probados; sin desbordamiento horizontal en esos viewports.

## Fallos detectados y corregidos durante QA

- Botones del temporizador cambiaban de posición en WebKit: se estabilizaron dimensiones; prueba repetida aprobada.
- Se encontró posibilidad de sobrescribir estado remoto desconocido tras fallo de carga: ahora bloquea edición y permite recargar datos.
- Avisos npm críticos/altos/moderados: actualización compatible, eliminación de dependencias sin uso y override del parser vulnerable; cuatro bajos conservados sin downgrade forzado.
- Tras una interrupción faltaban binarios del navegador. Se restauraron y se completó una nueva ejecución de 34/34. Los fallos de arranque del entorno no se contaron como verificaciones del producto.

## Cobertura pendiente: no se declara aprobada

- MP sandbox real con credenciales del comercio, aprobación/rechazo/pendiente, webhook auténtico, reintentos y reembolso.
- Gumroad: checkout USD, entrega y activación real del Programa.
- Resend: entrega a bandeja de entrada, rebotes y eventos reales, reclamación concurrente con varias instancias y fallo ambiguo después de envío.
- Auth Supabase real: lista de redirecciones, correo de recuperación, enlace caducado/reutilizado y creación de comprador nuevo/existente.
- Storage privado real y descarga del PDF correcto, más migración de enlaces antiguos.
- Safari de iPhone físico y transición navegador interno → app MP → Safari conservando o recuperando el token.
- Aplicación de SQL y RLS sobre una copia aislada completa, con catálogo y datos sintéticos representativos del esquema productivo; no solo el esquema mínimo del test.
- Vercel: identidad exacta del commit desplegado y configuración de entorno, bloqueados por autorización del equipo.

No se crearon usuarios, pagos, correos ni registros de QA en producción. Los datos de las capturas son ficticios.

PDF base SHA-256: `8560e01d301ea6de8ac228380d2a07ef1485198cd1b2d251848c8f4c7a86055d`.
PDF candidato SHA-256: `384b7660aedd3754f92c153604276079a98cd799395e9cb3b0169a448d09db83`.
