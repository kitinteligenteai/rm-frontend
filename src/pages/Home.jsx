// RUTA: src/pages/Home.jsx (ultra-compact v2)
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-slate-100">
      {/* Header muy bajo */}
      <header className="sticky top-0 z-20 bg-white/5 backdrop-blur-md border-b border-white/10">
        <div className="mx-auto max-w-[980px] px-3 py-2">
          <h1 className="text-[15px] font-semibold tracking-tight">Reinicio Metabólico</h1>
        </div>
      </header>

      {/* Contenido centrado y más estrecho */}
      <main className="mx-auto max-w-[980px] px-3 py-4">
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="grid md:grid-cols-2 items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 md:p-5 shadow-xl backdrop-blur-xl"
        >
          {/* Columna imagen (más pequeña) */}
          <div className="flex items-center justify-center">
            <img
              src="/llave-maestra.png"
              alt=""
              aria-hidden="true"
              className="w-full max-w-[240px] md:max-w-[260px] lg:max-w-[280px] object-contain drop-shadow-xl"
              width={280}
              height={280}
              loading="eager"
              fetchPriority="high"
            />
          </div>

          {/* Columna texto + checkout compactados */}
          <div className="md:pr-1">
            <p className="mb-1 text-[10px] uppercase tracking-[0.18em] text-teal-400/80 font-semibold">
              PDF DE ACCIÓN INMEDIATA
            </p>

            <h2 className="text-[26px] md:text-[28px] font-extrabold leading-snug">
              Tu <span className="text-teal-400">Sistema de 7 Días</span>
            </h2>

            <p className="mt-1.5 text-[13px] text-slate-300">
              Deja de adivinar. Te entregamos el plan exacto para decidir cada comida con claridad y
              recuperar tu energía.
            </p>

            <ul className="mt-3 space-y-1.5">
              {FEATURES.map((txt) => (
                <li key={txt} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-teal-400 flex-shrink-0" />
                  <span className="text-[13px] text-slate-200">{txt}</span>
                </li>
              ))}
            </ul>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-slate-300 text-[13px]">Un solo pago de</span>
              <span className="text-[22px] md:text-[24px] font-extrabold text-teal-400">
                ${priceUSD} USD
              </span>
            </div>

            {/* Checkout inteligente (MXN/USD) */}
            <div className="mt-3">
              <SmartCheckoutCTA
                productName="Kit de 7 Días Reinicio Metabólico"
                basePriceUSD={priceUSD}
                gumroadLink={gumroadUrl}
                mxnRounding="auto-9"
                // Compactar el card interno del CTA (estas props ya las soporta nuestro componente)
                size="compact"          // usa variantes pequeñas internas
                dense={true}            // reduce paddings y fuentes dentro del CTA
              />
            </div>

            <div className="mt-3 flex items-center gap-2 text-[12px] text-slate-400">
              <ShieldCheck className="h-4 w-4 text-teal-400" />
              <span>Compra 100% segura. Acceso instantáneo.</span>
            </div>
          </div>
        </motion.section>
      </main>

      <footer className="mx-auto max-w-[980px] px-3 py-4 text-center text-[11px] text-slate-500">
        © {new Date().getFullYear()} Reinicio Metabólico.
      </footer>
    </div>
  );
}
