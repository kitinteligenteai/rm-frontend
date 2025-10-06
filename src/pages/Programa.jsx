// RUTA: src/pages/Programa.jsx (Página de Venta para el Upsell de $75)
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { CheckCircle, ShieldCheck } from 'lucide-react';
import SmartCheckoutCTA from '../components/SmartCheckoutCTA'; // Ajusta la ruta si es necesario

const FEATURES = [
  'Acceso ANUAL a la plataforma completa.',
  'Calibrador de Saciedad: elimina el hambre entre comidas.',
  'Planificador Inteligente: adapta tu menú semanal con un clic.',
  'Bóveda con 60+ recetas alineadas al sistema.',
  'Gimnasio Digital con progresión semana a semana.',
  'Bitácora de Progreso para convertir logros en motivación.',
  'Acceso a los 10 Principios Fundamentales del Reinicio Metabólico.',
];

export default function Programa() {
  // Leemos las variables desde el archivo .env.local
  const priceUSD = Number(import.meta.env.VITE_PROG_PRICE_USD) || 75;
  const gumroadUrl = import.meta.env.VITE_GUMROAD_PROG_URL;

  const title = 'Programa Completo - Reinicio Metabólico';
  const description = 'Accede a la plataforma completa de Reinicio Metabólico: planes, recetas, gimnasio digital y herramientas para resultados medibles. Acceso inmediato.';

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="product" />
        <meta property="og:url" content="https://www.reiniciometabolico.net/programa" />
        <meta property="og:image" content="https://www.reiniciometabolico.net/android-chrome-512x512.png" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
        <main className="mx-auto max-w-4xl px-4 py-10 md:py-20">
          <header className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Da el siguiente paso a la <span className="text-teal-400">transformación total</span>
            </h1>
            <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">
              El Kit de 7 días es la chispa. La plataforma completa es el motor que te lleva a resultados permanentes.
            </p>
          </header>

          <section className="grid md:grid-cols-2 gap-10 items-start">
            {/* Columna de Características */}
            <div>
              <h2 className="text-2xl font-bold mb-6">¿Qué incluye el acceso anual?</h2>
              <ul className="space-y-4">
                {FEATURES.map((feature ) => (
                  <li key={feature} className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-teal-400 mt-1 shrink-0" />
                    <span className="text-slate-200">{feature}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-8 text-teal-300/90 font-semibold border-l-4 border-teal-400 pl-4">
                Esta es una oferta exclusiva para quienes ya adquirieron el Kit de Inicio.
              </p>
            </div>

            {/* Columna de Checkout */}
            <aside className="border border-white/10 bg-slate-800/50 rounded-2xl p-6 shadow-2xl backdrop-blur-xl sticky top-10">
              <h3 className="text-xl font-bold text-center mb-4">Acceso Anual a la Plataforma</h3>

              <SmartCheckoutCTA
                productName="Programa Completo Reinicio Metabólico"
                basePriceUSD={priceUSD}
                gumroadLink={gumroadUrl}
              />

              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-400">
                <ShieldCheck className="h-5 w-5 text-teal-400" />
                <span>Compra 100% segura. Garantía de 15 días.</span>
              </div>
            </aside>
          </section>
        </main>
      </div>
    </>
  );
}
