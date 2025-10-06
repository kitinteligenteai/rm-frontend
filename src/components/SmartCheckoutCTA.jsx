// RUTA: src/components/SmartCheckoutCTA.jsx
// ESTADO: FINAL - Versión con generación dinámica de preferencias de MP

import React, { useEffect, useMemo, useState } from "react";
import { Globe, Loader2 } from "lucide-react";
import MercadoPagoButton from "../common/MercadoPagoButton"; // Ruta al botón inteligente de MP
import PaymentButton from "../common/PaymentButton"; // Ruta al botón genérico
import { getUsdToMxnFx, usdToMxn, roundMXN, formatMoney } from "../../lib/fx"; // Ajusta la ruta a tu fx.js

const MARKET_KEY = "rm.market.v1";

function softGuessMarket() {
  try {
    const lang = (navigator.language || "").toLowerCase();
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (lang.includes("es-mx") || tz.includes("Mexico")) return "MX";
  } catch {}
  return "USD"; // Cambiado a USD por defecto para el mercado internacional
}

export default function SmartCheckoutCTA({
  productName, // <-- PROP PRINCIPAL
  basePriceUSD,
  gumroadLink,
  mxnRounding = "auto-9",
}) {
  const [market, setMarket] = useState("USD");
  const [hydrated, setHydrated] = useState(false);
  const [calculatedMxnPrice, setCalculatedMxnPrice] = useState(null);
  const [isLoadingFx, setIsLoadingFx] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(MARKET_KEY);
    if (saved === "MX" || saved === "USD") {
      setMarket(saved);
    } else {
      setMarket(softGuessMarket());
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchAndSetPrice = async () => {
      if (typeof basePriceUSD !== "number" || basePriceUSD <= 0) {
        setIsLoadingFx(false);
        return;
      }
      setIsLoadingFx(true);
      const rate = await getUsdToMxnFx();
      if (isMounted) {
        const rawMxn = usdToMxn(basePriceUSD, rate);
        const prettyMxn = roundMXN(rawMxn, mxnRounding);
        setCalculatedMxnPrice(prettyMxn);
        setIsLoadingFx(false);
      }
    };

    fetchAndSetPrice();
    return () => { isMounted = false; };
  }, [basePriceUSD, mxnRounding]);

  const priceLabel = useMemo(() => {
    if (market === "MX") {
      if (isLoadingFx) return <Loader2 className="h-7 w-7 animate-spin text-teal-300" />;
      if (calculatedMxnPrice) return formatMoney(calculatedMxnPrice, "MXN");
      return "No disponible";
    }
    return formatMoney(basePriceUSD, "USD", { fractionDigits: 2 });
  }, [market, calculatedMxnPrice, basePriceUSD, isLoadingFx]);

  const selectMarket = (selectedMarket) => {
    setMarket(selectedMarket);
    localStorage.setItem(MARKET_KEY, selectedMarket);
  };

  if (!hydrated) {
    return <div className="h-[220px] w-full animate-pulse bg-slate-800/50 rounded-lg"></div>;
  }

  return (
    <div className="w-full rounded-lg border border-slate-700 bg-slate-800/50 p-4 backdrop-blur-sm">
      <div className="mb-4">
        <div className="text-xs text-slate-400 mb-2 flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <span>Elige tu moneda de pago:</span>
        </div>
        <div className="inline-flex w-full rounded-md bg-slate-900 p-1">
          <button type="button" onClick={() => selectMarket("USD")} className={`w-1/2 py-2 rounded text-sm font-bold transition ${market === "USD" ? "bg-teal-500 text-white" : "text-slate-300 hover:bg-slate-700"}`}>
            🇺🇸 USD
          </button>
          <button type="button" onClick={() => selectMarket("MX")} className={`w-1/2 py-2 rounded text-sm font-bold transition ${market === "MX" ? "bg-teal-500 text-white" : "text-slate-300 hover:bg-slate-700"}`}>
            🇲🇽 MXN
          </button>
        </div>
      </div>
      
      <div className="mb-4 text-center">
        <p className="text-3xl font-extrabold text-white h-10 flex items-center justify-center">
          {priceLabel}
        </p>
      </div>

      {market === "MX" ? (
        <MercadoPagoButton
          product={{
            id: `RM-PROD-${basePriceUSD}`,
            title: productName,
            description: `Acceso a ${productName}`,
            quantity: 1,
            unit_price: calculatedMxnPrice,
            currency_id: 'MXN',
          }}
          className="w-full"
        />
      ) : (
        <PaymentButton href={gumroadLink} primary={true}>
          Pagar con Tarjeta (USD)
        </PaymentButton>
      )}
    </div>
  );
}
