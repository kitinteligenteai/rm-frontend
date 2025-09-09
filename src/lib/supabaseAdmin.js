// CÓDIGO para: src/lib/supabaseAdmin.js
import { createClient } from '@supabase/supabase-js';

// Este cliente NUNCA debe ser usado en el frontend. Es solo para el backend (API routes).
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // ¡LA CLAVE DE SERVICIO!
);
