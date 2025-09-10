// CÓDIGO FINAL para: api/webhooks/checkout.js
import { supabaseAdmin } from '../../src/lib/supabaseAdmin.js';
import { Resend } from 'resend';

// Inicializamos Resend con la clave de API desde las variables de entorno
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Asumimos que el cuerpo de la notificación de Mercado Pago viene en req.body
    const notification = req.body;

    // --- 1. Validar que es una notificación de pago aprobada ---
    // (Esta lógica puede necesitar ajustarse según el formato exacto de la notificación de MP)
    if (notification.type !== 'payment' || !notification.data || !notification.data.id) {
      return res.status(200).json({ message: 'Notificación ignorada (no es un pago).' });
    }

    // --- 2. Obtener los detalles completos del pago desde Mercado Pago ---
    // (Esta parte es crucial y requiere el MP_ACCESS_TOKEN)
    const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${notification.data.id}`, {
      headers: {
        'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`
      }
    } );
    const paymentDetails = await paymentResponse.json();

    if (paymentDetails.status !== 'approved') {
      return res.status(200).json({ message: 'Pago no aprobado.' });
    }

    // --- 3. Identificar el producto y el cliente ---
    const customerEmail = paymentDetails.payer.email;
    const productName = paymentDetails.description; // O el campo que uses para el nombre del producto
    const productId = 'PRODUCTO_7_USD'; // Un identificador interno para tu producto

    // --- 4. Si es el producto correcto, proceder con la entrega ---
    if (productName.includes("Tu Identificador del Producto de $7")) { // CAMBIAR ESTO

      // --- 5. Generar un enlace de descarga seguro y temporal ---
      const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin
        .storage
        .from('productos-digitales')
        .createSignedUrl('kits/kit-reinicio-7dias.pdf', 3600 * 24 * 7); // Válido por 7 días

      if (signedUrlError) throw signedUrlError;

      // --- 6. Enviar el correo de entrega con Resend ---
      await resend.emails.send({
        from: 'Reinicio Metabólico <noreply@tudominio.com>', // CAMBIAR A TU DOMINIO VERIFICADO EN RESEND
        to: customerEmail,
        subject: '✅ Aquí está tu Guía de Reinicio Metabólico',
        html: `
          <h1>¡Gracias por tu compra!</h1>
          <p>Estamos emocionados de que comiences tu viaje de reinicio metabólico. Puedes descargar tu guía personal haciendo clic en el botón de abajo.</p>
          <a href="${signedUrlData.signedUrl}" style="background-color:#0d9488;color:white;padding:15px 25px;text-decoration:none;border-radius:8px;display:inline-block;">Descargar mi Guía Ahora</a>
          <p>Este enlace es único para ti y estará activo durante los próximos 7 días.</p>
          <p>¡Mucho éxito!</p>
        `
      });

      // --- 7. Registrar la compra en la base de datos ---
      await supabaseAdmin.from('purchases').insert({
        email: customerEmail,
        product_id: productId,
        provider: 'mercadopago',
        status: 'paid',
        meta: paymentDetails // Guardamos todos los detalles del pago por si los necesitamos
      });
    }

    // --- 8. Responder a Mercado Pago que todo salió bien ---
    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Error en el webhook:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
