// Contenido completo y corregido para: rm-frontend/src/lib/supabaseClient.js

import { createClient } from '@supabase/supabase-js';

// Las credenciales deben ser strings (texto entre comillas)
const supabaseUrl = 'https://mgjzlohapnepvrqlxmpo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nanpsb2hhcG5lcHZycWx4bXBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4OTk1MjUsImV4cCI6MjA3MTQ3NTUyNX0.h3xP2g38seYxtLz0LZkk76OoJASM_8i_PUwvtNvuHeo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey );
