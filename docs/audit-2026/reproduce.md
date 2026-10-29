# Reproducir las verificaciones

Node 24 o posterior (los tests usan importación de TypeScript y node:test). Instalar dependencias solo después de revisar código y lockfile. No hacen falta secretos para las pruebas locales.

```sh
npm ci --ignore-scripts
npm test
npx playwright install --with-deps chromium webkit
npm run test:e2e
VITE_SUPABASE_URL=https://rm-test.invalid VITE_SUPABASE_ANON_KEY=test-public-key npm run build
```

Playwright levanta Vite con un backend de dominio `.invalid`. Intercepta las solicitudes externas y bloquea pagos, correos y analítica reales. Para capturas con las imágenes originales, preparar una carpeta local con las 12 ilustraciones del bucket público y pasar `RM_GYM_ASSET_DIR=/ruta/a/imagenes`; las pruebas sin esa carpeta verifican comportamiento con las respuestas de red simuladas, no certifican disponibilidad de las imágenes en producción.

Las pruebas de SQL usan PGlite (PostgreSQL embebido): construyen un esquema mínimo con los campos, restricciones, roles y políticas relevantes observados y aplican la migración nueva. No reconstruyen todos los servicios Supabase ni ejecutan el historial antiguo de migraciones. SKIP LOCKED se prueba con reclamos secuenciales y se valida su uso en SQL; concurrencia multiinstancia real queda pendiente en staging.

Los handlers se cargan con clientes/HTTP simulados. Comprobar el cuerpo y el orden de las operaciones no sustituye una venta de sandbox del proveedor ni una entrega real de Resend.

Para regenerar el PDF candidato (PyMuPDF, ReportLab y fuentes DejaVu):

```sh
git show 7689d03f2d69d70ca06859f4a559ace3ed10b028:public/kits/kit-7-dias.pdf > /tmp/rm-kit-base.pdf
python3 scripts/revise-kit-pdf.py /tmp/rm-kit-base.pdf /tmp/RM_Kit_7_Dias_Revision_2026.pdf
```

El candidato se entrega por separado con las evidencias. No se publica en `/public` ni se sube al bucket durante la auditoría.

No ejecutar `supabase db push` sobre el conjunto de migraciones sin reconciliar los prefijos históricos. `config.release.toml` es una propuesta de configuración, no una orden de despliegue.
