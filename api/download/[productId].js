// Contenido COMPLETO y LISTO para: src/pages/api/download/[productId].js

import { createClient } from '@supabase/supabase-js';

// Usamos la llave de servicio para poder consultar entitlements de forma segura
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // 1. Obtener el token del usuario desde la cabecera de la petición
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return res.status(401).json({ error: 'No token provided. Access denied.' });
    }

    // 2. Verificar el token para obtener los datos del usuario
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token. Access denied.' });
    }

    // 3. Obtener el ID del producto desde la URL (ej: /api/download/kit-7)
    const { productId } = req.query;
    const userEmail = user.email.toLowerCase();

    // 4. VERIFICAR EL DERECHO: ¿Tiene este usuario un entitlement activo para este producto?
    const { data: entitlement, error: entitlementError } = await supabaseAdmin
      .from('entitlements')
      .select('id, status')
      .eq('email', userEmail)
      .eq('product_id', productId)
      .eq('status', 'active') // Solo buscar derechos activos
      .single(); // .single() espera un solo resultado o ninguno

    if (entitlementError || !entitlement) {
      console.warn(`Download attempt denied for user ${userEmail} on product ${productId}. No active entitlement found.`);
      return res.status(403).json({ error: 'No tienes permiso para descargar este producto.' });
    }

    // 5. GENERAR URL SEGURA: Si tiene permiso, crear una URL firmada y de corta duración.
    // OJO: Recuerda que tu bucket se llama 'productos-digitales' y el archivo está en 'Kit-reinicio-7dias.pdf'
    const filePath = `Kit-reinicio-7dias.pdf`; // Ajusta esto si la ruta o nombre del archivo cambia
    
    const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin
      .storage
      .from('productos-digitales') // Nombre de tu bucket
      .createSignedUrl(filePath, 60); // La URL es válida por 60 segundos

    if (signedUrlError) throw signedUrlError;

    // 6. Devolver la URL segura al frontend
    return res.status(200).json({ url: signedUrlData.signedUrl });

  } catch (e) {
    console.error('Download endpoint error:', e);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
}
