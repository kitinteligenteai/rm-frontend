// RUTA: src/components/common/MercadoPagoButton.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import { Loader2, RefreshCw } from "lucide-react";

/**
 * Renderiza el botón AMARILLO de MP embebido (Checkout Pro modal).
 * Evita el doble-mount de React 18 StrictMode en dev.
 */
export default function MercadoPagoButton({
  product,                 // { id, title, unit_price, currency_id: 'MXN' }
  className = "",
  theme = "dark",
  placeholderText = "Cargando botón de pago…",
  helperText = "Pago seguro • Confirmación inmediata",
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [ready, setReady] = useState(false);

  const holderRef = useRef(null);
  const scriptRef = useRef(null);
  const didInit = useRef(false); // ← evita doble ejecución en dev

  const functionsUrl = `https://${import.meta.env.VITE_SUPABASE_PROJECT_REF}.functions.supabase.co`;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const cleanup = () => {
    // remueve el script y lo que haya renderizado
    if (scriptRef.current) {
      scriptRef.current.remove();
      scriptRef.current = null;
    }
    if (holderRef.current) holderRef.current.innerHTML = "";
    setReady(false);
  };

  const injectMpScript = (preferenceId) => {
    cleanup();
    const s = document.createElement("script");
    s.src = "https://www.mercadopago.com.mx/integrations/v1/web-payment-checkout.js";
    s.async = true;
    s.setAttribute("data-preference-id", preferenceId);
    // Nota: este script REEMPLAZA al propio <script/> por el botón.
    // por eso lo insertamos dentro del holderRef.
    s.onload = () => setReady(true);
    s.onerror = () => setErr("No se pudo cargar el botón de Mercado Pago.");
    scriptRef.current = s;
    holderRef.current?.appendChild(s);
  };

  const init = useCallback(async () => {
    if (!product || !product.title || !product.unit_price) {
      setErr("Producto no especificado.");
      return;
    }
    try {
      setBusy(true);
      setErr("");

      const resp = await fetch(`${functionsUrl}/mp-generate-preference-v2`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${anonKey}`,
          apikey: anonKey,
        },
        body: JSON.stringify({
          items: [
            {
              title: product.title,
              quantity: 1,
              unit_price: Number(product.unit_price),
              currency_id: product.currency_id || "MXN",
              id: product.id || "kit-reinicio-01",
            },
          ],
        }),
      });

      const data = await resp.json();
      if (!resp.ok || !data?.preferenceId) {
        throw new Error(data?.error || "No se pudo crear la preferencia.");
      }

      injectMpScript(data.preferenceId);
    } catch (e) {
      console.error(e);
      setErr(e.message || "Error inicializando el checkout.");
    } finally {
      setBusy(false);
    }
  }, [anonKey, functionsUrl, product]);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    init();
    return cleanup;
  }, [init]);

  return (
    <div className={`w-full ${className}`}>
      {/* placeholder / estado */}
      {!ready && (
        <div
          className={`relative w-full h-[52px] rounded-lg border ${
            theme === "dark"
              ? "border-gray-700 bg-gray-800/60"
              : "border-gray-200 bg-gray-50"
          } flex items-center justify-center`}
        >
          {busy ? (
            <span className="flex items-center gap-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              {placeholderText}
            </span>
          ) : err ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-red-400">{err}</span>
              <button
                type="button"
                onClick={init}
                className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-gray-600 hover:bg-gray-800"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Reintentar
              </button>
            </div>
          ) : (
            <span className="flex items-center gap-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              {placeholderText}
            </span>
          )}
        </div>
      )}

      {/* aquí MercadoPago inyecta el botón amarillo */}
      <div
        ref={holderRef}
        className={`${ready ? "opacity-100" : "opacity-0"} transition-opacity duration-150`}
        aria-live="polite"
      />

      <p className="mt-2 text-center text-[11px] text-gray-500">{helperText}</p>
    </div>
  );
}
