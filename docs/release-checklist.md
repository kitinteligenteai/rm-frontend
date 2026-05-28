\# Reinicio Metabólico — Checklist de Release



\## Antes de cualquier cambio

\- \[ ] Confirmar `git status`.

\- \[ ] Confirmar rama actual.

\- \[ ] Confirmar último commit estable.

\- \[ ] No tener cambios mezclados no relacionados.

\- \[ ] Identificar si el cambio toca frontend, pagos, Supabase, legal o contenido.



\## Validación frontend

\- \[ ] `npm run build` pasa.

\- \[ ] `npm run lint` revisado.

\- \[ ] Revisar visualmente Home.

\- \[ ] Revisar visualmente Login/Auth.

\- \[ ] Revisar visualmente Dashboard/Plataforma.

\- \[ ] Revisar Biblioteca.

\- \[ ] Revisar Planeador.

\- \[ ] Revisar Gimnasio.

\- \[ ] Revisar Bitácora.



\## Validación comercial

\- \[ ] CTA principal visible.

\- \[ ] Checkout no roto.

\- \[ ] Páginas de post-pago accesibles.

\- \[ ] PDF descargable disponible.

\- \[ ] Upsell no contradice oferta principal.

\- \[ ] Links legales visibles cuando existan.



\## Validación pagos/Supabase

\- \[ ] No tocar `mp-webhook-v3` sin prueba controlada.

\- \[ ] No tocar `confirm-purchase` sin prueba controlada.

\- \[ ] No ejecutar `supabase db push` sin revisar diff.

\- \[ ] Confirmar webhook Mercado Pago si hubo cambios de pago.

\- \[ ] Confirmar entrega de correo si hubo cambios post-compra.



\## Go/No-Go

\- \[ ] Build verde.

\- \[ ] Riesgos revisados.

\- \[ ] Rollback entendido.

\- \[ ] Commit con mensaje claro.

\- \[ ] Push realizado.

\- \[ ] Verificación en producción/Vercel.

