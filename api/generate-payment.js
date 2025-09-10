// CÓDIGO FINAL Y ROBUSTO para: api/generate-payment.js
import { MercadoPagoConfig, Preference } from 'mercadopago';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      return res.status(500).json({ error: 'Error de configuración del servidor.' });
    }
    const client = new MercadoPagoConfig({ accessToken });
    const preference = new Preference(client);
    const { user } = req.body;
    const preferenceData = {
      items: [{
        id: 'kit-reinicio-01',
        title: 'Kit de Inicio Reinicio Metabólico',
        quantity: 1,
        unit_price: 7.00,
        currency_id: 'USD',
      }],
      back_urls: {
        success: `${process.env.APP_URL}/gracias-kit`,
        failure: `${process.env.APP_URL}/pago-fallido`,
        pending: `${process.env.APP_URL}/pago-pendiente`,
      },
      auto_return: 'approved',
      notification_url: `${process.env.APP_URL}/api/webhooks/mercadopago`,
      external_reference: user ? user.id : null,
      payer: user ? { email: user.email } : undefined,
    };
    const result = await preference.create({ body: preferenceData });
    return res.status(200).json({ id: result.id });
  } catch (error) {
    console.error('Error al crear la preferencia de pago:', error);
    return res.status(500).json({ error: 'Fallo al crear la preferencia de pago.', details: error.message });
  }
}
