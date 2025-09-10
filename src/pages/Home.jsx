// Contenido COMPLETO y LISTO para: src/pages/Home.jsx

import React, { useState, useEffect } from 'react';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { useUser } from '../context/UserContext';
import Header from '../components/common/Header';
import MasterKeyImage from '../assets/llave-maestra.png';

// 1. INICIALIZACIÓN DE MERCADO PAGO (se hace una sola vez)
// La clave pública se toma de las variables de entorno que configuramos.
const mpPublicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;
if (mpPublicKey) {
  initMercadoPago(mpPublicKey);
}

// Componente de Botón de Pago Reutilizable (versión mejorada)
const PaymentButton = ({ children, onClick, disabled, primary = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full sm:w-auto px-8 py-3 text-base font-bold rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2
      ${primary
        ? 'bg-[#00838F] text-white hover:bg-[#006064] focus:ring-[#00838F]'
        : 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400'
      }
      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`
    }
  >
    {children}
  </button>
);

export default function Home() {
  const { user } = useUser();
  const [preferenceId, setPreferenceId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Link de Gumroad para el botón internacional
  const gumroadLink = "https://inteligentekit.gumroad.com/l/sxwrn";

  // 2. FUNCIÓN QUE MANEJA EL CLIC EN EL BOTÓN DE MÉXICO
  const handleMercadoPagoBuy = async ( ) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user }), // Enviamos la info del usuario (o null si no está logueado)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error del servidor');
      if (data.id) {
        setPreferenceId(data.id); // Guardamos el ID para que aparezca el botón de Mercado Pago
      }
    } catch (err) {
      setError('No se pudo iniciar el pago. Por favor, intenta de nuevo.');
      console.error('Mercado Pago preference error:', err);
    } finally {
      setIsLoading(false);
    }
  };

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
              Tu Sistema de Acción Inmediata (PDF)
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
            
            {/* 3. SECCIÓN DE BOTONES DE PAGO INTELIGENTE */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              {/* Botón Internacional (Gumroad) - sin cambios */}
              <a href={gumroadLink} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <PaymentButton primary={true}>
                  Desbloquear mi Sistema (Internacional)
                </PaymentButton>
              </a>

              {/* Botón de México (Mercado Pago) - Lógica nueva */}
              {!preferenceId ? (
                <PaymentButton onClick={handleMercadoPagoBuy} disabled={isLoading}>
                  {isLoading ? 'Procesando...' : 'Desbloquear mi Sistema (México)'}
                </PaymentButton>
              ) : (
                // Este componente de Mercado Pago aparecerá después del clic
                <div className="w-full sm:w-auto">
                  <Wallet initialization={{ preferenceId }} />
                </div>
              )}
            </div>
            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
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
