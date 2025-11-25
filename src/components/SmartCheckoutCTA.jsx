// src/components/ui/SmartCheckoutCTA.jsx (v7.6 Blindado)
// Visualmente igual, pero internamente usa el nuevo protocolo de seguridad

import React, { useEffect, useMemo, useState } from "react";
import MercadoPagoButton from "../common/MercadoPagoButton";

function guessDefaultCurrency() {
  try {
    const saved = localStorage.getItem("rm.currency");
    if (saved === "USD" || saved === "MXN") return saved;
    // Detección simple por zona horaria
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (/mexico/i.test(tz)) return "MXN";
    return "USD";
  } catch {
    return "USD";
  }
}

// Precios fijos para visualización (La verdad final está en el servidor)
const PRECIOS = {
    USD: 7,
    MXN: 129
};

export default function SmartCheckoutCTA({
  productName = "Kit de 7 Días",
  gumroadLink,
  size = "compact",
  dense = true,
}) {
  const [currency, setCurrency] = useState(guessDefaultCurrency);

  useEffect(() => {
    try {
      localStorage.setItem("rm.currency", currency);
    } catch {}
  }, [currency]);

  const isMXN = currency === "MXN";
  const displayPrice = isMXN ? PRECIOS.MXN : PRECIOS.USD;

  // Estilos
  const cardPad = dense ? "p-4" : "p-5";
  const card = "rounded-xl border border-white/10 bg-slate-900/50 backdrop-blur " + cardPad;
  const toggleBase = "flex-1 h-10 text-[13px] md:text-[14px] rounded-md border transition-all duration-200 font-semibold";
  const toggleInactive = "bg-slate-800/70 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white";
  const toggleActive = "bg-teal-600 text-white border-teal-500 shadow-md scale-[1.03]";

  return (
    <div className={card}>
      {/* Encabezado explicativo */}
      <div className="mb-3 text-[12px] md:text-[13px] leading-relaxed text-slate-300">
        <span className="font-semibold text-slate-200">
          ¿Cómo deseas obtener tu acceso?
        </span>{" "}
        <span className="text-slate-400">
          Si estás en <span className="font-medium text-slate-200">México</span>, elige{" "}
          <span className="font-medium text-slate-200">MXN</span> (Mercado Pago). 
          Para el resto del mundo, usa <span className="font-medium text-slate-200">USD</span> (Gumroad).
        </span>
      </div>

      {/* Selector de Moneda */}
      <div className="text-[12px] text-slate-400 mb-2">Elige tu moneda:</div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setCurrency("USD")}
          className={`${toggleBase} ${!isMXN ? toggleActive : toggleInactive}`}
        >
          🇺🇸 USD
        </button>
        <button
          type="button"
          onClick={() => setCurrency("MXN")}
          className={`${toggleBase} ${isMXN ? toggleActive : toggleInactive}`}
        >
          🇲🇽 MXN
        </button>
      </div>

      {/* Precio Grande */}
      <div className="mt-4 text-center">
        <div className="text-3xl font-extrabold tracking-tight text-teal-400">
          ${displayPrice} {isMXN ? "MXN" : "USD"}
        </div>
        <div className="text-[12px] text-slate-500 mt-1">
          Un solo pago — acceso anual inmediato
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="mt-4">
        {isMXN ? (
          // 🔒 AQUÍ ESTÁ EL CAMBIO: Ya no pasamos 'items' con precio.
          // Solo pasamos el ID del producto que queremos.
          <MercadoPagoButton
            label="Pagar con Mercado Pago"
            productId="kit-7-dias" 
          />
        ) : (
          <a
            href={gumroadLink}
            target="_blank"
            rel="noreferrer"
            className="w-full inline-flex items-center justify-center rounded-lg h-[48px] 
              bg-[#36c28b] hover:bg-[#2fb17e] active:bg-[#27a372]
              text-white font-bold text-[15px] shadow-sm transition-colors"
          >
            Pagar con Tarjeta / PayPal
          </a>
        )}
      </div>

      <p className="mt-3 text-center text-[11px] text-slate-500">
        🔒 Pago 100% seguro y encriptado SSL
      </p>
    </div>
  );
}