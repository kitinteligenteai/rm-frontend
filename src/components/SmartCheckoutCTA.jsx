// src/components/SmartCheckoutCTA.jsx
// v8.8 — Consentimiento legal antes de checkout

import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import MercadoPagoButton from "./common/MercadoPagoButton";

const LEGAL_VERSIONS = {
  termsVersion: "terminos-2026-05-28",
  privacyVersion: "privacidad-2026-05-28",
  refundsVersion: "devoluciones-2026-05-28",
};

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
  const [acceptedLegal, setAcceptedLegal] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("rm.currency", currency);
    } catch {}
  }, [currency]);

  const legalConsent = useMemo(() => {
    if (!acceptedLegal) return { accepted: false };
    return {
      accepted: true,
      ...LEGAL_VERSIONS,
      consentedAt: new Date().toISOString(),
    };
  }, [acceptedLegal]);

  const isPrograma = productId === "programa-completo";

  const PRECIOS = isPrograma
    ? { USD: 75, MXN: 1299, NAME: "Programa Completo" }
    : { USD: 7, MXN: 139, NAME: "Kit de 7 Días" };

  const isMXN = currency === "MXN";
  const displayPrice = isMXN ? PRECIOS.MXN : PRECIOS.USD;

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

      <label className="mt-4 flex items-start gap-3 rounded-lg border border-white/10 bg-black/20 p-3 text-left text-[11px] leading-relaxed text-slate-400">
        <input
          type="checkbox"
          checked={acceptedLegal}
          onChange={(event) => setAcceptedLegal(event.target.checked)}
          className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-900 accent-teal-500"
        />
        <span>
          Acepto los{" "}
          <Link to="/terminos" className="text-teal-300 hover:text-teal-200 underline">
            Términos
          </Link>
          , el{" "}
          <Link to="/privacidad" className="text-teal-300 hover:text-teal-200 underline">
            Aviso de Privacidad
          </Link>{" "}
          y la{" "}
          <Link to="/devoluciones" className="text-teal-300 hover:text-teal-200 underline">
            Política de Devoluciones
          </Link>
          . Entiendo que es contenido educativo de bienestar y no sustituye atención médica profesional.
        </span>
      </label>

      <div className="mt-4">
        {isMXN ? (
          <MercadoPagoButton
            label={`Pagar ${PRECIOS.NAME}`}
            productId={productId}
            legalConsent={legalConsent}
          />
        ) : (
          <a
            href={acceptedLegal ? finalGumroadLink : undefined}
            onClick={(event) => {
              if (!acceptedLegal) {
                event.preventDefault();
                alert("Para continuar, acepta los términos, el aviso de privacidad y la política de devoluciones.");
              }
            }}
            target="_blank"
            rel="noreferrer"
            className={`w-full inline-flex items-center justify-center rounded-lg h-[48px] text-white font-bold text-[15px] ${
              acceptedLegal
                ? "bg-[#36c28b] hover:bg-[#2fb17e]"
                : "bg-slate-700 cursor-not-allowed opacity-70"
            }`}
          >
            Pagar con Tarjeta / PayPal
          </a>
        )}
      </div>

      <p className="mt-3 text-center text-[11px] text-slate-500">🔒 Transacción 100% segura</p>
    </div>
  );
}