// src/pages/api/webhooks/mercadopago.js

import { MercadoPagoConfig, Payment } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

// Inicializar el cliente de Supabase con la llave de SERVICIO para tener permisos de escritura.
// ¡NUNCA uses la llave de servicio en el frontend!
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Corregido a SUPABASE_SERVICE_ROLE_KEY
);

// Inicializar el cliente de Mercado Pago
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN 
});
const payment = new Payment(client);

export default async function handler(req, res) {
  // Solo procesar peticiones POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { query } = req;
    const topic = query.type || query.topic;
    const paymentId = query['data.id'];

    // 1. Ignorar notificaciones que no sean de pagos
    if (topic !== 'payment' || !paymentId) {
      console.log('Webhook received (not a payment event), ignoring.');
      return res.status(200).send('Webhook received, but ignored (not a payment).');
    }

    console.log(`Processing payment notification for ID: ${paymentId}`);

    // 2. ¡VERIFICACIÓN ACTIVA! No confiar en el webhook, consultar a la API de MP.
    const paymentDetails = await payment.get({ id: paymentId });

    // 3. ¡VERIFICACIÓN CRUCIAL! Solo actuar si el pago está APROBADO.
    if (paymentDetails?.status !== 'approved') {
      console.log(`Payment ${paymentId} not approved (status: ${paymentDetails?.status}). Ignoring.`);
      return res.status(200).send('Payment not approved.');
    }

    // 4. Extraer datos clave del pago verificado
    const email = (paymentDetails.payer.email || '').toLowerCase().trim();
    const externalReference = paymentDetails.external_reference; // El ID de usuario o de invitado
    const productId = paymentDetails.items[0]?.id || 'kit-7'; // Extraer ID del item

    if (!email) {
      console.error(`Payment ${paymentId} approved but has no payer email. Cannot grant entitlement.`);
      return res.status(200).send('Approved but no email.'); // Respondemos 200 para que MP no reintente
    }

    // 5. REGISTRAR LA COMPRA (IDEMPOTENCIA)
    // El índice único en la DB (provider, provider_payment_id) previene duplicados.
    // Si este insert falla por duplicado, el código seguirá al upsert de entitlement.
    const { error: purchaseError } = await supabaseAdmin.from('purchases').insert({
      provider: 'mp',
      provider_payment_id: String(paymentDetails.id),
      email: email,
      product_id: productId,
      status: 'approved',
      meta: paymentDetails, // Guardar todos los detalles para auditoría
    });

    if (purchaseError && purchaseError.code !== '23505') { // 23505 es el código de violación de unicidad (duplicado)
      throw new Error(`Supabase purchase insert error: ${purchaseError.message}`);
    }

    // 6. OTORGAR EL DERECHO (ENTITLEMENT)
    // Usamos upsert: si ya existe un entitlement para ese email y producto, lo actualiza.
    // Si no existe, lo crea. Esto es clave para la robustez.
    const { error: entitlementError } = await supabaseAdmin
      .from('entitlements')
      .upsert(
        {
          email: email,
          user_id: externalReference.startsWith('guest-') ? null : externalReference, // Asocia el user_id si no es invitado
          product_id: productId,
          status: 'active',
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'email,product_id', // La combinación que debe ser única
        }
      );

    if (entitlementError) {
      throw new Error(`Supabase entitlement upsert error: ${entitlementError.message}`);
    }

    console.log(`Successfully processed and granted entitlement for payment ${paymentId} to ${email}`);

    // 7. Responder a Mercado Pago con un 200 OK para que sepa que recibimos la notificación.
    res.status(200).json({ success: true });

  } catch (error) {
    console.error('!!! CRITICAL Webhook processing error:', error.message);
    // Respondemos 200 para evitar que Mercado Pago reintente indefinidamente un webhook que falla por un error nuestro.
    // Usaremos logs y el cron job de reconciliación para capturar estos fallos.
    res.status(200).json({ success: false, error: error.message });
  }
}
