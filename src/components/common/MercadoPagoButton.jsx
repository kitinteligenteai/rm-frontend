// Contenido NUEVO, MODERNO Y CORRECTO para: src/components/common/MercadoPagoButton.jsx

import React, { useState } from 'react';
import { Wallet } from '@mercadopago/sdk-react';
import { useUser } from '../../context/UserContext';

// Componente de botón genérico para mostrar mientras se carga.
const PaymentButtonUI = ({ children, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full sm:w-auto px-8 py-3 text-base font-bold rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2
      bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400
      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`
    }
  >
    {children}
  </button>
);

const MercadoPagoButton = () => {
  const { user } = useUser();
  const [preferenceId, setPreferenceId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBuyClick = async () => {
    setIsLoading(true);
    setError('');
    try {
      // 1. LLAMAMOS A LA API CORRECTA: /api/create-preference
      const response = await fetch('/api/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error del servidor al crear preferencia');
      }
      if (data.id) {
        setPreferenceId(data.id);
      }
    } catch (err) {
      setError('No se pudo iniciar el pago. Por favor, intenta de nuevo.');
      console.error('Error creating preference:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Si hay un error, lo mostramos.
  if (error) {
    return <p className="mt-4 text-sm text-red-600">{error}</p>;
  }

  // Si ya tenemos el ID de la preferencia, mostramos el botón de la Wallet de MP.
  if (preferenceId) {
    return (
      <div className="w-full sm:w-auto">
        <Wallet initialization={{ preferenceId: preferenceId }} />
      </div>
    );
  }

  // Estado inicial: mostramos nuestro botón que al hacer clic, crea la preferencia.
  return (
    <PaymentButtonUI onClick={handleBuyClick} disabled={isLoading}>
      {isLoading ? 'Procesando...' : 'Desbloquear mi Sistema (México)'}
    </PaymentButtonUI>
  );
};

export default MercadoPagoButton;
