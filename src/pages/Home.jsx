// RUTA: src/pages/Home.jsx
import React from "react";
import { CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import SmartCheckoutCTA from "../components/SmartCheckoutCTA";

/**
 * Versión COMPACTA + LUMINOSA (optimizada para escala 150%)
 * - Fondo azul/teal con radiales claras (más “vivo”, menos fúnebre)
 * - Paddings y tamaños reducidos para caber sin scroll en 1280×720 (≈ 1920×1080 @ 150%)
 * - Héroe + Panel “glass” (vidrio) con sombra suave y alto contraste
 * - Accesible: h1 único, roles correctos, buen contraste
 *
 * No requiere librerías nuevas. Mantiene tu SmartCheckoutCTA.
 */

const FEATURES = [
  "El Menú Exacto para apagar la inflamación.",
  "Recetas Deliciosas y Simples, sin ingredientes raros.",
  "Lista de Compras Inteligente para una sola visita al súper.",
];

export default function Home() {
  const priceUSD = Number(import.meta.env.VITE_KIT_PRICE_USD) || 7;
  const gumroadUrl = import.meta.env.VITE_GUMROAD_KIT_URL;

  return (
    <div className="min-h-screen text-slate-900 font-sans relative overflow-hidden flex flex-col"
         style={{ background: "linear-gradient(180deg,#0f1f2e 0%, #0e2f3b 55%, #0b3840 100%)" }}>
      {/* Radiales luminosas (teal + azules) para dar vida */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 mix-blend-screen opacity-70"
           style={{
             background:
               "radial-gradient(900px 520px at 12% 30%, rgba(0,200,210,.35), transparent 60%), " +
               "radial-gradient(700px 420px at 82% 22%, rgba(90,170,255,.25), transparent 60%)"
           }} />
      {/* Vignette suave para foco central */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0"
           style={{
             background:
               "radial-gradient(80% 60% at 50% 8%, rgba(255,255,255,.10), transparent 70%), " +
               "radial-gradient(120% 90% at 50% 110%, rgba(0,0,0,.35), transparent 70%)"
           }} />

      {/* Header COMPACTO (reduce alto total) */}
      <header role="banner" className="sticky top-0 z-20 bg-white/8 backdrop-blur-md border-b border-white/15">
        <div className="mx-auto w-full max-w-[1080px] px-4 py-2">
          <div className="flex items-center justify-between">
            <h1 className="text-[13px] font-bold tracking-tight text-white">Reinicio Metabólico</h1>
            <div className="hidden md:flex items-center gap-2 text-[11.5px] text-teal-200/90">
              <ShieldCheck className="h-4 w-4" />
              Compra 100% segura
            </div>
          </div>
        </div>
      </header>

      {/* Main COMPACTO: paddings medidos para viewport bajo */}
      <main role="main" className="flex-1">
        <section aria-labelledby="hero-title" className="mx-auto w-full max-w-[1080px] px-4 py-5 md:py-6">
          <div className="grid grid-cols-1 md:grid-cols-[1.05fr,0.95fr] gap-7 md:gap-10 items-center">
            {/* IZQUIERDA — Héroe */}
            <div className="text-center md:text-left text-white">
              <div className="flex justify-center md:justify-start mb-3 md:mb-4">
                <img
                  src="/llave-maestra.png"
                  alt=""
                  aria-hidden="true"
                  className="w-32 h-32 md:w-36 md:h-36 object-contain drop-shadow-[0_14px_38px_rgba(0,200,210,0.35)]"
                  loading="eager"
                  decoding="async"
                />
              </div>

              <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-teal-500/15 text-teal-200 border border-teal-300/25 text-[10.5px] uppercase tracking-[0.18em]">
                <Sparkles className="h-3.5 w-3.5" />
                PDF DE ACCIÓN INMEDIATA
              </span>

              <h2 id="hero-title"
                  className="mt-2 text-[30px] md:text-[34px] leading-[1.12] font-extrabold tracking-[-0.015em]">
                Tu <span className="text-teal-200">Sistema de 7 Días</span>
              </h2>

              <p className="mt-2.5 max-w-[560px] mx-auto md:mx-0 text-[15.5px] md:text-[16px] text-slate-100/85">
                Deja de adivinar. Te entregamos el plan exacto para decidir cada
                comida con claridad y recuperar tu energía.
              </p>
            </div>

            {/* DERECHA — Panel “glass” + CTA */}
            <div className="w-full max-w-md mx-auto md:mx-0">
              <div className="rounded-2xl border border-white/20 bg-white/12 backdrop-blur-xl p-5 md:p-5 shadow-[0_16px_55px_-18px_rgba(0,0,0,.55),0_10px_36px_-24px_rgba(0,200,210,.35)]">
                <ul className="space-y-3">
                  {FEATURES.map((txt) => (
                    <li key={txt} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-teal-200 flex-shrink-0" />
                      <span className="text-[15px] text-slate-50/95">{txt}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-5 mb-4 h-px bg-white/15" />

                {/* CTA existente: respeta tu lógica (MXN→MP, USD→Gumroad) */}
                <SmartCheckoutCTA
                  productName="Kit de 7 Días — Reinicio Metabólico"
                  basePriceUSD={priceUSD}
                  gumroadLink={gumroadUrl}
                  mxnRounding="auto-9"
                  size="normal"
                  dense={true}   // más compacto
                />

                <p className="mt-2.5 text-[12px] text-slate-200/80 text-center">
                  Acceso inmediato · Confirmación por email
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer mínimo (no empuja contenido) */}
      <footer role="contentinfo" className="px-4 py-2.5">
        <div className="mx-auto w-full max-w-[1080px]">
          <p className="text-[11.5px] text-slate-200/70">
            © {new Date().getFullYear()} Reinicio Metabólico. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
