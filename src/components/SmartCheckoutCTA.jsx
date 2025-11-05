// RUTA: src/components/SmartCheckoutCTA.jsx
// v7.5 — texto mejorado, misma lógica de pago

import React, { useEffect, useMemo, useState } from "react";
import MercadoPagoButton from "./common/MercadoPagoButton";

function guessDefaultCurrency() {
  try {
    const saved = localStorage.getItem("rm.currency");
    if (saved === "USD" || saved === "MXN") return saved;
    const lang = navigator.language?.toLowerCase() || "";
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (lang.includes("es-mx") || /mexico/i.test(tz)) return "MXN";
    return "USD";
  } catch {
    return "USD";
  }
}

function toMXN(usd, mode = "auto-9") {
  const rate = 18.5;
  const raw = Math.round(usd * rate);
  if (mode === "auto-9") {
    const x = Math.max(99, raw);
    return x - (x % 10) + 9;
  }
  return raw;
}

export default function SmartCheckoutCTA({
  productName = "Producto",
  basePriceUSD = 7,
  gumroadLink,
  mxnRounding = "auto-9",
  size = "compact",
  dense = true,
}) {
  const [currency, setCurrency] = useState(guessDefaultCurrency);
  useEffect(() => {
    try {
      localStorage.setItem("rm.currency", currency);
    } catch {}
  }, [currency]);

  const mxnPrice = useMemo(
    () => toMXN(basePriceUSD, mxnRounding),
    [basePriceUSD, mxnRounding]
  );

  const isMXN = currency === "MXN";
  const cardPad = dense ? "p-4" : "p-5";
  const card =
    "rounded-xl border border-white/10 bg-slate-900/50 backdrop-blur " + cardPad;

  const toggleBase =
    "flex-1 h-10 text-[13px] md:text-[14px] rounded-md border transition-all duration-200 font-semibold";
  const toggleInactive =
    "bg-slate-800/70 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white";
  const toggleActive =
    "bg-teal-600 text-white border-teal-500 shadow-md scale-[1.03]";

  return (
    <div className={card}>
      <div className="mb-3 text-[12px] md:text-[13px] leading-relaxed text-slate-300">
        <span className="font-semibold text-slate-200">
          ¿Cómo deseas obtener tu acceso?
        </span>{" "}
        <span className="text-slate-400">
          Si estás en{" "}
          <span className="font-medium text-slate-200">México</span>, elige{" "}
          <span className="font-medium text-slate-200">Pesos (MXN)</span> y paga
          con{" "}
          <span className="font-medium text-slate-200">Mercado Pago</span>. Si
          estás fuera de México, elige{" "}
          <span className="font-medium text-slate-200">USD</span> y compra con{" "}
          <span className="font-medium text-slate-200">Gumroad</span>.
        </span>
      </div>

      <div className="text-[12px] text-slate-400 mb-2">Elige tu moneda:</div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setCurrency("USD")}
          className={`${toggleBase} ${
            currency === "USD" ? toggleActive : toggleInactive
          }`}
        >
          🇺🇸 USD
        </button>
        <button
          type="button"
          onClick={() => setCurrency("MXN")}
          className={`${toggleBase} ${
            currency === "MXN" ? toggleActive : toggleInactive
          }`}
        >
          🇲🇽 MXN
        </button>
      </div>

      <div className="mt-4 text-center">
        <div className="text-3xl font-extrabold tracking-tight text-teal-400">
          {isMXN ? `$${mxnPrice}` : `$${basePriceUSD}`}
        </div>
        <div className="text-[12px] text-slate-500 mt-1">
          Un solo pago — acceso anual inmediato
        </div>
      </div>

      <div className="mt-3">
        {isMXN ? (
          <MercadoPagoButton
            size={size}
            label="Pagar con Mercado Pago"
            items={[
              {
                title: productName,
                quantity: 1,
                unit_price: mxnPrice,
                currency_id: "MXN",
              },
            ]}
            onError={(m) => alert(m)}
          />
        ) : (
          <a
            href={gumroadLink}
            target="_blank"
            rel="noreferrer"
            className="w-full inline-flex items-center justify-center rounded-xl h-12 
              bg-[#36c28b] hover:bg-[#2fb17e] active:bg-[#27a372]
              text-white font-semibold text-[15px] shadow-sm transition-colors"
          >
            Comprar en Gumroad
          </a>
        )}
      </div>

      <p className="mt-3 text-center text-[12px] text-slate-400">
        Compra 100 % segura • Confirmación automática
      </p>
    </div>
  );
}
