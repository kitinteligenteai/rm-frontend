// RUTA: src/components/SmartCheckoutCTA.jsx
import React, { useMemo, useState } from "react";
import MercadoPagoButton from "./common/MercadoPagoButton";

export default function SmartCheckoutCTA({
  productName = "Kit de 7 Días Reinicio Metabólico",
  basePriceUSD = 7,
  gumroadLink,                // VITE_GUMROAD_KIT_URL
  mxnRounding = "auto-9",     // sin cambios: solo estética del precio
}) {
  const [currency, setCurrency] = useState("USD");

  // precio “bonito” en MXN (solo para mostrar)
  const priceMXN = useMemo(() => {
    const raw = basePriceUSD * 18.9; // tipo estimado local
    if (mxnRounding === "auto-9") {
      return Math.round(raw / 10) * 10 - 1; // 139, 129, etc.
    }
    return Math.round(raw);
  }, [basePriceUSD, mxnRounding]);

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-800/50 p-5 md:p-6 backdrop-blur-xl">
      {/* selector moneda */}
      <div className="mb-3">
        <p className="text-[12px] text-slate-400 mb-2">Elige tu moneda de pago:</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setCurrency("USD")}
            className={`h-10 rounded-md border px-3 text-sm ${
              currency === "USD"
                ? "bg-slate-900 border-slate-700 text-white"
                : "bg-slate-700/40 border-slate-600 text-slate-200"
            }`}
          >
            us USD
          </button>
          <button
            onClick={() => setCurrency("MXN")}
            className={`h-10 rounded-md border px-3 text-sm ${
              currency === "MXN"
                ? "bg-slate-900 border-slate-700 text-white"
                : "bg-slate-700/40 border-slate-600 text-slate-200"
            }`}
          >
            mx MXN
          </button>
        </div>
      </div>

      {/* precio */}
      <div className="my-2 text-center">
        {currency === "USD" ? (
          <span className="text-3xl font-extrabold text-teal-400 leading-none tracking-tight">
            ${basePriceUSD}
          </span>
        ) : (
          <span className="text-3xl font-extrabold text-teal-400 leading-none tracking-tight">
            ${priceMXN}
          </span>
        )}
      </div>

      {/* CTAs */}
      {currency === "USD" ? (
        <a
          href={gumroadLink}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex w-full h-11 items-center justify-center rounded-lg bg-teal-500 text-slate-900 font-semibold hover:bg-teal-400 transition-colors leading-none"
        >
          Comprar en Gumroad
        </a>
      ) : (
        <MercadoPagoButton
          className="mt-3"
          product={{
            id: "kit-reinicio-01",
            title: productName,
            unit_price: priceMXN,
            currency_id: "MXN",
          }}
        />
      )}

      <p className="mt-3 text-center text-[12px] text-slate-400">
        Pago seguro • Confirmación inmediata
      </p>
    </div>
  );
}
