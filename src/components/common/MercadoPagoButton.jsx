// Contenido FINAL, CORREGIDO Y ADAPTADO PARA VERCEL para: src/components/common/MercadoPagoButton.jsx

import React, { useState, useEffect, useRef } from 'react';

// 1. OBTENEMOS LA CLAVE PÚBLICA DE FORMA SEGURA
// Vite expone las variables de entorno del cliente en import.meta.env
// Esta variable la configuramos en el panel de Vercel.
const MP_PUBLIC_KEY = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY;

// 2. URL DE NUESTRA FUNCIÓN SERVERLESS EN VERCEL
// Esta es la ruta correcta que Vercel entenderá.
const CREATE_PREFERENCE_URL = "/api/create-payment";

const MercadoPagoButton = ({ items }) => { // 3. Aceptamos 'items' como prop para el producto
  const [preferenceId, setPreferenceId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const effectRan = useRef(false);

  // --- Efecto para crear la preferencia de pago ---
  useEffect(() => {
    // Prevenimos la doble ejecución en modo estricto de React
    if (effectRan.current === true || process.env.NODE_ENV !== 'development') {
        const createPreference = async () => {
          if (!items || items.length === 0) {
            setError("Error: No se han proporcionado productos para el pago.");
            setIsLoading(false);
            return;
          }

          try {
            // 4. ENVIAMOS LOS 'ITEMS' A NUESTRA API
            // Nuestra función serverless espera recibir los productos a cobrar.
            const response = await fetch(CREATE_PREFERENCE_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ items }) // Enviamos los items en el cuerpo
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || `Error del servidor: ${response.status}`);
            }

            const data = await response.json();

            if (data && data.id) { // La API de MercadoPago devuelve un 'id' de preferencia
              setPreferenceId(data.id);
            } else {
              throw new Error("La respuesta de la API no contiene un ID de preferencia válido.");
            }

          } catch (err) {
            setError(`Error al inicializar el pago: ${err.message}`);
          } finally {
            setIsLoading(false);
          }
        };
        createPreference();
    }
    return () => {
      effectRan.current = true;
    };
  }, [items]); // Se re-ejecuta si los 'items' cambian

  // --- Efecto para renderizar el botón de MercadoPago ---
  useEffect(() => {
    if (preferenceId && MP_PUBLIC_KEY) {
      const script = document.createElement('script');
      script.src = 'https://sdk.mercadopago.com/js/v2';
      script.async = true;
      script.onload = ( ) => {
        try {
          const mp = new window.MercadoPago(MP_PUBLIC_KEY, { locale: 'es-MX' });
          mp.checkout({
            preference: { id: preferenceId },
            render: {
              container: '#mercado-pago-button-container',
              label: 'Pagar Ahora'
            }
          });
        } catch (err) {
          setError(`Error al renderizar el botón de MercadoPago: ${err.message}`);
        }
      };
      document.body.appendChild(script);

      return () => {
        // Limpieza: removemos el script cuando el componente se desmonta
        document.body.removeChild(script);
      };
    }
  }, [preferenceId]);

  // --- Renderizado del componente ---
  if (isLoading) return <div className="text-center p-4 animate-pulse">Cargando botón de pago...</div>;
  if (error) return <div className="text-center p-4 text-red-600 bg-red-100 rounded-lg"><strong>Error:</strong> {error}</div>;

  return <div id="mercado-pago-button-container" className="w-full"></div>;
};

export default MercadoPagoButton;
