// RUTA: src/pages/Home.jsx
import React from "react";
import { CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import SmartCheckoutCTA from "../components/SmartCheckoutCTA";

/**
 * Versión COMPACTA+LUMINOSA v2
 * - Cabe sin scroll incluso con Windows a 150% (≈1280×720)
 * - Llave más grande y mejor centrada visualmente
 * - CTA “glass panel” con menos paddings y mejor contraste
 * - Mensaje final visible (reduce márgenes y tipografías donde importa)
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
    <div
      className="rm-compact min-h-screen text-slate-900 font-sans relative overflow-hidden flex flex-col"
      style={{ background: "linear-gradient(180deg,#102436 0%, #0e3140 55%, #0b3b43 100%)" }}
    >
      {/* Radiales luminosas */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 mix-blend-screen opacity-70"
        style={{
          background:
            "radial-gradient(920px 540px at 14% 32%, rgba(0,200,210,.34), transparent 60%), radial-gradient(720px 430px at 86% 24%, rgba(90,170,255,.24), transparent 60%)",
        }}
      />
      {/* Vignette */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(82% 60% at 50% 8%, rgba(255,255,255,.10), transparent 70%), radial-gradient(120% 90% at 50% 110%, rgba(0,0,0,.35), transparent 70%)",
        }}
      />

      {/* Header COMPACTO */}
      <header role="banner" className="sticky top-0 z-20 bg-white/8 backdrop-blur-md border-b border-white/15">
        <div className="mx-auto w-full max-w-[1060px] px-4 py-2">
          <div className="flex items-center justify-between">
            <h1 className="text-[13px] font-bold tracking-tight text-white">Reinicio Metabólico</h1>
            <div className="hidden md:flex items-center gap-2 text-[11.5px] text-teal-200/90">
              <ShieldCheck className="h-4 w-4" />
              Compra 100% segura
            </div>
          </div>
        </div>
      </header>

      {/* Main COMPACTO */}
      <main role="main" className="flex-1">
        <section aria-labelledby="hero-title" className="mx-auto w-full max-w-[1060px] px-4 py-5 md:py-6">
          <div className="grid grid-cols-1 md:grid-cols-[1.1fr,0.9fr] gap-7 md:gap-9 items-center">
            {/* IZQUIERDA — Héroe */}
            <div className="text-center md:text-left text-white">
              {/* Llave más grande y centrada respecto al bloque de texto */}
              <div className="flex justify-center md:justify-start mb-3 md:mb-4">
                <img
                  src="/llave-maestra.png"
                  alt=""
                  aria-hidden="true"
                  className="hero-img w-36 h-36 md:w-44 md:h-44 lg:w-48 lg:h-48 object-contain drop-shadow-[0_16px_40px_rgba(0,200,210,0.32)]"
                  loading="eager"
                  decoding="async"
                />
              </div>

              <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-teal-500/15 text-teal-200 border border-teal-300/25 text-[10.5px] uppercase tracking-[0.18em]">
                <Sparkles className="h-3.5 w-3.5" />
                PDF DE ACCIÓN INMEDIATA
              </span>

              <h2
                id="hero-title"
                className="shrink-h1 mt-2 text-[30px] md:text-[34px] leading-[1.12] font-extrabold tracking-[-0.015em]"
              >
                Tu <span className="text-teal-200">Sistema de 7 Días</span>
              </h2>

              <p className="mt-2.5 max-w-[560px] mx-auto md:mx-0 text-[15.5px] md:text-[16px] text-slate-100/90">
                Deja de adivinar. Te entregamos el plan exacto para decidir cada
                comida con claridad y recuperar tu energía.
              </p>
            </div>

            {/* DERECHA — Panel + CTA */}
            <div className="w-full max-w-md mx-auto md:mx-0">
              <div className="rounded-2xl border border-white/18 bg-white/12 backdrop-blur-xl p-4.5 md:p-5 shadow-[0_14px_52px_-18px_rgba(0,0,0,.55),0_10px_32px_-24px_rgba(0,200,210,.32)]">
                <ul className="space-y-2.5">
                  {FEATURES.map((txt) => (
                    <li key={txt} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-teal-200 flex-shrink-0" />
                      <span className="text-[14.8px] text-slate-50/95">{txt}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4.5 mb-3.5 h-px bg-white/14" />

                <SmartCheckoutCTA
                  pro
