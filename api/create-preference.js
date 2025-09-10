// src/pages/api/create-preference.js

import { MercadoPagoConfig, Preference } from 'mercadopago';
import { supabase } from '../../lib/supabaseClient'; // Asegúrate que la ruta a tu cliente Supabase sea correcta

// Inicializa el cliente de Mercado Pago con tu Access Token secreto
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN 
});
const preference = new Preference(client);

export default async function handler(req, res) {
  // Solo permitir peticiones POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // (Opcional) Obtener el usuario autenticado para asociar la compra
    const { user } = req.body; // Suponemos que el frontend envía el usuario
    let payerEmail = user ? user.email : '';
    let externalReference = user ? user.id : `guest-${Date.now()}`;

    const preferenceBody = {
      items: [
        {
          id: 'kit-7',
          title: 'Kit de Inicio Reinicio Metabólico',
          description: 'Acceso digital al plan de 7 días.',
          quantity: 1,
          unit_price: 7.00,
          currency_id: 'USD', // Usamos USD como moneda base
        },
      ],
      // Información del comprador para una mejor experiencia
      payer: {
        email: payerEmail,
      },
      // URLs a las que Mercado Pago redirigirá al usuario
      back_urls: {
        success: `${process.env.APP_URL}/gracias-kit`,
        failure: `${process.env.APP_URL}/pago-fallido`,
        pending: `${process.env.APP_URL}/pago-pendiente`,
      },
      auto_return: 'approved', // Redirigir automáticamente solo si el pago es aprobado

      // La URL de nuestro webhook que recibirá las notificaciones de estado del pago
      notification_url: `${process.env.APP_URL}/api/webhooks/mercadopago?source=mp`,

      // Referencia externa para poder vincular la venta en nuestro sistema
      external_reference: externalReference,
    };

    // Crear la preferencia de pago
    const result = await preference.create({ body: preferenceBody });

    // Devolver el ID de la preferencia al frontend
    res.status(201).json({ id: result.id });

  } catch (error) {
    console.error('Error creating Mercado Pago preference:', error);
    // Capturar y mostrar errores específicos de la API de Mercado Pago si están disponibles
    const errorMessage = error.cause?.message || 'Failed to create payment preference';
    res.status(500).json({ error: errorMessage });
  }
}
