// src/components/SmartCheckoutCTA.jsx (v8.7 - VISUAL $139 + FIX RUTA INCLUIDO)
import React, { useEffect, useState } from "react";
// ✅ Mantenemos la ruta correcta que ya funcionó en el Build
import MercadoPagoButton from "./common/MercadoPagoButton";

function guessDefaultCurrency() {
  try {
    const saved = localStorage.getItem("rm.currency");
    if (saved === "USD" || saved === "MXN") return saved;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (/mexico/i.test(tz)) return "MXN";
    return "USD";
  } catch {
    return "USD";
  }
}

export default function SmartCheckoutCTA({
  gumroadLink,
  productId = "kit-7-dias", 
  dense = true,
}) {
  const [currency, setCurrency] = useState(guessDefaultCurrency);

  useEffect(() => {
    try {
      localStorage.setItem("rm.currency", currency);
    } catch {}
  }, [currency]);

  // Lógica de Precios
  const isPrograma = productId === "programa-completo";
  
  const PRECIOS = isPrograma
    ? { USD: 75, MXN: 1299, NAME: "Programa Completo" } 
    : { USD: 7, MXN: 139, NAME: "Kit de 7 Días" }; // ✅ AQUI ESTÁ EL CAMBIO A 139

  const isMXN = currency === "MXN";
  const displayPrice = isMXN ? PRECIOS.MXN : PRECIOS.USD;

  // Link de respaldo
  const finalGumroadLink = gumroadLink || (isPrograma 
    ? "https://inteligentekit.gumroad.com/l/snxlh"
    : "https://inteligentekit.gumroad.com/l/sxwrn");

  const cardPad = dense ? "p-4" : "p-5";
  const card = "rounded-xl border border-white/10 bg-slate-900/50 backdrop-blur " + cardPad;
  const toggleBase = "flex-1 h-10 text-[13px] md:text-[14px] rounded-md border transition-all duration-200 font-semibold";
  const toggleInactive = "bg-slate-800/70 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white";
  const toggleActive = "bg-teal-600 text-white border-teal-500 shadow-md scale-[1.03]";

  return (
    <div className={card}>
      <div className="mb-3 text-[12px] md:text-[13px] leading-relaxed text-slate-300">
        <span className="font-semibold text-slate-200">Pago seguro:</span>{" "}
        <span className="text-slate-400">
          Usa <span className="font-medium text-slate-200">MXN</span> para Mercado Pago (México) o <span className="font-medium text-slate-200">USD</span> para el resto del mundo.
        </span>
      </div>

      <div className="text-[12px] text-slate-400 mb-2">Moneda:</div>
      <div className="flex gap-2">
        <button type="button" onClick={() => setCurrency("USD")} className={`${toggleBase} ${!isMXN ? toggleActive : toggleInactive}`}>🇺🇸 USD</button>
        <button type="button" onClick={() => setCurrency("MXN")} className={`${toggleBase} ${isMXN ? toggleActive : toggleInactive}`}>🇲🇽 MXN</button>
      </div>

      <div className="mt-4 text-center">
        <div className="text-3xl font-extrabold tracking-tight text-teal-400">
          ${displayPrice} {isMXN ? "MXN" : "USD"}
        </div>
        <div className="text-[12px] text-slate-500 mt-1">Un solo pago • Acceso de por vida</div>
      </div>

      <div className="mt-4">
        {isMXN ? (
          <MercadoPagoButton label={`Pagar ${PRECIOS.NAME}`} productId={productId} />
        ) : (
          <a href={finalGumroadLink} target="_blank" rel="noreferrer" className="w-full inline-flex items-center justify-center rounded-lg h-[48px] bg-[#36c28b] hover:bg-[#2fb17e] text-white font-bold text-[15px]">
            Pagar con Tarjeta / PayPal
          </a>
        )}
      </div>
      <p className="mt-3 text-center text-[11px] text-slate-500">🔒 Transacción 100% segura</p>
    </div>
  );
}