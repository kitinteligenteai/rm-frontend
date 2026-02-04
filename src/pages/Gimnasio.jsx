// src/pages/Gimnasio.jsx
// v13.0 - FIX: Importación de Circle corregida para evitar pantalla negra

import React, { useState, useEffect, useRef } from 'react';
import { trainingProgram } from '../data/trainingProgram.js';
import EquipmentModal from '../components/gimnasio/EquipmentModal.jsx';
// CORRECCIÓN: Se agrega Circle explícitamente a la lista
import { Info, Play, Pause, RotateCcw, CheckCircle2, Dumbbell, Settings2, Timer, ChevronRight, Circle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EQUIPMENT_OPTIONS = [
  { id: 'cuerpo', name: 'Sin Equipo (Peso Corporal)', description: 'Ejercicios efectivos usando tu propio peso.' },
  { id: 'mancuernas', name: 'Con Mancuernas', description: 'Rutinas de fuerza con peso libre.' },
];

const ExerciseTimer = ({ duration, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      clearInterval(timerRef.current);
      onComplete();
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, timeLeft, onComplete]);

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="flex flex-col items-center mt-3 bg-black/30 p-3 rounded-xl border border-white/10">
      <div className="w-full h-1 bg-white/10 rounded-full mb-3 overflow-hidden">
        <motion.div 
          className="bg-teal-500 h-full" 
          initial={{ width: '100%' }} 
          animate={{ width: `${(timeLeft / duration) * 100}%` }} 
          transition={{ ease: "linear", duration: 1 }}
        />
      </div>
      <div className="flex items-center gap-4">
        <button onClick={() => setIsRunning(!isRunning)} className="p-2 rounded-full bg-white/10 text-white hover:bg-teal-500 transition-colors">
          {isRunning ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <span className="text-xl font-mono font-bold text-white">{formatTime(timeLeft)}</span>
        <button onClick={() => { setIsRunning(false); setTimeLeft(duration); }} className="text-slate-400 hover:text-white">
          <RotateCcw size={16} />
        </button>
      </div>
    </div>
  );
};

const ExerciseCard = ({ exercise, slotTitle, isCompleted, onToggleComplete }) => {
  const [showTimer, setShowTimer] = useState(false);

  return (
    <div className={`flex-shrink-0 w-80 snap-start bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden relative flex flex-col transition-all ${isCompleted ? 'opacity-60 border-emerald-500/30' : ''}`}>
      <div className="p-5 flex-1">
         <div className="flex justify-between items-start mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">
               {slotTitle}
            </span>
            <button onClick={(e) => { e.stopPropagation(); onToggleComplete(); }} className={`text-slate-600 hover:text-emerald-500 transition-colors ${isCompleted ? 'text-emerald-500' : ''}`}>
               {isCompleted ? <CheckCircle2 size={24} /> : <Circle size={24} />}
            </button>
         </div>
         
         <h3 className="text-lg font-bold text-white mb-2 leading-snug">{exercise.name}</h3>
         <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
           {exercise.description}
         </p>
      </div>

      <div className="bg-slate-950 p-4 border-t border-slate-800">
         {!showTimer ? (
             <button onClick={() => setShowTimer(true)} className="w-full flex items-center justify-center gap-2 text-xs font-bold text-slate-300 hover:text-white py-2 rounded-lg hover:bg-white/5 transition-colors">
                <Timer size={14} /> Iniciar Timer (45s)
             </button>
         ) : (
             <div className="animate-in fade-in slide-in-from-bottom-2">
                 <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] text-slate-500 uppercase">Timer Activo</span>
                    <button onClick={() => setShowTimer(false)} className="text-slate-500 hover:text-white"><X size={14}/></button>
                 </div>
                 <ExerciseTimer duration={45} onComplete={() => {}} />
             </div>
         )}
      </div>
    </div>
  );
};

export default function Gimnasio() {
  const [userEquipment, setUserEquipment] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('userTrainingEquipment');
    return 'cuerpo'; 
  });
  const [showModal, setShowModal] = useState(false);
  const [completed, setCompleted] = useState({});

  const handleSelect = (id) => {
    localStorage.setItem('userTrainingEquipment', id);
    setUserEquipment(id);
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-24 animate-in fade-in duration-500">
      
      {showModal && (
        <EquipmentModal onSelect={handleSelect} availableEquipment={EQUIPMENT_OPTIONS} onClose={() => setShowModal(false)} />
      )}

      <div className="px-6 md:px-10 pt-8 mb-8 flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">Gimnasio</h1>
          <p className="text-slate-400">Entrenamiento metabólico inteligente.</p>
        </div>
        
        <button 
            onClick={() => setShowModal(true)} 
            className="flex items-center gap-2 text-sm bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl border border-slate-700 transition-all"
        >
            <Settings2 size={16} /> Configurar Equipo
        </button>
      </div>

      <div className="space-y-12">
        {trainingProgram?.weeks?.map((week, wIdx) => (
          <div key={wIdx} className="border-t border-slate-900 pt-8 first:border-0 first:pt-0">
             <div className="px-6 md:px-10 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-500 font-bold text-sm">
                    {week.week}
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-white">{week.title}</h2>
             </div>
             <div className="space-y-8">
                {week.days.map((day, dIdx) => (
                    <div key={dIdx}>
                        <h3 className="px-6 md:px-10 text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> Día {day.day}: {day.title}
                        </h3>
                        <div className="flex overflow-x-auto gap-4 px-6 md:px-10 pb-6 scrollbar-hide snap-x">
                            {day.routine.map((slot, idx) => (
                                <ExerciseCard 
                                    key={idx} 
                                    slotTitle={slot.slot} 
                                    exercise={slot.variants[userEquipment]} 
                                    isCompleted={completed[`${week.week}-${day.day}-${idx}`]} 
                                    onToggleComplete={() => setCompleted(prev => ({...prev, [`${week.week}-${day.day}-${idx}`]: !prev[`${week.week}-${day.day}-${idx}`]}))} 
                                />
                            ))}
                        </div>
                    </div>
                ))}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}