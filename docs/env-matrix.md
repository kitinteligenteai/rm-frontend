\# Reinicio Metabólico — Matriz de Variables de Entorno



\## Objetivo

Documentar variables necesarias para operar el sistema sin exponer secretos.



> No pegar valores reales de claves, tokens ni secrets en este archivo.



| Variable | Uso | Entorno | Dueño | Crítica | Estado |

|---|---|---|---|---|---|

| VITE\_SUPABASE\_URL | URL pública Supabase frontend | Vercel / local | Frontend | Sí | Pendiente confirmar |

| VITE\_SUPABASE\_ANON\_KEY | Llave pública anon frontend | Vercel / local | Frontend | Sí | Pendiente confirmar |

| SUPABASE\_SERVICE\_ROLE\_KEY | Acceso privilegiado backend | Supabase Functions | Backend | Crítica | Pendiente confirmar |

| MP\_ACCESS\_TOKEN | API Mercado Pago | Supabase Functions | Pagos | Crítica | Pendiente confirmar |

| RESEND\_API\_KEY | Envío correos transaccionales | Supabase Functions | Email | Crítica | Pendiente confirmar |

| NTFY\_TOPIC\_URL | Notificaciones admin | Supabase Functions | Operación | Media | Pendiente confirmar |

| SITE\_URL | URL pública del sitio | Vercel / scripts | Frontend | Media | Pendiente confirmar |



\## Reglas

\- Nunca usar `SUPABASE\_SERVICE\_ROLE\_KEY` en frontend.

\- Nunca commitear `.env.local`.

\- Variables públicas de Vite deben iniciar con `VITE\_`.

\- Secrets críticos viven en Supabase o Vercel, no en código.

\- Rotar secrets si hubo exposición accidental.



\## Pendiente de auditoría

\- Comparar variables usadas en repo contra Vercel.

\- Comparar secrets usados en Edge Functions contra Supabase.

\- Confirmar que Mercado Pago usa credenciales correctas de producción/sandbox según entorno.

