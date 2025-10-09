// RUTA: src/pages/Home.jsx (Versión Final de Diseño Equilibrado)
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
      <main className="flex-grow flex items-center justify-center w-full px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          // CAMBIO CLAVE: Volvemos a un grid de 2 columnas, pero con proporciones controladas
          className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-[1fr,0.9fr] gap-8 items-center"
        >
          {/* Columna 1: Imagen y Título */}
          <div className="text-center md:text-left">
            <div className="flex justify-center md:justify-start mb-4">
              <img
                src="/llave-maestra.png"
                alt=""
                aria-hidden="true"
                className="w-40 h-40 object-contain drop-shadow-xl"
              />
            </div>
            <p className="text-sm font-semibold uppercase tracking-widest text-teal-400">
              PDF DE ACCIÓN INMEDIATA
            </p>
            <h2 className="mt-2 text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              Tu <span className="text-teal-400">Sistema de 7 Días</span>
            </h2>
            <p className="mt-3 max-w-md mx-auto md:mx-0 text-base text-slate-300">
              Deja de adivinar. Te entregamos el plan exacto para decidir cada comida con claridad y recuperar tu energía.
            </p>
          </div>

          {/* Columna 2: Características y CTA de Compra */}
          <div className="w-full max-w-md mx-auto">
            <div className="rounded-2xl border border-white/10 bg-slate-800/40 p-6">
              <ul className="space-y-3">
                {FEATURES.map((txt) => (
                  <li key={txt} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-1 h-5 w-5 text-teal-400 flex-shrink-0" />
                    <span className="text-base text-slate-200">{txt}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 border-t border-white/10"></div>

              <div className="mt-6">
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
          </div>
        </motion.div>
      </main>
    </div>
  );
}
