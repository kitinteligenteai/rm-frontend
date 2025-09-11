// src/components/common/MercadoPagoButton.jsx
import React, { useState, useEffect } from 'react';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { Loader2, CreditCard } from 'lucide-react';

const MercadoPagoButton = ({
  label = 'Desbloquear mi Sistema (México)',
  className = '',
}) => {
  const [prefId, setPrefId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  // Inicializa el SDK de Mercado Pago una sola vez
  useEffect(() => {
    const pk = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY;
    if (pk) {
      initMercadoPago(pk, { locale: 'es-MX' });
    }
  }, []);

  // Función que llama a nuestra nueva API en Supabase
  const handleCreatePreference = async () => {
    setLoading(true);
    setErr('');
    try {
      // La URL de nuestra nueva función en Supabase
      const supabaseFunctionUrl = 'https://mgjzlohapnepvrqlxmpo.functions.supabase.co/mp-generate-preference';

      const resp = await fetch(supabaseFunctionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Enviamos un cuerpo vacío por ahora. Más adelante podemos enviar info del usuario.
        body: JSON.stringify({ user: null } )
      });

      if (!resp.ok) {
        const errorData = await resp.json();
        throw new Error(errorData.error || 'Error al comunicarse con la API.');
      }

      const data = await resp.json();
      if (!data?.id) {
        throw new Error('La respuesta de la API no contiene un ID de preferencia válido.');
      }
      
      setPrefId(data.id);

    } catch (e) {
      setErr('No se pudo iniciar el pago. Por favor, intenta de nuevo más tarde.');
      console.error('Error creando preferencia:', e);
    } finally {
      setLoading(false);
    }
  };

  // Si ya tenemos un ID de preferencia, mostramos el botón oficial de Mercado Pago
  if (prefId) {
    return (
      <div className="w-full">
        <Wallet initialization={{ preferenceId: prefId }} customization={{ texts:{ valueProp: 'smart_option'}}} />
      </div>
    );
  }

  // Si no, mostramos nuestro botón personalizado
  return (
    <div className="w-full">
      <button
        onClick={handleCreatePreference}
        disabled={loading}
        className={`group inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 
          bg-teal-600 text-white font-semibold shadow-lg
          hover:bg-teal-500 active:scale-[.99] transition
          disabled:bg-gray-500 ${className}`}
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CreditCard className="h-5 w-5" />}
        <span>{loading ? 'Preparando…' : label}</span>
      </button>
      {err && (
        <p className="mt-2 text-center text-sm text-red-400">
          {err}
        </p>
      )}
    </div>
  );
};

export default MercadoPagoButton;
