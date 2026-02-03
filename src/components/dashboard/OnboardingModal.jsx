// src/components/dashboard/OnboardingModal.jsx
// v2.0 - Escáner Metabólico™ (Perfilamiento Clínico)

import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { User, ArrowRight, Loader2, Brain, Zap, Moon, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QUESTIONS = [
  {
    id: 'name',
    type: 'text',
    title: 'Bienvenido al Sistema',
    subtitle: 'Para calibrar tu perfil metabólico, necesitamos conocerte.',
    label: '¿Cómo te gustaría que te llamemos?',
    placeholder: 'Tu Nombre'
  },
  {
    id: 'goal',
    type: 'select',
    title: 'Tu Objetivo Principal',
    subtitle: '¿Qué es lo que más te urge resolver hoy?',
    options: [
      { value: 'weight', label: 'Perder grasa resistente', icon: Activity },
      { value: 'energy', label: 'Recuperar mi energía', icon: Zap },
      { value: 'anxiety', label: 'Controlar la ansiedad por comer', icon: Brain },
      { value: 'health', label: 'Mejorar marcadores de salud', icon: Moon }
    ]
  },
  {
    id: 'obstacle',
    type: 'select',
    title: 'Tu Mayor Obstáculo',
    subtitle: '¿Qué te ha impedido lograrlo en el pasado?',
    options: [
      { value: 'cravings', label: 'Antojos incontrolables por la tarde/noche' },
      { value: 'stress', label: 'Estrés y falta de tiempo' },
      { value: 'confusion', label: 'Mucha información contradictoria' },
      { value: 'consistency', label: 'Empiezo bien pero abandono' }
    ]
  }
];

export default function OnboardingModal({ user, onComplete }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ name: '', goal: '', obstacle: '' });
  const [loading, setLoading] = useState(false);

  const handleNext = async (val) => {
    const currentQ = QUESTIONS[step];
    const newData = { ...data, [currentQ.id]: val };
    setData(newData);

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      // Finalizar y Guardar
      setLoading(true);
      try {
        // Determinar Perfil Metabólico (Lógica simple por ahora)
        let profileType = 'Estándar';
        if (newData.obstacle === 'cravings') profileType = 'Ansiedad Dulce';
        else if (newData.obstacle === 'stress') profileType = 'Metabolismo Lento por Estrés';
        else if (newData.obstacle === 'consistency') profileType = 'Ciclos Todo o Nada';

        // Guardar en Metadata del Usuario
        const { error } = await supabase.auth.updateUser({
          data: { 
            full_name: newData.name,
            metabolic_profile: profileType,
            onboarding_completed: true
          }
        });

        if (error) throw error;
        onComplete(newData.name); // Callback para actualizar UI

      } catch (error) {
        console.error('Error guardando perfil:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const currentQ = QUESTIONS[step];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 animate-in fade-in duration-500">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        
        {/* Barra de Progreso */}
        <div className="absolute top-0 left-0 w-full h-1 bg-slate-800">
          <motion.div 
            className="h-full bg-teal-500"
            initial={{ width: 0 }}
            animate={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
          />
        </div>

        <div className="text-center mb-8 mt-4">
          <h2 className="text-2xl font-bold text-white mb-2">{currentQ.title}</h2>
          <p className="text-slate-400">{currentQ.subtitle}</p>
        </div>

        <AnimatePresence mode='wait'>
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {currentQ.type === 'text' && (
              <form onSubmit={(e) => { e.preventDefault(); handleNext(data.name); }} className="space-y-6">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                  <input
                    type="text"
                    value={data.name}
                    onChange={(e) => setData({...data, name: e.target.value})}
                    placeholder={currentQ.placeholder}
                    className="w-full bg-slate-800 border border-slate-700 text-white pl-12 pr-4 py-4 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all placeholder:text-slate-600 text-lg"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={!data.name.trim()}
                  className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-900/20"
                >
                  Siguiente <ArrowRight size={20} />
                </button>
              </form>
            )}

            {currentQ.type === 'select' && (
              <div className="space-y-3">
                {currentQ.options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleNext(opt.value)}
                    disabled={loading}
                    className="w-full p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-teal-500/50 rounded-xl text-left transition-all flex items-center gap-4 group"
                  >
                    {opt.icon && (
                      <div className="p-2 bg-slate-700 rounded-lg text-teal-400 group-hover:bg-teal-500/20 group-hover:scale-110 transition-all">
                        <opt.icon size={20} />
                      </div>
                    )}
                    <span className="text-slate-200 font-medium group-hover:text-white flex-1">
                      {opt.label}
                    </span>
                    <ArrowRight size={18} className="text-slate-600 group-hover:text-teal-400 opacity-0 group-hover:opacity-100 transition-all" />
                  </button>
                ))}
                {loading && (
                   <div className="flex justify-center mt-4 text-teal-500 animate-pulse font-bold text-sm">
                     <Loader2 className="animate-spin mr-2" /> Analizando Perfil...
                   </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
}