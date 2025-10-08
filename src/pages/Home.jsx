// RUTA: src/pages/Home.jsx
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-slate-100 font-sans">
      <header className="w-full border-b border-white/10 backdrop-blur-md bg-white/5 sticky top-0 z-20">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <h1 className="text-lg md:text-xl font-semibold tracking-tight text-white">Reinicio Metabólico</h1>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="grid md:grid-cols-2 items-center gap-8 rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 shadow-xl backdrop-blur-xl"
        >
          {/* imagen */}
          <div className="flex items-center justify-center">
            <img
              src="/llave-maestra.png"
              alt="Sistema de Acción Inmediata - Llave"
              className="w-full max-w-[340px] lg:max-w-[360px] object-contain drop-shadow-xl"
              width={360}
              height={360}
              loading="eager"
              fetchPriority="high"
            />
          </div>

          {/* copy + checkout */}
          <div>
            <p className="mb-2 text-[10px] md:text-xs uppercase tracking-[0.2em] text-teal-400/80 font-semibold">
              PDF DE ACCIÓN INMEDIATA
            </p>

            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight text-white">
              Tu <span className="text-teal-400">Sistema de 7 Días</span>
            </h2>

            <p className="mt-3 text-sm md:text-base text-slate-300">
              Deja de adivinar. Te entregamos el plan exacto para decidir cada comida con claridad y recuperar tu energía.
            </p>

            <ul className="mt-5 space-y-2">
              {FEATURES.map((txt) => (
                <li key={txt} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 md:h-5 md:w-5 text-teal-400 flex-shrink-0" />
                  <span className="text-sm md:text-base text-slate-200">{txt}</span>
                </li>
              ))}
            </ul>

            <div className="mt-5 flex items-baseline gap-2">
              <span className="text-slate-300 text-sm">Un solo pago de</span>
              <span className="text-2xl md:text-3xl font-extrabold text-teal-400">${priceUSD} USD</span>
            </div>

            <div className="mt-5">
              <SmartCheckoutCTA
                productName="Kit de 7 Días Reinicio Metabólico"
                basePriceUSD={priceUSD}
                gumroadLink={gumroadUrl}
                mxnRounding="auto-9"
              />
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-[12px] md:text-sm text-slate-400">
              <ShieldCheck className="h-4 w-4 md:h-5 md:w-5 text-teal-400" />
              <span>Compra 100% segura. Acceso instantáneo.</span>
            </div>
          </div>
        </motion.section>
      </main>

      <footer className="mx-auto max-w-6xl px-4 py-6 text-center text-[11px] md:text-xs text-slate-500">
        © {new Date().getFullYear()} Reinicio Metabólico. Todos los derechos reservados.
      </footer>
    </div>
  );
}
