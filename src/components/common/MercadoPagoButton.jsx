// src/components/common/MercadoPagoButton.jsx
import React, { useState } from 'react';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { Loader2, CreditCard } from 'lucide-react';
import { useUser } from '../../context/UserContext';

const publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY;
console.log("🔑 PUBLIC_KEY (desde Vite):", publicKey);

if (publicKey) {
  initMercadoPago(publicKey, { locale: 'es-MX' });
}

const MercadoPagoButton = () => {
  const { user } = useUser();
  const [preferenceId, setPreferenceId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreatePreference = async () => {
    if (!publicKey) {
      setError("Error de configuración: La clave pública de Mercado Pago no está disponible.");
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const supabaseFunctionsUrl = `https://${import.meta.env.VITE_SUPABASE_PROJECT_REF}.functions.supabase.co`;

      const response = await fetch(`${supabaseFunctionsUrl}/mp-generate-preference`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'No se pudo generar la preferencia de pago.');
      }

      const data = await response.json();
      if (data.id) {
        setPreferenceId(data.id);
      } else {
        throw new Error('La respuesta de la API no contenía un ID de preferencia.');
      }
    } catch (err) {
      console.error('Error al crear la preferencia:', err);
      setError('No se pudo iniciar el pago. Por favor, intenta de nuevo más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  if (preferenceId) {
    return (
      <div className="w-full">
        <Wallet initialization={{ preferenceId }} customization={{ texts: { valueProp: 'smart_option' } }} />
      </div>
    );
  }

  return (
    <div className="w-full">
      <button
        onClick={handleCreatePreference}
        disabled={isLoading}
        className="group inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 bg-teal-600 text-white font-semibold shadow-lg hover:bg-teal-500 active:scale-[.99] transition disabled:bg-gray-500 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <CreditCard className="h-5 w-5" />
        )}
        <span>{isLoading ? 'Preparando…' : 'Desbloquear (México)'}</span>
      </button>
      {error && (
        <p className="mt-2 text-center text-sm text-red-400 bg-red-500/10 border border-red-400/30 px-3 py-2 rounded-md">
          {error}
        </p>
      )}
    </div>
  );
};

export default MercadoPagoButton;
