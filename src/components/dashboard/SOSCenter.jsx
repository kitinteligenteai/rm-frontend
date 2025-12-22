// src/components/dashboard/SOSCenter.jsx
// Módulo de Intervención de Crisis (Valor $75 USD)

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, HeartCrack, BatteryWarning, Play, Pause, AlertTriangle } from 'lucide-react';

const CRISIS_OPTIONS = [
  {
    id: 'cravings',
    icon: Zap,
    title: "Tengo un Antojo Incontrolable",
    color: "orange",
    audioText: "Escucha con atención. Ese antojo no eres tú, es una señal química pasajera. Tu cuerpo está pidiendo energía rápida, pero tú tienes el control. Respira profundo. Inhala... Exhala... Este impulso dura solo 3 minutos. No negociamos con la ansiedad. Bebe un vaso de agua grande ahora mismo. Tú mandas.",
    action: "Bebe 1 vaso de agua con una pizca de sal o limón. Espera 5 minutos."
  },
  {
    id: 'cheat',
    icon: HeartCrack,
    title: "Rompí la Dieta (Me siento mal)",
    color: "red",
    audioText: "Alto ahí. Cero culpa. La culpa libera cortisol y el cortisol te hace almacenar grasa. Lo hecho, hecho está. Una mala comida no arruina tu progreso, igual que una ensalada no te hace flaco. Lo único que importa es la SIGUIENTE comida. Regresa al plan inmediatamente. No castigues a tu cuerpo, nútrelo.",
    action: "En tu siguiente comida, consume solo Proteína y Vegetales verdes. Cero carbohidratos."
  },
  {
    id: 'energy',
    icon: BatteryWarning,
    title: "Mi Energía está por los Suelos",
    color: "yellow",
    audioText: "Es normal. Tu cuerpo está cambiando de combustible. Probablemente te faltan electrolitos. No necesitas azúcar, necesitas minerales. Tu motor está afinándose, ten paciencia. Dale a tu cuerpo lo que pide de verdad, no lo que la mente te sugiere.",
    action: "Toma suero casero YA: Agua mineral + 1 limón + 1/2 cdita de sal de mar."
  }
];

// Mini reproductor de voz para la crisis
const SOSAudioPlayer = ({ text }) => {
  const [playing, setPlaying] = useState(false);

  const togglePlay = () => {
    if (playing) {
      window.speechSynthesis.cancel();
      setPlaying(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-MX';
      utterance.rate = 0.9; // Un poco más lento para calmar
      utterance.pitch = 0.9; // Tono más grave/serio
      utterance.onend = () => setPlaying(false);
      window.speechSynthesis.speak(utterance);
      setPlaying(true);
    }
  };

  return (
    <button 
      onClick={togglePlay}
      className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all ${
        playing ? 'bg-indigo-600 text-white animate-pulse' : 'bg-slate-700 text-white hover:bg-slate-600'
      }`}
    >
      {playing ? <Pause size={24} /> : <Play size={24} />}
      {playing ? "Escuchando Coach..." : "Escuchar Audio de Rescate"}
    </button>
  );
};

export default function SOSCenter({ onClose }) {
  const [selectedCrisis, setSelectedCrisis] = useState(null);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="p-6 bg-red-900/20 border-b border-red-500/20 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <AlertTriangle className="text-red-500" /> Centro de Crisis
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2 bg-slate-800 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {!selectedCrisis ? (
            <>
              <p className="text-slate-300 mb-6 text-center text-lg">¿Qué está pasando ahora mismo?</p>
              <div className="space-y-3">
                {CRISIS_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedCrisis(opt)}
                    className="w-full p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 rounded-2xl flex items-center gap-4 text-left transition-all group"
                  >
                    <div className={`p-3 rounded-full bg-${opt.color}-500/20 text-${opt.color}-400 group-hover:scale-110 transition-transform`}>
                      <opt.icon size={24} />
                    </div>
                    <span className="font-bold text-slate-200 text-lg">{opt.title}</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="animate-in slide-in-from-right duration-300">
              <button 
                onClick={() => { window.speechSynthesis.cancel(); setSelectedCrisis(null); }}
                className="text-sm text-slate-400 hover:text-white mb-4 flex items-center gap-1"
              >
                ← Volver al menú
              </button>

              <div className="text-center mb-8">
                <div className={`inline-block p-4 rounded-full bg-${selectedCrisis.color}-500/20 text-${selectedCrisis.color}-400 mb-4`}>
                  <selectedCrisis.icon size={48} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{selectedCrisis.title}</h3>
              </div>

              {/* REPRODUCTOR DE AUDIO */}
              <div className="mb-8">
                <SOSAudioPlayer text={selectedCrisis.audioText} />
                <p className="text-center text-xs text-slate-500 mt-2">Sube el volumen y cierra los ojos.</p>
              </div>

              {/* TARJETA DE ACCIÓN */}
              <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-xl">
                <h4 className="text-teal-400 font-bold uppercase tracking-wider text-xs mb-2">Protocolo de Acción Inmediata:</h4>
                <p className="text-white text-lg leading-relaxed font-medium">
                  {selectedCrisis.action}
                </p>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}