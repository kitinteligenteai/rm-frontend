// RUTA: src/pages/Programa.jsx
// Reinicio Metabólico — Programa Completo (v7.6)
// Un solo acceso premium con dos modos de uso

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Sparkles, ShieldCheck } from "lucide-react";
import SmartCheckoutCTA from "../components/SmartCheckoutCTA";

export default function Programa() {
  const priceUSD = Number(import.meta.env.VITE_PROG_PRICE_USD) || 75;
  const gumroadUrl = import.meta.env.VITE_GUMROAD_PROG_URL;
  const fromKit =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("from") === "kit";

  useEffect(() => {
    document.title = "Programa Completo - Reinicio Metabólico";
  }, []);

  const featuresGeneral = [
    "Acceso anual completo sin suscripciones.",
    "Actualizaciones automáticas y mejoras de contenido.",
    "Gimnasio digital con rutinas guiadas (principiante, intermedio, avanzado).",
    "Biblioteca base con 10 artículos esenciales.",
    "Bitácora visual para seguir tu progreso semanal.",
  ];

  const featuresEssential = [
    "Plantillas semanales listas con combinaciones prácticas.",
    "Listas del súper instantáneas sin exceso de compras.",
    "Opciones rápidas sin horno: sartén o microondas.",
    "Incluye insumos base y condimentos para toda la semana.",
  ];

  const featuresPlanner = [
    "Selecciona recetas desde la bóveda completa.",
    "Organiza tus menús por día y horario (drag & drop).",
    "Genera automáticamente la lista del súper con cantidades exactas.",
    "Guarda tus combinaciones favoritas para reusar cada semana.",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-slate-100 font-sans">
      {/* Header */}
      <header className="w-full border-b border-white/10 backdrop-blur-md bg-white/5 sticky top-0 z-20">
        <div className="mx-auto w-full max-w-[1120px] px-4 sm:px-6 py-3">
          <h1 className="text-lg md:text-xl font-semibold tracking-tight text-white">
            Reinicio Metabólico
          </h1>
        </div>
      </header>

      {/* Banner post-compra */}
      {fromKit && (
        <div className="bg-emerald-600/20 border-b border-emerald-500/30">
          <div className="mx-auto w-full max-w-[1120px] px-4 sm:px-6 py-2 text-sm flex items-center gap-2 text-emerald-200">
            <Sparkles className="h-4 w-4" />
            <span>
              ¡Excelente avance! Da el siguiente paso y desbloquea el sistema completo.
            </span>
          </div>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <main className="mx-auto w-full max-w-[1120px] px-4 sm:px-6 lg:px-8 py-10 lg:py-14 space-y-12">
        {/* HERO */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center max-w-2xl mx-auto"
        >
          <p className="text-[11px] uppercase tracking-[0.18em] text-teal-300/80 font-semibold">
            Acceso Premium
          </p>
          <h2 className="mt-2 text-4xl md:text-5xl font-extrabold leading-tight text-white">
            Convierte tus{" "}
            <span className="text-teal-400">7 días</span> en un año de resultados reales
          </h2>
          <p className="mt-4 text-slate-300 text-lg">
            El Programa Completo te da acceso a todas las herramientas para mantener tu
            progreso a largo plazo. Un solo pago. Sin suscripciones. Tú decides el ritmo.
          </p>
        </motion.section>

        {/* MODOS DE USO */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10"
        >
          {/* Guía Esencial */}
          <div className="border border-white/10 bg-slate-800/40 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-2">Guía Esencial</h3>
            <p className="text-slate-400 mb-4">
              Ideal para semanas con poco tiempo. Usa plantillas listas y obtén tu lista
              del súper al instante para comer bien sin pensar demasiado.
            </p>
            <ul className="space-y-2">
              {featuresEssential.map((txt) => (
                <li key={txt} className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-teal-400 mt-0.5" />
                  <span className="text-slate-200">{txt}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Planeador Inteligente */}
          <div className="border border-white/10 bg-slate-800/40 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-2">Planeador Inteligente</h3>
            <p className="text-slate-400 mb-4">
              Perfecto cuando tienes más tiempo o motivación. Crea tu menú semanal
              personalizado y deja que el sistema genere tu lista de compras exacta.
            </p>
            <ul className="space-y-2">
              {featuresPlanner.map((txt) => (
                <li key={txt} className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-teal-400 mt-0.5" />
                  <span className="text-slate-200">{txt}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.section>

        {/* BLOQUE GENERAL DE BENEFICIOS */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="border border-white/10 bg-white/5 rounded-2xl p-8 backdrop-blur-xl shadow-2xl"
        >
          <h3 className="text-2xl font-bold text-white mb-4 text-center">
            Todo lo que incluye tu acceso premium
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-200">
            {featuresGeneral.map((txt) => (
              <li key={txt} className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-teal-400 mt-0.5" />
                <span>{txt}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex justify-center">
            <SmartCheckoutCTA
              productName="Programa Completo – Acceso anual"
              basePriceUSD={priceUSD}
              gumroadLink={gumroadUrl}
              mxnRounding="auto-9"
            />
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-400">
            <ShieldCheck className="h-5 w-5 text-teal-400" />
            <span>Compra 100 % segura • Acceso inmediato tras el pago</span>
          </div>
        </motion.section>

        {/* Mensaje final */}
        <div className="text-center mt-10 text-slate-400 text-sm">
          Precio único: $75 USD (≈ $1 299 MXN) • Acceso anual a todas las herramientas
        </div>
      </main>

      {/* Footer */}
      <footer className="mx-auto w-full max-w-[1120px] px-4 sm:px-6 lg:px-8 py-10 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Reinicio Metabólico. Todos los derechos reservados.
      </footer>
    </div>
  );
}
