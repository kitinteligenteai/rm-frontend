// src/pages/Home.jsx
// v5.1 - Acceso visible a Mi Programa

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import SmartCheckoutCTA from "../components/SmartCheckoutCTA";
import LegalFooter from "../components/common/LegalFooter.jsx";

const FEATURES = [
  "Plan exacto: qué comer y cuándo para bajar la inflamación.",
  "Recetas deliciosas y simples, sin ingredientes raros.",
  "Lista de compras inteligente: una sola visita al súper.",
];

export default function Home() {
  const priceUSD = Number(import.meta.env.VITE_KIT_PRICE_USD) || 7;
  const gumroadUrl = import.meta.env.VITE_GUMROAD_KIT_URL;

  return (
    <div className="min-h-screen text-slate-100 font-sans bg-[#0f3e4a] relative overflow-hidden">
      {/* Fondo gradiente con halo suave */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(1200px 600px at 25% 40%, rgba(26, 121, 126, 0.55), transparent 60%), radial-gradient(900px 500px at 90% 20%, rgba(3, 80, 92, 0.5), transparent 60%), linear-gradient(180deg, #0f5a64 0%, #053f49 45%, #032c33 100%)",
        }}
      />

      {/* Header */}
      <header className="relative z-10 sticky top-0 backdrop-blur-sm border-b border-white/10">
        <div className="mx-auto max-w-[1140px] px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-[15px] font-extrabold tracking-tight">
              Reinicio Metabólico
            </p>
            <p className="text-[12.5px] text-white/70 -mt-0.5">
              Claridad y energía en 7 días
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/auth"
              className="hidden sm:flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-xs font-bold text-white transition-colors border border-white/20"
            >
              <LogIn size={14} />
              Iniciar sesión
            </Link>

            <Link
              to="/plataforma/mis-compras"
              className="flex items-center gap-2 bg-teal-400 hover:bg-teal-300 px-4 py-2 rounded-full text-xs font-extrabold text-slate-950 transition-colors shadow-lg shadow-teal-500/20"
            >
              <LogIn size={14} />
              Mi Programa
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="mx-auto max-w-[1140px] px-4 sm:px-6 py-10 lg:py-14 grid grid-cols-1 md:grid-cols-[1fr,0.86fr] gap-x-12 items-center"
        >
          {/* IZQUIERDA — Hero con llave */}
          <div className="relative">
            <div className="flex justify-start md:justify-start mb-6 md:mb-8">
              <img
                src="/llave-maestra.png"
                alt="Llave maestra del sistema"
                className="w-[240px] md:w-[310px] lg:w-[330px] translate-y-[10px] object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.35)]"
                loading="eager"
                decoding="async"
              />
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 backdrop-blur-[2px] text-[12.5px] text-white/85">
              <span className="opacity-90">⚡</span> PDF de Acción Inmediata
            </div>

            <h1 className="mt-3 text-[36px] sm:text-[42px] lg:text-[46px] leading-[1.05] font-extrabold tracking-tight text-[#DFFCF8]">
              Tu <span className="text-teal-200/90">Sistema de 7 Días</span>
            </h1>

            <p className="mt-3 text-[15.5px] md:text-[16px] text-slate-200/90 max-w-[520px]">
              Si vienes del dolor y el cansancio, aquí recuperas claridad. Te
              damos el plan exacto para decidir cada comida con confianza — y
              volver a sentir energía.
            </p>
          </div>

          {/* DERECHA — Panel + CTA */}
          <div className="w-full max-w-md md:mx-0 md:justify-self-end lg:translate-y-[-20px]">
            <div className="rounded-2xl border border-white/14 bg-white/10 backdrop-blur-xl p-4.5 sm:p-5.5 lg:p-6 shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
              <ul className="space-y-3.5">
                {FEATURES.map((txt) => (
                  <li key={txt} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-[1px] h-5 w-5 text-teal-300/85 flex-shrink-0" />
                    <span className="text-[15px] text-slate-50/95">{txt}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 mb-4 h-px bg-white/10" />

              <SmartCheckoutCTA
                productName="Kit de 7 Días — Reinicio Metabólico"
                basePriceUSD={priceUSD}
                gumroadLink={gumroadUrl}
                mxnRounding="auto-9"
                size="normal"
                dense={false}
              />
            </div>
          </div>
        </motion.div>
      </main>

      <LegalFooter />
    </div>
  );
}