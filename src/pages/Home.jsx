// RUTA: src/pages/Home.jsx
import React from "react";
import { CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import SmartCheckoutCTA from "../components/SmartCheckoutCTA";

/**
 * Landing “Esperanza A++”
 * - Paleta luminosa (teal/azules) con radiales de profundidad
 * - Llave protagonista (más grande) y centrada respecto al bloque
 * - Mensaje empático y claro
 * - CTA premium (glass sutil) con solo 2 menciones de confianza (header + bajo botón)
 * - Compacta: cabe bien incluso con escala 150 %
 */

const FEATURES = [
  "Plan exacto: qué comer y cuándo para bajar la inflamación.",
  "Recetas deliciosas y simples, sin ingredientes raros.",
  "Lista de compras inteligente: una sola visita al súper.",
];

export default function Home() {
  const priceUSD = Number(import.meta.env.VITE_KIT_PRICE_USD) || 7;
  const gumroadUrl = import.meta.env.VITE_GUMROAD_KIT_URL;

  return (
    <div
      className="min-h-screen font-sans relative overflow-hidden flex flex-col"
      style={{
        // Fondo luminoso & esperanzador
        background:
          "radial-gradient(1200px 760px at 18% 26%, rgba(0, 207, 219, .32), transparent 60%), radial-gradient(980px 600px at 86% 16%, rgba(120, 195, 255, .22), transparent 60%), linear-gradient(180deg, #103040 0%, #0f3e4a 55%, #0b474e 100%)",
        color: "#f5f7fa",
      }}
    >
      {/* Vignette para foco central */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(85% 60% at 50% 8%, rgba(255,255,255,.08), transparent 70%), radial-gradient(120% 95% at 50% 115%, rgba(0,0,0,.28), transparent 70%)",
        }}
      />

      {/* HEADER — sello confianza (1 de 2) */}
      <header role="banner" className="sticky top-0 z-20 bg-white/10 backdrop-blur-md border-b border-white/15">
        <div className="mx-auto w-full max-w-[1060px] px-5 py-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h1 className="text-white font-extrabold text-[16px] leading-none tracking-tight">
                Reinicio Metabólico
              </h1>
              <span className="text-teal-100/85 text-[12px] leading-none mt-1">
                Claridad y energía en 7 días
              </span>
            </div>
            <div className="hidden md:flex items-center gap-2 text-[12px] text-teal-100/85">
              <ShieldCheck className="h-4 w-4" />
              Compra 100% segura
            </div>
          </div>
        </div>
      </header>

      {/* MAIN — héroe + consola/CTA */}
      <main role="main" className="flex-1">
        <section aria-labelledby="hero-title" className="mx-auto w-full max-w-[1060px] px-5 py-6 md:py-8">
          <div className="grid grid-cols-1 md:grid-cols-[1.1fr,0.9fr] gap-8 md:gap-10 items-center">
            {/* IZQUIERDA — HÉROE LUMINOSO */}
            <div className="text-center md:text-left">
              {/* Llave protagonista (más grande y con sombra energética) */}
              <div className="flex justify-center md:justify-start mb-4">
                <img
                  src="/llave-maestra.png"
                  alt=""
                  aria-hidden="true"
                  className="w-56 h-56 md:w-64 md:h-64 object-contain drop-shadow-[0_22px_58px_rgba(0,200,210,0.45)]"
                  loading="eager"
                  decoding="async"
                />
              </div>

              <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-teal-400/15 text-teal-100 border border-teal-200/25 text-[11px] uppercase tracking-[0.18em]">
                <Sparkles className="h-3.5 w-3.5" />
                PDF DE ACCIÓN INMEDIATA
              </span>

              <h2
                id="hero-title"
                className="mt-3 text-[36px] md:text-[42px] leading-[1.06] font-extrabold tracking-[-0.015em] text-white"
              >
                Tu <span className="text-teal-200">Sistema de 7 Días</span>
              </h2>

              <p className="mt-3 max-w-[560px] mx-auto md:mx-0 text-[16px] text-slate-100/92">
                Si vienes del dolor y el cansancio, aquí recuperas claridad. Te damos el
                plan exacto para decidir cada comida con confianza — y volver a sentir energía.
              </p>
            </div>

            {/* DERECHA — CONSOLA / CTA */}
            <div className="w-full max-w-md mx-auto md:mx-0">
              <div className="rounded-2xl border border-white/18 bg-white/14 backdrop-blur-xl p-5 shadow-[0_16px_55px_-18px_rgba(0,0,0,.52),0_12px_36px_-22px_rgba(0,190,210,.35)]">
                <ul className="space-y-3">
                  {FEATURES.map((txt) => (
                    <li key={txt} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-teal-100 flex-shrink-0" />
                      <span className="text-[15px] text-slate-50/95">{txt}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-5 mb-4 h-px bg-white/15" />

                <SmartCheckoutCTA
                  productName="Kit de 7 Días — Reinicio Metabólico"
                  basePriceUSD={priceUSD}
                  gumroadLink={gumroadUrl}
                  mxnRounding="auto-9"
                  size="normal"
                  dense={true}
                />

                {/* Confianza puntual (2 de 2) */}
                <p className="mt-2 text-[12.5px] text-teal-50/90 text-center">
                  Compra 100% segura · Confirmación inmediata
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER mínimo */}
      <footer role="contentinfo" className="px-5 py-3">
        <div className="mx-auto w-full max-w-[1060px]">
          <p className="text-[11.5px] text-slate-100/75">
            © {new Date().getFullYear()} Reinicio Metabólico. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
