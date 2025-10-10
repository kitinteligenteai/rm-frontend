// RUTA: src/pages/Home.jsx (Versión Final de Diseño Equilibrado)
import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import SmartCheckoutCTA from "../components/SmartCheckoutCTA";

const FEATURES = [
  "El Menú Exacto para apagar la inflamación.",
  "Recetas Deliciosas y Simples, sin ingredientes raros.",
  "Lista de Compras Inteligente para una sola visita al súper.",
];

export default function Home() {
  const priceUSD = Number(import.meta.env.VITE_KIT_PRICE_USD) || 7;
  const gumroadUrl = import.meta.env.VITE_GUMROAD_KIT_URL;

  return (
    // CAMBIO CLAVE: Usamos flexbox en el contenedor principal para un control total del centrado vertical.
    // font-sans asegura que la tipografía por defecto sea la correcta.
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-slate-100 font-sans flex flex-col">
      
      {/* El header se mantiene igual, es simple y efectivo. */}
      <header className="sticky top-0 z-20 bg-slate-900/60 backdrop-blur-md border-b border-white/10">
        <div className="mx-auto max-w-5xl px-4 py-3">
          <h1 className="text-base font-bold tracking-tight text-white">Reinicio Metabólico</h1>
        </div>
      </header>

      {/* CAMBIO CLAVE: Este 'main' es ahora el responsable de centrar el contenido en el espacio disponible.
          'flex-grow' hace que ocupe todo el alto restante. 'grid' y 'place-items-center' lo centran perfectamente. */}
      <main className="flex-grow grid place-items-center w-full px-4 py-8">
        
        {/* Usamos motion.div para una entrada suave y profesional. */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          // CAMBIO CLAVE: Grid de 2 columnas en desktop (md:). La columna de la derecha (CTA) es más estrecha (0.8fr).
          // 'items-center' alinea verticalmente el contenido de ambas columnas.
          // max-w-5xl nos da un ancho máximo generoso pero controlado.
          className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-[1fr,0.8fr] gap-x-12 lg:gap-x-16 items-center"
        >
          
          {/* Columna Izquierda: La Propuesta de Valor (El "Por qué") */}
          <div className="text-center md:text-left">
            <div className="flex justify-center md:justify-start mb-6">
              {/* CAMBIO CLAVE: Aumentamos el tamaño de la imagen para darle más impacto visual. */}
              <img
                src="/llave-maestra.png"
                alt="Llave maestra del sistema metabólico"
                aria-hidden="true"
                className="w-48 h-48 object-contain drop-shadow-[0_5px_15px_rgba(0,255,255,0.1)]"
              />
            </div>
            
            {/* Jerarquía de texto clara y con espaciado intencionado. */}
            <p className="text-sm font-semibold uppercase tracking-widest text-teal-400">
              PDF DE ACCIÓN INMEDIATA
            </p>
            <h2 className="mt-2 text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              Tu <span className="text-teal-400">Sistema de 7 Días</span>
            </h2>
            <p className="mt-4 max-w-lg mx-auto md:mx-0 text-lg text-slate-300">
              Deja de adivinar. Te entregamos el plan exacto para decidir cada comida con claridad y recuperar tu energía.
            </p>
          </div>

          {/* Columna Derecha: El Panel de Acción (El "Cómo") */}
          <div className="w-full max-w-md mx-auto mt-8 md:mt-0">
            {/* CAMBIO CLAVE: Usamos un borde sutil y un fondo para crear una "tarjeta" o "panel" definido. */}
            <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-6 lg:p-8 shadow-2xl shadow-teal-500/5">
              
              {/* La lista de beneficios se mantiene, pero con un ligero ajuste de espaciado para más aire. */}
              <ul className="space-y-4">
                {FEATURES.map((txt) => (
                  <li key={txt} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-1 h-5 w-5 text-teal-400 flex-shrink-0" />
                    <span className="text-base text-slate-200">{txt}</span>
                  </li>
                ))}
              </ul>

              {/* Un separador más sutil y elegante. */}
              <div className="mt-8 mb-6 h-px bg-white/10"></div>

              {/* El componente de CTA se mantiene, ahora dentro de su contenedor bien definido. */}
              <div>
                <SmartCheckoutCTA
                  productName="Kit de 7 Días Reinicio Metabólico"
                  basePriceUSD={priceUSD}
                  gumroadLink={gumroadUrl}
                  mxnRounding="auto-9"
                  size="normal" // 'normal' es ideal para este layout.
                  dense={false}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}