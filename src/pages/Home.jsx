// src/pages/Home.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ShieldCheck, Globe2, MapPinned } from 'lucide-react';
import MercadoPagoButton from '../components/common/MercadoPagoButton';

// URL de Gumroad para el pago internacional
const GUMROAD_URL = 'https://inteligentekit.gumroad.com/l/sxwrn';

const features = [
  { icon: CheckCircle2, text: 'El Menú Exacto: qué comer y cuándo para apagar la inflamación.' },
  { icon: CheckCircle2, text: 'Recetas Deliciosas y Simples: diseñadas para sanar, sin ingredientes raros.' },
  { icon: CheckCircle2, text: 'Lista de Compras Inteligente: organizada para una sola visita al súper.' },
];

const Home = ( ) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-slate-100 font-sans">
      <header className="w-full border-b border-white/10 backdrop-blur-md bg-white/5 sticky top-0 z-20">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <h1 className="text-xl font-semibold tracking-tight text-white">Reinicio Metabólico</h1>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 md:py-14">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto grid items-center gap-10 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl md:grid-cols-2 md:p-10"
        >
          <div className="flex items-center justify-center">
            <motion.img
              src="/llave-maestra.png" // Asegúrate de que la imagen esté en la carpeta `public`
              alt="Sistema de Acción Inmediata"
              className="w-full max-w-sm rounded-lg shadow-lg"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            />
          </div>

          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.2em] text-teal-400/80 font-semibold">PDF DE ACCIÓN INMEDIATA</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight text-white">
              Tu <span className="text-teal-400">Sistema de 7 Días</span>
            </h2>
            <p className="mt-3 text-slate-300">
              Deja de adivinar. Te entregamos el plan exacto para decidir cada comida con claridad y recuperar tu energía.
            </p>

            <ul className="mt-6 space-y-3">
              {features.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3">
                  <Icon className="mt-0.5 h-5 w-5 text-teal-400 flex-shrink-0" />
                  <span className="text-slate-200">{text}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-baseline gap-2">
              <span className="text-slate-300">Un solo pago de</span>
              <span className="text-3xl font-extrabold text-teal-400">$7 USD</span>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4">
              <a
                href={GUMROAD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-slate-100 shadow-lg backdrop-blur transition hover:bg-white/10 active:scale-[.98]"
              >
                <Globe2 className="h-5 w-5 text-teal-400" />
                <span>Desbloquear (Internacional)</span>
              </a>

              <div className="rounded-xl border border-teal-500/30 bg-teal-500/10 p-3">
                <div className="mb-2 flex items-center gap-2 text-xs text-teal-300">
                  <MapPinned className="h-4 w-4" />
                  <span>Pago seguro para México</span>
                </div>
                <MercadoPagoButton />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-400">
              <ShieldCheck className="h-5 w-5 text-teal-400" />
              <span>Compra 100% segura. Acceso instantáneo.</span>
            </div>
          </div>
        </motion.section>
      </main>

      <footer className="mx-auto max-w-5xl px-4 py-10 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Reinicio Metabólico. Todos los derechos reservados.
      </footer>
    </div>
  );
};

export default Home;
