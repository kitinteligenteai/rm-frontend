// RUTA: src/pages/Programa.jsx
// Página de Upsell (Programa Completo) sin react-helmet-async, optimizada 1366×768

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import SmartCheckoutCTA from "../components/SmartCheckoutCTA";

const features = [
  "Acceso ANUAL a la plataforma completa.",
  "Calibrador de Saciedad: elimina el hambre entre comidas.",
  "Planificador Inteligente: adapta tu menú semanal con un clic.",
  "Bóveda con más de 60 Recetas alineadas al sistema.",
  "Gimnasio Digital con progresión semana a semana.",
  "Bitácora de Progreso para convertir logros en motivación.",
];

export default function Programa() {
  // Variables de entorno
  const priceUSD = Number(import.meta.env.VITE_PROG_PRICE_USD) || 75;
  const gumroadUrl = import.meta.env.VITE_GUMROAD_PROG_URL;

  // SEO básico
  useEffect(() => {
    const title = "Programa Completo - Reinicio Metabólico";
    const description =
      "Accede a la plataforma completa de Reinicio Metabólico: planes, recetas, gimnasio digital y herramientas para resultados permanentes.";

    document.title = title;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", description);
  }, []);

  // Banner si viene de la compra del Kit: /programa?from=kit
  const fromKit = typeof window !== "undefined" &&
                  new URLSearchParams(window.location.search).get("from") === "kit";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-slate-100 font-sans">
      {/* Header compacto */}
      <header className="w-full border-b border-white/10 backdrop-blur-md bg-white/5 sticky top-0 z-20">
        <div className="mx-auto w-full max-w-[1120px] px-4 sm:px-6 py-3">
          <h1 className="text-lg md:text-xl font-semibold tracking-tight text-white">
            Reinicio Metabólico
          </h1>
        </div>
      </header>

      {/* Banner post-compra (opcional) */}
      {fromKit && (
        <div className="bg-emerald-600/20 border-b border-emerald-500/30">
          <div className="mx-auto w-full max-w-[1120px] px-4 sm:px-6 py-2 text-sm flex items-center gap-2 text-emerald-200">
            <Sparkles className="h-4 w-4" />
            <span>¡Compra confirmada! Aprovecha tu acceso anual con descuento exclusivo.</span>
          </div>
        </div>
      )}

      {/* Contenido */}
      <main className="mx-auto w-full max-w-[1120px] px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8 shadow-2xl backdrop-blur-xl"
        >
          {/* Columna de texto */}
          <div>
            <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-teal-300/80 font-semibold">
              Oferta exclusiva post-compra
            </p>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight text-white [text-wrap:balance]">
              Da el salto a la <span className="text-teal-400">Transformación Total</span>
            </h2>

            <p className="mt-3 text-slate-300">
              El Kit de 7 días enciende la chispa. El programa completo consolida hábitos,
              acelera resultados y te mantiene en camino durante todo el año.
            </p>

            <ul className="mt-5 space-y-3">
              {features.map((txt) => (
                <li key={txt} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-teal-400 flex-shrink-0" />
                  <span className="text-slate-200">{txt}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-center gap-2 text-teal-300">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm">
                Disponible ahora. No volverá a mostrarse a este precio.
              </span>
            </div>
          </div>

          {/* Columna de pago */}
          <aside className="border border-white/10 bg-slate-800/50 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
            <h3 className="text-xl font-bold text-center text-white mb-3">
              Acceso Anual a la Plataforma
            </h3>

            <div className="mb-2 flex items-baseline justify-center gap-2">
              <span className="text-slate-300">Un solo pago de</span>
              <span className="text-2xl md:text-3xl font-extrabold text-teal-400">
                ${priceUSD} USD
              </span>
            </div>

            <SmartCheckoutCTA
              productName="Programa Completo – Acceso anual"
              basePriceUSD={priceUSD}
              gumroadLink={gumroadUrl}
              mxnRounding="auto-9"
            />

            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-400">
              <ShieldCheck className="h-5 w-5 text-teal-400" />
              <span>Garantía de 15 días. Compra 100% segura.</span>
            </div>
          </aside>
        </motion.section>
      </main>

      <footer className="mx-auto w-full max-w-[1120px] px-4 sm:px-6 lg:px-8 py-10 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Reinicio Metabólico. Todos los derechos reservados.
      </footer>
    </div>
  );
}
