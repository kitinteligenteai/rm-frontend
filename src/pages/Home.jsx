// Contenido FINAL Y VERIFICADO para: src/pages/Home.jsx

import React from 'react';
import { initMercadoPago } from '@mercadopago/sdk-react';
import Header from '../components/common/Header';
import MasterKeyImage from '../assets/llave-maestra.png';
import MercadoPagoButton from '../components/common/MercadoPagoButton'; // <-- IMPORTANTE: Usa el botón corregido

// Inicialización del SDK de Mercado Pago
const mpPublicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;
if (mpPublicKey) {
  initMercadoPago(mpPublicKey);
}

// Botón para Gumroad (Internacional)
const GumroadButton = ({ children, href, primary = false }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`block w-full sm:w-auto px-8 py-3 text-base font-bold text-center rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2
    ${primary ? 'bg-[#00838F] text-white hover:bg-[#006064] focus:ring-[#00838F]' : ''}`}>
        {children}
    </a>
);

export default function Home() {
  const gumroadLink = "https://inteligentekit.gumroad.com/l/sxwrn";

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      <Header />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
            Recibe 7 Días de <span className="text-[#00838F]">Absoluta Paz Mental</span>
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Deja de adivinar. Te entregamos el sistema exacto donde cada comida y cada decisión ya están resueltos para ti. Es hora de apagar la inflamación y recuperar tu energía.
          </p>
          <div className="my-8 sm:my-10">
            <img src={MasterKeyImage} alt="Kit Reinicio Metabólico" className="rounded-lg shadow-2xl mx-auto w-full max-w-md" />
          </div>
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200 mt-12 scroll-mt-20" id="comprar">
            <h2 className="text-3xl font-bold text-gray-800">
              Tu Sistema de Acción Inmediata (PDF )
            </h2>
            <div className="mt-4 text-left max-w-md mx-auto space-y-2">
                <p>✅ <strong>El Menú Exacto:</strong> Qué comer y cuándo para apagar la inflamación. Cero adivinanzas.</p>
                <p>✅ <strong>Recetas Deliciosas y Simples:</strong> Diseñadas para sanar, sin ingredientes raros.</p>
                <p>✅ <strong>La Lista de Compras Inteligente:</strong> Organizada para una sola visita al súper.</p>
            </div>
            <p className="text-2xl font-light text-gray-800 my-4">
              Consigue el Sistema por un pago único de
              <span className="font-bold text-[#00838F]"> solo $7 USD</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              <GumroadButton href={gumroadLink} primary={true}>
                Desbloquear mi Sistema (Internacional)
              </GumroadButton>
              
              {/*  Usamos el componente corregido y moderno */}
              <MercadoPagoButton />

            </div>
            <p className="mt-6 text-xs text-gray-500">
              Compra 100% segura. Acceso instantáneo.
            </p>
          </div>
        </div>
      </main>
      <footer className="text-center py-8 text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Reinicio Metabólico. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
// Comentario para forzar un nuevo hash de build: v1