// RUTA: src/components/SmartCheckoutCTA.jsx
import React, { useEffect, useMemo, useState } from "react";
import MercadoPagoButton from "./common/MercadoPagoButton";

// Heurística sencilla para preseleccionar MXN si parece México
function guessDefaultCurrency() {
  try {
    const saved = localStorage.getItem("rm.currency");
    if (saved === "USD" || saved === "MXN") return saved;

    const lang = navigator.language?.toLowerCase() || "";
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";

    if (lang.includes("es-mx")) return "MXN";
    if (/mexico|mexico_city|america\/mexico_city/i.test(tz)) return "MXN";

    return "USD";
  } catch {
    return "USD";
  }
}

function toMXN(usd, mode = "auto-9") {
  const rate = 18.5; // display-only
  const raw = Math.round(usd * rate);
  if (mode === "auto-9") {
    const x = Math.max(99, raw);
    return x - (x % 10) + 9;
  }
  return raw;
}

/**
 * Props:
 * - productName
 * - basePriceUSD
 * - gumroadLink
 * - mxnRounding: "auto-9" | null
 * - size: "compact" | "normal"
 * - dense: boolean
 */
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
    "rounded-xl border border-white/10 bg-slate-900/50 backdrop-blur " +
    cardPad;

  const toggleBtn =
    "flex-1 h-10 text-[13px] md:text-[14px] rounded-md border border-white/10 " +
    "bg-slate-800/70 text-slate-200 hover:bg-slate-700 transition-colors";
  const toggleBtnActive = "bg-slate-700 text-white border-slate-600";

  return (
    <div className={card}>
      {/* Texto guía muy claro */}
      <div className="mb-3 text-[12px] md:text-[13px] leading-relaxed text-slate-300">
        <span className="font-semibold text-slate-200">¿Cómo quieres pagar?</span>{" "}
        <span className="text-slate-400">
          Si estás en <span className="font-medium text-slate-200">México</span>,
          elige <span className="font-medium text-slate-200">Pesos (MXN)</span> y paga con{" "}
          <span className="font-medium text-slate-200">Mercado Pago</span>.  
          Si estás fuera de México, elige{" "}
          <span className="font-medium text-slate-200">USD</span> y paga con{" "}
          <span className="font-medium text-slate-200">Gumroad</span>.
        </span>
      </div>

      {/* Toggle moneda */}
      <div className="text-[12px] text-slate-400 mb-2">Elige tu moneda:</div>
      <div className="flex gap-2">
        <button
          className={`${toggleBtn} ${!isMXN ? toggleBtnActive : ""}`}
          onClick={() => setCurrency("USD")}
          type="button"
          aria-pressed={!isMXN}
        >
          us USD
        </button>
        <button
          className={`${toggleBtn} ${isMXN ? toggleBtnActive : ""}`}
          onClick={() => setCurrency("MXN")}
          type="button"
          aria-pressed={isMXN}
        >
          mx MXN
        </button>
      </div>

      {/* Precio visible y claro */}
      <div className="mt-3 text-center">
        <div className="text-3xl font-extrabold tracking-tight text-teal-400">
          {isMXN ? `$${mxnPrice}` : `$${basePriceUSD}`}
        </div>
        <div className="text-[12px] text-slate-500 mt-1">
          Un solo pago — acceso inmediato
        </div>
      </div>

      {/* Acción principal */}
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
            className={
              "w-full inline-flex items-center justify-center rounded-xl h-12 " +
              // Verde Gumroad aproximado
              "bg-[#36c28b] hover:bg-[#2fb17e] active:bg-[#27a372] " +
              "text-white font-semibold text-[15px] shadow-sm transition-colors"
            }
          >
            Comprar en Gumroad
          </a>
        )}
      </div>

      {/* Sello de confianza */}
      <p className="mt-3 text-center text-[12px] text-slate-400">
        Compra 100% segura • Confirmación inmediata
      </p>
    </div>
  );
}
