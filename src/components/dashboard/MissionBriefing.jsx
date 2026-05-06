import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, CheckCircle2, Info, ArrowRight } from "lucide-react";

export default function MissionBriefing({ latestWeight, userProfile }) {
  const isCalibrated =
    latestWeight !== null ||
    userProfile?.hasCompletedOnboarding ||
    userProfile?.goal;

  if (!isCalibrated) {
    return (
      <section className="bg-gradient-to-br from-slate-900 to-indigo-900 border border-indigo-400/20 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none text-indigo-300">
          <Sparkles size={120} />
        </div>

        <div className="flex flex-col md:flex-row items-start gap-6 relative z-10">
          <div className="p-4 rounded-2xl bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            <Sparkles size={32} />
          </div>

          <div className="flex-1">
            <p className="text-xs font-bold tracking-[0.2em] text-indigo-400 mb-2 uppercase">
              Primeros pasos
            </p>

            <h2 className="text-3xl font-bold text-white mb-3">
              Personalicemos tu Reinicio
            </h2>

            <p className="text-slate-300 text-lg leading-relaxed max-w-2xl mb-6">
              Para entregarte métricas más útiles y recomendaciones a medida,
              necesitamos sincronizar tus datos base. Comienza registrando tu
              estado actual.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link
                to="/plataforma/bitacora"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg hover:scale-[1.02]"
              >
                Completar mi perfil
                <ArrowRight size={18} />
              </Link>

              <span className="flex items-center gap-2 text-sm text-slate-400 font-medium">
                <Info size={16} className="text-indigo-400" />
                Puedes usar las herramientas esenciales desde ahora.
              </span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
      <div className="flex items-center gap-4">
        <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 size={24} />
        </div>

        <div>
          <h2 className="text-xl font-bold text-white">
            Tu sistema está listo
          </h2>
          <p className="text-slate-400 text-sm">
            Hoy solo enfócate en completar tu misión diaria.
          </p>
        </div>
      </div>
    </section>
  );
}