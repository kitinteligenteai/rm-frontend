// Contenido COMPLETO Y ACTUALIZADO para: src/pages/Upsell.jsx

import React from 'react';
import MercadoPagoButton from '../components/common/MercadoPagoButton'; // 1. Importamos nuestro botón

const Upsell = () => {
  // 2. Definimos el producto que vamos a vender.
  // Puedes cambiar el título, descripción, precio, etc.
  // Este es el objeto 'items' que nuestro botón espera.
  const product = {
    id: 'RM-KIT-01',
    title: 'Kit de Inicio Reinicio Metabólico',
    description: 'Acceso completo a la plataforma y guías.',
    quantity: 1,
    unit_price: 15.00, // Precio en la moneda que configuraste en MercadoPago (ej. 15.00 USD)
    currency_id: 'MXN' // Cambia a tu moneda local (ej. 'USD', 'ARS', 'BRL')
  };

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center">
        
        <h1 className="text-4xl md:text-5xl font-serif text-gray-800 mb-4">
          Estás a un paso de comenzar
        </h1>
        
        <p className="text-lg text-gray-600 mb-8">
          Adquiere tu Kit de Inicio y desbloquea todo el potencial de la plataforma para transformar tu salud.
        </p>

        {/* --- Resumen del Producto --- */}
        <div className="bg-gray-100 rounded-lg p-6 mb-8 border border-gray-200 text-left">
          <h2 className="text-2xl font-serif text-gray-700 mb-4">Resumen de tu compra</h2>
          <div className="flex justify-between items-center">
            <p className="text-gray-800">{product.title}</p>
            <p className="font-bold text-xl text-gray-900">
              ${product.unit_price.toFixed(2)} {product.currency_id}
            </p>
          </div>
          <p className="text-sm text-gray-500 mt-1">{product.description}</p>
        </div>

        {/* --- Botón de Pago --- */}
        <div className="flex flex-col items-center">
          <p className="text-sm text-gray-500 mb-4">
            Serás redirigido a la plataforma segura de Mercado Pago para completar tu compra.
          </p>
          {/* 3. Renderizamos el botón y le pasamos los 'items' a comprar */}
          <MercadoPagoButton items={[product]} />
        </div>

      </div>
    </div>
  );
};

export default Upsell;
// cambio pequeno