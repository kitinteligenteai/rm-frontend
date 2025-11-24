// RUTA: src/pages/Upsell.jsx
// Página oficial de Upsell del Programa Completo
// Usa SmartCheckoutCTA y texto basado en tu Manual Maestro

import React from "react";
import SmartCheckoutCTA from "../components/SmartCheckoutCTA";

export default function UpsellPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-gray-800/60 rounded-3xl p-10 shadow-xl backdrop-blur-lg border border-white/10">
        
        <h1 className="text-4xl font-extrabold text-teal-400 text-center">
          ¡Bienvenido al siguiente paso!
        </h1>

        <p className="mt-6 text-lg text-gray-300 leading-relaxed text-center">
          Ya diste el primer paso con el <strong>Kit de Activación Metabólica de 7 Días</strong>.
          Ahora es momento de convertir ese impulso inicial en un cambio permanente.
        </p>

        <p className="mt-4 text-gray-400 text-center">
          El <strong>Programa Anual de Reinicio Metabólico</strong> es un sistema completo para 
          ayudarte a estabilizar tu energía, reducir antojos, mejorar tu composición corporal 
          y crear un estilo de vida sostenible.
        </p>

        <div className="mt-10">
          <SmartCheckoutCTA 
            productName="Reinicio Metabólico — Acceso Anual"
            basePriceUSD={75}
            gumroadLink="https://inteligentekit.gumroad.com/l/snxlh"
          />
        </div>

        <div className="mt-10 text-sm text-gray-400 leading-relaxed text-center">
          Acceso anual completo • Compra protegida • Soporte incluido
        </div>

      </div>
    </div>
  );
}
