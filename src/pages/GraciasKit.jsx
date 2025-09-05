// RUTA: src/pages/GraciasKit.jsx
// ESTADO: FINAL - Con Evento de Píxel

import React, { useEffect } from 'react';

export default function GraciasKit() {
  useEffect(() => {
    if (window.fbq) {
      window.fbq('track', 'Purchase', { value: 7.00, currency: 'USD' });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 text-center font-sans">
      <div className="max-w-xl">
        <h1 className="text-4xl font-bold text-[#00838F]">¡Gracias por tu compra!</h1>
        <p className="mt-4 text-lg text-gray-700">
          Hemos enviado un correo electrónico a la dirección que proporcionaste con el enlace para descargar tu Kit de Inicio de 7 Días.
        </p>
        <p className="mt-2 text-gray-600">
          Si no lo ves en tu bandeja de entrada en los próximos 5 minutos, por favor, revisa tu carpeta de spam o promociones.
        </p>
      </div>
    </div>
  );
}