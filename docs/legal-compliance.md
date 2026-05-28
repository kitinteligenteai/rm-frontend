\# Reinicio Metabólico — Legal / Compliance Web



\## Estado

Bloque implementado el 2026-05-28.



\## Páginas legales públicas

\- `/terminos`

\- `/privacidad`

\- `/devoluciones`



\## Archivos creados

\- `src/pages/Terminos.jsx`

\- `src/pages/Privacidad.jsx`

\- `src/pages/Devoluciones.jsx`

\- `src/components/common/LegalFooter.jsx`



\## Archivos modificados

\- `src/App.jsx`

\- `src/pages/Home.jsx`

\- `src/pages/Programa.jsx`

\- `scripts/generate-sitemap.mjs`

\- `public/sitemap.xml`

\- `src/components/SmartCheckoutCTA.jsx`

\- `src/components/common/MercadoPagoButton.jsx`

\- `supabase/functions/mp-generate-preference-v2/index.ts`



\## Consentimiento trazable

Se creó la tabla `public.legal\_consents` en Supabase con RLS activo.



Permisos:

\- `anon`: sin acceso directo.

\- `authenticated`: sin acceso directo.

\- `service\_role`: acceso backend.



El consentimiento se registra desde la Edge Function `mp-generate-preference-v2`.



\## Versiones legales actuales

\- Términos: `terminos-2026-05-28`

\- Privacidad: `privacidad-2026-05-28`

\- Devoluciones: `devoluciones-2026-05-28`



\## Validación realizada

\- Sin consentimiento, `mp-generate-preference-v2` responde `legal\_consent\_required`.

\- Con consentimiento, crea `preferenceId` e `initPoint`.

\- Se registra fila en `legal\_consents`.

\- Se vincula con `session\_id`.

\- `checkout\_sessions.raw\_mp` guarda copia del consentimiento.

\- La prueba quedó marcada como `test\_record`.



\## Nota de despliegue

La función `mp-generate-preference-v2` debe estar desplegada con JWT desactivado porque el checkout público inicia antes de que el usuario tenga sesión.



Comando usado:



```powershell

npx supabase functions deploy mp-generate-preference-v2 --project-ref mgjzlohapnepvrqlxmpo --no-verify-jwt

