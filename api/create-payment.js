// Contenido FINAL Y SEGURO para: api/create-payment.js

import { MercadoPagoConfig, Preference } from 'mercadopago';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  // Volvemos a leer la variable de entorno de forma segura
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

  if (!accessToken) {
    return response.status(500).json({ error: 'El Access Token de Mercado Pago no está configurado en el servidor.' });
  }

  // ... el resto del código se queda exactamente igual ...
  const client = new MercadoPagoConfig({ accessToken });
  const preference = new Preference(client);

  try {
    const result = await preference.create({
      body: {
        items: [
          {
            id: 'kit-reinicio-01',
            title: 'Kit de Inicio Reinicio Metabólico',
            quantity: 1,
            unit_price: 7.00,
            currency_id: 'USD',
          },
        ],
        back_urls: {
          success: 'https://reiniciometabolico.net/gracias-kit',
          failure: 'https://reiniciometabolico.net/pago-fallido',
          pending: 'https://reiniciometabolico.net/pago-pendiente',
        },
        auto_return: 'approved',
        notification_url: 'https://eohs7sbh1b6504g.m.pipedream.net',
        external_reference: 'user_id_de_prueba_12345',
      },
    } );

    return response.status(200).json({
      preferenceId: result.id,
      init_point: result.init_point,
    });

  } catch (error) {
    return response.status(500).json({
      error: 'Fallo al crear la preferencia de pago en Mercado Pago.',
      details: error.message,
    });
  }
}
