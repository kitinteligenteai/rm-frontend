// RUTA: src/pages/GraciasUpsell.jsx
// ESTADO: FINAL - Página de Gracias para el Upsell

import React, { useEffect } from 'react';

export default function GraciasUpsell() {
  useEffect(() => {
    // Disparamos el evento de Píxel de Meta cuando la página carga
    if (window.fbq) {
      window.fbq('track', 'Purchase', { value: 75.00, currency: 'USD' });
    }
  }, []); // El array vacío asegura que esto solo se ejecute una vez

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 text-center font-sans">
      <div className="max-w-xl">
        <h1 className="text-4xl font-bold text-[#00838F]">¡Felicidades y bienvenido al grupo fundador!</h1>
        <p className="mt-4 text-lg text-gray-700">
          Tu compra ha sido un éxito. En los próximos minutos recibirás un segundo correo electrónico con los detalles para acceder a la plataforma completa de "Reinicio Metabólico".
        </p>
        <p className="mt-2 text-gray-600">
          Si no lo ves en tu bandeja de entrada, por favor, revisa tu carpeta de spam o promociones. ¡Estamos emocionados de tenerte a bordo!
        </p>
      </div>
    </div>
  );
}