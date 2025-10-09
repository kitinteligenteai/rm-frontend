// RUTA: src/pages/Home.jsx (Versión Final - Cero Scroll Desktop y optimizado para Móvil)
import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import SmartCheckoutCTA from "../components/SmartCheckoutCTA";

const FEATURES = [
  "El Menú Exacto: qué comer y cuándo para apagar la inflamación.",
  "Recetas Deliciosas y Simples: diseñadas para sanar, sin ingredientes raros.",
  "Lista de Compras Inteligente: organizada para una sola visita al súper.",
];

export default function Home() {
  const priceUSD = Number(import.meta.env.VITE_KIT_PRICE_USD) || 7;
  const gumroadUrl = import.meta.env.VITE_GUMROAD_KIT_URL;

  return (
    // CAMBIO CLAVE 1: Usamos flexbox para centrar el contenido verticalmente en pantallas grandes
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-slate-100 flex flex-col">
      
      {/* Header muy bajo */}
      <header className="sticky top-0 z-20 bg-white/5 backdrop-blur-md border-b border-white/10">
        <div className="mx-auto max-w-[980px] px-4 py-2">
          <h1 className="text-base font-semibold tracking-tight">Reinicio Metabólico</h1>
        </div>
      </header>

      {/* CAMBIO CLAVE 2: El main crece para ocupar el espacio y centra la tarjeta */}
      <main className="flex-grow flex items-center justify-center w-full px-4 py-6">
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          // CAMBIO CLAVE 3: El grid ahora es de 1 columna en móvil y 2 en desktop
          className="grid w-full max-w-[980px] md:grid-cols-2 items-center gap-6 rounded-2xl border border-white/10 bg-white/5 p-4 md:p-6 shadow-2xl backdrop-blur-xl"
        >
          {/* Columna imagen (más pequeña y oculta en móvil) */}
          <div className="hidden sm:flex items-center justify-center">
            <img
              src="/llave-maestra.png"
              alt=""
              aria-hidden="true"
              className="w-full max-w-[240px] md:max-w-[280px] object-contain drop-shadow-xl"
              width={280}
              height={280}
              loading="eager"
              fetchPriority="high"
            />
          </div>

          {/* Columna texto + checkout compactados */}
          <div className="md:pr-1">
            <p className="mb-1 text-xs uppercase tracking-widest text-teal-400/80 font-semibold">
              PDF DE ACCIÓN INMEDIATA
            </p>

            <h2 className="text-2xl md:text-3xl font-extrabold leading-tight">
              Tu <span className="text-teal-400">Sistema de 7 Días</span>
            </h2>

            <p className="mt-2 text-sm text-slate-300">
              Deja de adivinar. Te entregamos el plan exacto para decidir cada comida con claridad y recuperar tu energía.
            </p>

            <ul className="mt-4 space-y-2">
              {FEATURES.map((txt) => (
                <li key={txt} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-teal-400 flex-shrink-0" />
                  <span className="text-sm text-slate-200">{txt}</span>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-sm text-slate-300">Un solo pago de</span>
              <span className="text-2xl md:text-3xl font-extrabold text-teal-400">
                ${priceUSD} USD
              </span>
            </div>

            {/* Checkout inteligente (MXN/USD) */}
            <div className="mt-4">
              <SmartCheckoutCTA
                productName="Kit de 7 Días Reinicio Metabólico"
                basePriceUSD={priceUSD}
                gumroadLink={gumroadUrl}
                mxnRounding="auto-9"
                size="compact"
                dense={true}
              />
            </div>
          </div>
        </motion.section>
      </main>

      {/* Footer compacto */}
      <footer className="w-full px-4 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Reinicio Metabólico.
      </footer>
    </div>
  );
}
