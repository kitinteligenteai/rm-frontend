// src/components/SmartCheckoutCTA.jsx
import React, { useEffect, useMemo, useState } from "react";
import MercadoPagoButton from "./common/MercadoPagoButton"; // Usa la ruta correcta a tu componente
import PaymentButton from "./common/PaymentButton"; // Usa la ruta correcta a tu componente
import { Loader2, Globe } from "lucide-react";

const MARKET_KEY = "rm.market.v1";

function softGuessMarket() {
  try {
    const lang = (navigator.language || "").toLowerCase();
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (lang.includes("es-mx") || tz.includes("Mexico")) return "MX";
  } catch {}
  return "INTL";
}

export default function SmartCheckoutCTA({ gumroadUrl, mxnPrice, usdPrice }) {
  const [market, setMarket] = useState("INTL");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(MARKET_KEY);
    if (saved === "MX" || saved === "INTL") setMarket(saved);
    else setMarket(softGuessMarket());
    setHydrated(true);
  }, []);

  const toggle = () => {
    const next = market === "MX" ? "INTL" : "MX";
    setMarket(next);
    localStorage.setItem(MARKET_KEY, next);
  };

  if (!hydrated) {
    return (
      <div className="w-full rounded-xl border border-gray-700 bg-gray-800/40 p-4 flex items-center justify-center gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Preparando opciones de pago…</span>
      </div>
    );
  }

  return (
    <section className="w-full max-w-md mx-auto space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">
          {market === "MX" ? "Pago para México:" : "Pago internacional:"}
        </p>
        <button type="button" onClick={toggle} className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded-md border border-gray-700 hover:bg-gray-800 transition" title="Cambiar país/moneda">
          <Globe className="h-3.5 w-3.5" />
          {market === "MX" ? "Comprar en USD" : "Comprar en MXN"}
        </button>
      </div>

      {market === "MX" ? (
        <MercadoPagoButton />
      ) : (
        <PaymentButton href={gumroadUrl} primary={false}>
          Pagar en USD (Gumroad)
        </PaymentButton>
      )}
    </section>
  );
}
