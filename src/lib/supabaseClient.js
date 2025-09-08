// Contenido DESCONTAMINADO Y SEGURO para: src/lib/supabaseClient.js

import { createClient } from '@supabase/supabase-js';

// Las credenciales se leen de forma segura desde las variables de entorno.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Se exporta la instancia de Supabase para ser usada en toda la aplicación.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
