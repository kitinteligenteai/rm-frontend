\# Reinicio Metabólico — Deploy de Supabase Edge Functions



\## Objetivo



Documentar cómo desplegar Edge Functions críticas sin romper producción.



\## Regla crítica



La función `mp-generate-preference-v2` debe desplegarse con JWT desactivado porque el checkout público ocurre antes de que el usuario tenga sesión iniciada.



Si se despliega sin `--no-verify-jwt`, Supabase puede responder:



```json

{"code":"UNAUTHORIZED\_NO\_AUTH\_HEADER","message":"Missing authorization header"}

```



Eso rompería el inicio del checkout desde el frontend.



\## Función crítica



```text

supabase/functions/mp-generate-preference-v2/index.ts

```



\## Comando correcto de deploy



```powershell

npx supabase functions deploy mp-generate-preference-v2 --project-ref mgjzlohapnepvrqlxmpo --no-verify-jwt

```



\## Validación negativa esperada



La función debe rechazar solicitudes sin consentimiento legal.



```powershell

'{"productId":"kit-7-dias"}' | Set-Content -Encoding utf8 test-no-consent.json

curl.exe -i -X POST "https://mgjzlohapnepvrqlxmpo.functions.supabase.co/mp-generate-preference-v2" -H "Content-Type: application/json" --data-binary "@test-no-consent.json"

Remove-Item test-no-consent.json

```



Respuesta esperada:



```json

{"error":"legal\_consent\_required"}

```



\## Validación positiva esperada



Con consentimiento legal válido, la función debe responder `200 OK` y devolver `preferenceId` e `initPoint`.



```powershell

@'

{

&#x20; "productId": "kit-7-dias",

&#x20; "legalConsent": {

&#x20;   "accepted": true,

&#x20;   "termsVersion": "terminos-2026-05-28",

&#x20;   "privacyVersion": "privacidad-2026-05-28",

&#x20;   "refundsVersion": "devoluciones-2026-05-28",

&#x20;   "consentedAt": "2026-05-28T20:15:00.000Z"

&#x20; }

}

'@ | Set-Content -Encoding utf8 test-consent.json



curl.exe -i -X POST "https://mgjzlohapnepvrqlxmpo.functions.supabase.co/mp-generate-preference-v2" -H "Content-Type: application/json" --data-binary "@test-consent.json"



Remove-Item test-consent.json

```



Respuesta esperada:



```json

{

&#x20; "preferenceId": "...",

&#x20; "initPoint": "..."

}

```



No abrir el `initPoint` salvo que se vaya a hacer una prueba de pago controlada.



\## Validación en Supabase



Después de una prueba positiva, revisar que exista registro en `legal\_consents`.



```sql

select session\_id, product\_id, terms\_version, privacy\_version, refunds\_version, consented\_at, created\_at

from public.legal\_consents

order by created\_at desc

limit 5;

```



También revisar que `checkout\_sessions.raw\_mp` guarde copia del consentimiento.



```sql

select id, preference\_id, payment\_id, status, raw\_mp, created\_at

from public.checkout\_sessions

order by created\_at desc

limit 5;

```



\## Marcar sesiones de prueba



Si se crea una preferencia solo para validar el flujo, marcarla como prueba para no contaminar métricas.



```sql

update public.checkout\_sessions

set raw\_mp = raw\_mp || jsonb\_build\_object(

&#x20; 'test\_record', true,

&#x20; 'test\_reason', 'legal\_consent\_validation'

)

where id = 'SESSION\_ID\_AQUI';



update public.legal\_consents

set meta = coalesce(meta, '{}'::jsonb) || jsonb\_build\_object(

&#x20; 'test\_record', true,

&#x20; 'test\_reason', 'legal\_consent\_validation'

)

where session\_id = 'SESSION\_ID\_AQUI';

```



\## Reglas de seguridad



\- No desplegar `mp-generate-preference-v2` sin `--no-verify-jwt`.

\- No enviar precios desde frontend.

\- No exponer `SUPABASE\_SERVICE\_ROLE\_KEY`.

\- No cambiar `mp-webhook-v3` en el mismo despliegue.

\- No mezclar cambios de UX con cambios de pagos.

\- Después de cada deploy, probar rechazo sin consentimiento.

\- Documentar cualquier prueba en `docs/legal-compliance.md` o runbooks.



\## Última validación conocida



Fecha: 2026-05-28



Resultado:



\- Deploy con `--no-verify-jwt`: OK.

\- Sin consentimiento: `legal\_consent\_required`.

\- Con consentimiento: crea `preferenceId` e `initPoint`.

\- Registro en `legal\_consents`: OK.

\- Registro en `checkout\_sessions.raw\_mp.legal\_consent`: OK.



\## Comando de deploy usado



```powershell

npx supabase functions deploy mp-generate-preference-v2 --project-ref mgjzlohapnepvrqlxmpo --no-verify-jwt

```

