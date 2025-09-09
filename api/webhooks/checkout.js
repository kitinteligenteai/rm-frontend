// CÓDIGO DEFINITIVO para: src/api/webhooks/checkout.js
import { supabaseAdmin } from '../../lib/supabaseAdmin'; // Asumimos que supabaseAdmin está en lib

// --- Lógica de extracción para cada proveedor ---
const getMercadoPagoData = async (body) => {
  const paymentId = body.data?.id;
  if (!paymentId) return null;

  const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` }
  } );
  const payment = await response.json();

  if (payment.status !== 'approved') return null;

  return {
    email: payment.payer.email,
    nombre: `${payment.payer.first_name || ''} ${payment.payer.last_name || ''}`.trim(),
    productoId: payment.additional_info?.items?.[0]?.id || 'unknown',
  };
};

const getGumroadData = (body) => {
  if (!body.purchase || body.purchase.refunded || body.purchase.chargebacks > 0) return null;
  
  return {
    email: body.purchase.email,
    nombre: body.purchase.full_name || '',
    productoId: body.purchase.product_id || 'unknown',
  };
};

// --- Handler Principal ---
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const provider = req.headers['x-provider']; // 'mercadopago' o 'gumroad'
    let userData = null;

    switch (provider) {
      case 'mercadopago':
        userData = await getMercadoPagoData(req.body);
        break;
      case 'gumroad':
        userData = getGumroadData(req.body);
        break;
      default:
        return res.status(400).json({ error: 'Provider not specified or unsupported' });
    }

    if (!userData) {
      return res.status(200).json({ message: 'Payment not approved or data missing.' });
    }

    // Verificamos si el producto es el que da acceso a la plataforma
    const productoAccesoId = process.env.PRODUCT_ACCESS_ID; // ID del producto de $75
    if (userData.productoId !== productoAccesoId) {
      return res.status(200).json({ message: 'Payment received for a different product.' });
    }

    // --- Lógica de Creación de Usuario en Supabase ---
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      email_confirm: true, // El pago confirma la validez del email
      user_metadata: {
        full_name: userData.nombre,
        source: provider,
      },
    });

    if (error) {
      // Si el usuario ya existe, es un caso de éxito, no un error.
      if (error.message.includes('User already exists')) {
        console.log(`Webhook: User ${userData.email} already exists. Granting access if needed.`);
        // Aquí podrías añadir lógica para actualizar el rol del usuario si ya existía.
        return res.status(200).json({ message: 'User already exists.' });
      }
      // Para otros errores, sí los lanzamos.
      throw error;
    }

    console.log(`Webhook: Successfully created user ${userData.email} from ${provider}.`);
    return res.status(200).json({ message: 'User created successfully.', user: data.user });

  } catch (err) {
    console.error('Webhook Error:', err.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
