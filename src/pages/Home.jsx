// RUTA: src/pages/Home.jsx (Versión de Foco Absoluto - Cero Scroll Garantizado)
import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import SmartCheckoutCTA from "../components/SmartCheckoutCTA";

const FEATURES = [
  "El Menú Exacto para apagar la inflamación.",
  "Recetas Deliciosas y Simples, sin ingredientes raros.",
  "Lista de Compras Inteligente para una sola visita al súper.",
];

export default function Home() {
  const priceUSD = Number(import.meta.env.VITE_KIT_PRICE_USD) || 7;
  const gumroadUrl = import.meta.env.VITE_GUMROAD_KIT_URL;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-slate-100 font-sans flex flex-col">
      
      <header className="sticky top-0 z-20 bg-slate-900/60 backdrop-blur-md border-b border-white/10">
        <div className="mx-auto max-w-5xl px-4 py-3">
          <h1 className="text-base font-bold tracking-tight text-white">Reinicio Metabólico</h1>
        </div>
      </header>

      {/* Contenedor principal que centra todo vertical y horizontalmente */}
      <main className="flex-grow flex items-center justify-center w-full px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          // CAMBIO RADICAL: Contenedor de una sola columna, centrado y estrecho
          className="w-full max-w-lg mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 items-center"
        >
          {/* Columna 1: Título y Características */}
          <div className="text-center md:text-left">
            <p className="text-sm font-semibold uppercase tracking-widest text-teal-400">
              PDF DE ACCIÓN INMEDIATA
            </p>
            <h2 className="mt-2 text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              Tu <span className="text-teal-400">Sistema de 7 Días</span>
            </h2>
            <p className="mt-4 max-w-md mx-auto md:mx-0 text-base text-slate-300">
              Deja de adivinar. Te entregamos el plan exacto para decidir cada comida con claridad.
            </p>
            <ul className="mt-5 space-y-3 text-left">
              {FEATURES.map((txt) => (
                <li key={txt} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 h-5 w-5 text-teal-400 flex-shrink-0" />
                  <span className="text-base text-slate-200">{txt}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 2: Imagen y CTA de Compra */}
          <div className="flex flex-col items-center">
            <img
              src="/llave-maestra.png"
              alt=""
              aria-hidden="true"
              className="w-32 h-32 object-contain drop-shadow-xl mb-5"
            />
            <div className="w-full max-w-sm">
              <SmartCheckoutCTA
                productName="Kit de 7 Días Reinicio Metabólico"
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
    </div>
  );
}
