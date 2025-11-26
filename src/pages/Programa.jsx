// RUTA: src/pages/Programa.jsx
// Versión v8.4 - FIX DE RUTA (Build Repair)

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Sparkles, ShieldCheck } from "lucide-react";
// ✅ CORRECCIÓN CRÍTICA: Importamos directo de components (Opción A)
import SmartCheckoutCTA from "../components/SmartCheckoutCTA";

export default function Programa() {
  // Enlace real de Gumroad configurado
  const gumroadUrl = "https://inteligentekit.gumroad.com/l/snxlh";
  
  const fromKit =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("from") === "kit";

  useEffect(() => {
    document.title = "Programa Completo - Reinicio Metabólico";
    window.scrollTo(0, 0);
  }, []);

  const featuresGeneral = [
    "Acceso anual completo sin suscripciones.",
    "Actualizaciones automáticas y mejoras de contenido.",
    "Gimnasio digital con rutinas guiadas.",
    "Biblioteca base con 10 artículos esenciales.",
    "Bitácora visual para seguir tu progreso.",
  ];

  const featuresEssential = [
    "Plantillas semanales listas para usar.",
    "Listas del súper instantáneas.",
    "Opciones rápidas sin horno.",
    "Insumos base para toda la semana.",
  ];

  const featuresPlanner = [
    "Bóveda de recetas completa (+100 opciones).",
    "Organizador de menús Drag & Drop.",
    "Generador automático de compras.",
    "Guardado de combinaciones favoritas.",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-slate-100 font-sans">
      <header className="w-full border-b border-white/10 backdrop-blur-md bg-white/5 sticky top-0 z-20">
        <div className="mx-auto w-full max-w-[1120px] px-4 sm:px-6 py-3 flex justify-between items-center">
          <h1 className="text-lg md:text-xl font-semibold tracking-tight text-white">
            Reinicio Metabólico
          </h1>
          <span className="text-[10px] uppercase font-bold bg-teal-500/10 text-teal-400 px-2 py-1 rounded border border-teal-500/20">
            Nivel Premium
          </span>
        </div>
      </header>

      {fromKit && (
        <div className="bg-emerald-600/20 border-b border-emerald-500/30 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="mx-auto w-full max-w-[1120px] px-4 sm:px-6 py-3 text-sm flex items-center justify-center md:justify-start gap-2 text-emerald-100 font-medium">
            <Sparkles className="h-4 w-4 text-emerald-300" />
            <span>
              ¡Excelente decisión! Estás a un paso de desbloquear el sistema completo.
            </span>
          </div>
        </div>
      )}

      <main className="mx-auto w-full max-w-[1120px] px-4 sm:px-6 lg:px-8 py-10 lg:py-14 space-y-12">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <p className="text-[11px] md:text-xs uppercase tracking-[0.2em] text-teal-300/90 font-bold mb-3">
            Oferta Especial
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-white mb-6">
            Convierte tus <span className="text-teal-400">7 días</span> en<br className="hidden md:block" /> un año de resultados.
          </h2>
          <p className="text-slate-300 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
            Accede a todas las herramientas avanzadas, rutinas y la bóveda de recetas para mantener tu progreso a largo plazo.
          </p>
        </motion.section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="border border-white/10 bg-slate-800/40 rounded-2xl p-6 backdrop-blur-xl">
            <h3 className="text-xl font-bold text-white mb-4">Modo Rápido</h3>
            <ul className="space-y-3">
              {featuresEssential.map((txt) => (
                <li key={txt} className="flex gap-3 text-sm text-slate-300">
                  <CheckCircle2 className="h-5 w-5 text-indigo-400 shrink-0" /> {txt}
                </li>
              ))}
            </ul>
          </div>
          <div className="border border-white/10 bg-slate-800/40 rounded-2xl p-6 backdrop-blur-xl">
            <h3 className="text-xl font-bold text-white mb-4">Modo Experto</h3>
            <ul className="space-y-3">
              {featuresPlanner.map((txt) => (
                <li key={txt} className="flex gap-3 text-sm text-slate-300">
                  <CheckCircle2 className="h-5 w-5 text-teal-400 shrink-0" /> {txt}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="relative border border-teal-500/30 bg-gradient-to-b from-slate-900 to-black rounded-3xl p-8 md:p-12 shadow-2xl flex flex-col items-center"
        >
          <h3 className="text-2xl font-bold text-white mb-8 text-center">Tu acceso total incluye:</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-200 w-full max-w-3xl mb-10">
            {featuresGeneral.map((txt) => (
              <li key={txt} className="flex gap-3 items-center bg-white/5 p-3 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-teal-400" /> <span className="text-sm">{txt}</span>
              </li>
            ))}
          </ul>

          <div className="w-full max-w-md">
            <SmartCheckoutCTA
              productId="programa-completo"
              gumroadLink={gumroadUrl}
            />
          </div>

          <div className="mt-8 flex gap-2 text-xs text-slate-500 items-center bg-white/5 px-4 py-2 rounded-full">
            <ShieldCheck className="h-4 w-4 text-teal-500" />
            <span>Garantía de satisfacción • Acceso inmediato</span>
          </div>
        </motion.section>
      </main>

      <footer className="w-full border-t border-white/5 bg-black/40 py-8 text-center text-xs text-slate-600">
        © {new Date().getFullYear()} Reinicio Metabólico.
      </footer>
    </div>
  );
}