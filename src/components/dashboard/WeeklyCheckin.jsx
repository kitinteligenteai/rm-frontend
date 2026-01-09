// src/components/dashboard/WeeklyCheckin.jsx
// v2.0 - Check-in Semanal CONECTADO a Supabase

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { motion } from 'framer-motion';
import { ClipboardCheck, X, ChevronRight, Award, Loader2 } from 'lucide-react';

const QUESTIONS = [
  {
    id: 'adherence',
    question: "¿Qué tanto te apegaste al plan esta semana?",
    options: [
      { label: "100% - Fui un soldado", value: 'high', feedback: "¡Excelente disciplina! Tu cuerpo lo notará pronto." },
      { label: "80% - La regla del 80/20", value: 'med', feedback: "Muy buen balance. La consistencia es clave." },
      { label: "50% - Me costó trabajo", value: 'low', feedback: "Es normal al inicio. Revisa la Guía de Supervivencia." }
    ]
  },
  {
    id: 'energy',
    question: "¿Cómo sentiste tu energía por las tardes?",
    options: [
      { label: "Estable y alta", value: 'high', feedback: "Señal de que tu metabolismo se está adaptando bien." },
      { label: "Tuve algunos bajones", value: 'med', feedback: "Tip: Asegúrate de comer suficiente grasa saludable." },
      { label: "Muy cansado / Dolor de cabeza", value: 'low', feedback: "Tip: Podrías necesitar electrolitos (agua, limón y sal)." }
    ]
  },
  {
    id: 'sleep',
    question: "¿Cómo dormiste?",
    options: [
      { label: "Profundo y reparador", value: 'high', feedback: "El sueño es donde ocurre la reparación hormonal." },
      { label: "Me desperté varias veces", value: 'low', feedback: "Tip: Intenta cenar 2 horas antes de dormir y evita pantallas." }
    ]
  },
  {
    id: 'hunger',
    question: "¿Pasaste hambre entre comidas?",
    options: [
      { label: "Cero hambre", value: 'high', feedback: "Perfecto. Tus hormonas de saciedad están funcionando." },
      { label: "Sí, mucha ansiedad", value: 'low', feedback: "Tip: Falta proteína en tu desayuno. Aumenta la porción." }
    ]
  }
];

export default function WeeklyCheckin({ user, onClose }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [saving, setSaving] = useState(false);

  // Guardar en Supabase cuando se completa el cuestionario
  const guardarResultados = async (finalAnswers) => {
    if (!user) return;
    setSaving(true);
    
    // Mapear respuestas a columnas de la BD
    const findValue = (id) => finalAnswers.find(a => a.id === id)?.selected.value || 'med';
    const feedbackList = finalAnswers.map(a => a.selected.feedback).join(" | ");

    try {
      await supabase.from('chequeos_semanales').insert({
        user_id: user.id,
        cumplimiento_plan: findValue('adherence'),
        nivel_energia: findValue('energy'),
        calidad_sueno: findValue('sleep'),
        hambre_ansiedad: findValue('hunger'),
        diagnostico_dante: feedbackList // Guardamos los tips generados
      });
    } catch (error) {
      console.error("Error guardando checkin:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleSelect = (option) => {
    const newAnswers = [...answers, { ...QUESTIONS[step], selected: option }];
    setAnswers(newAnswers);
    
    if (step < QUESTIONS.length - 1) {
      setTimeout(() => setStep(step + 1), 250);
    } else {
      // Final del cuestionario
      guardarResultados(newAnswers);
      setTimeout(() => setShowResults(true), 250);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-700 shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white z-10"><X size={24}/></button>

        {!showResults ? (
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                 <ClipboardCheck className="text-teal-400"/> Revisión Semanal
               </h2>
               <span className="text-xs font-mono text-slate-500">{step + 1} / {QUESTIONS.length}</span>
            </div>
            
            <div className="mb-8 h-2 bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                    className="h-full bg-teal-500" 
                    initial={{ width: 0 }}
                    animate={{ width: `${((step) / QUESTIONS.length) * 100}%` }}
                />
            </div>

            <h3 className="text-xl text-white font-medium mb-6">{QUESTIONS[step].question}</h3>

            <div className="space-y-3">
              {QUESTIONS[step].options.map((opt, i) => (
                <button 
                  key={i}
                  onClick={() => handleSelect(opt)}
                  className="w-full p-4 text-left bg-slate-800 hover:bg-slate-700 hover:border-teal-500 border border-transparent rounded-xl transition-all flex justify-between items-center group"
                >
                  <span className="text-slate-300 group-hover:text-white">{opt.label}</span>
                  <ChevronRight className="text-slate-600 group-hover:text-teal-400" size={18}/>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
             <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-8 text-center shrink-0">
                <Award className="w-16 h-16 text-white mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-white">¡Revisión Completa!</h2>
                <p className="text-teal-100 mt-2 text-sm">
                  {saving ? "Guardando en tu expediente..." : "Tus recomendaciones para la próxima semana:"}
                </p>
             </div>
             
             <div className="p-8 space-y-4 overflow-y-auto flex-1">
                {saving && (
                  <div className="flex justify-center py-4">
                    <Loader2 className="animate-spin text-teal-500" />
                  </div>
                )}
                
                {answers.map((ans, i) => (
                    <div key={i} className={`p-4 rounded-xl border-l-4 ${ans.selected.value === 'low' ? 'bg-red-900/10 border-red-500' : 'bg-slate-800/50 border-teal-500'}`}>
                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">{ans.question}</p>
                        <p className={`text-sm ${ans.selected.value === 'low' ? 'text-red-300 font-bold' : 'text-slate-300'}`}>
                            {ans.selected.feedback}
                        </p>
                    </div>
                ))}
             </div>
             
             <div className="p-6 border-t border-slate-800 bg-slate-900 shrink-0">
                <button onClick={onClose} className="w-full py-4 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors">
                    Entendido, ¡Vamos!
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}