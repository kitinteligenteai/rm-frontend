// src/pages/Gimnasio.jsx (v5.0 - FIX DEFINITIVO BUCLE)
import React, { useState, useEffect, useRef } from 'react';
import { trainingProgram } from '../data/trainingProgram.js';
import EquipmentModal from '../components/gimnasio/EquipmentModal.jsx';
import { Info, Play, Pause, RotateCcw, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EQUIPMENT_OPTIONS = [
  { id: 'cuerpo', name: 'Solo mi Cuerpo', description: 'Ejercicios sin equipo.' },
  { id: 'mancuernas', name: 'Tengo Mancuernas', description: 'Rutinas con peso.' },
];

// --- TIMER COMPONENT ---
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
    <div className="flex flex-col items-center mt-4 bg-slate-900/50 p-3 rounded-lg border border-slate-700">
      <div className="w-full h-1 bg-slate-700 rounded-full mb-3 overflow-hidden">
        <motion.div 
          className="bg-teal-500 h-full" 
          initial={{ width: '100%' }} 
          animate={{ width: `${(timeLeft / duration) * 100}%` }} 
          transition={{ ease: "linear", duration: 1 }}
        />
      </div>
      <div className="flex items-center gap-4">
        <button onClick={() => setIsRunning(!isRunning)} className="p-2 rounded-full bg-teal-600 hover:bg-teal-500 text-white">
          {isRunning ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <span className="text-2xl font-mono font-bold text-white">{formatTime(timeLeft)}</span>
        <button onClick={() => { setIsRunning(false); setTimeLeft(duration); }} className="p-2 text-slate-400 hover:text-white">
          <RotateCcw size={20} />
        </button>
      </div>
    </div>
  );
};

// --- CARD COMPONENT ---
const ExerciseCard = ({ exercise, slotTitle, isCompleted, onToggleComplete }) => {
  const [showInfo, setShowInfo] = useState(false);
  const [showTimer, setShowTimer] = useState(false);

  if (!exercise) return null;

  return (
    <div className={`relative p-5 rounded-xl border transition-all ${isCompleted ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-slate-800 border-slate-700'}`}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{slotTitle}</span>
        <div className="flex gap-2">
          <button onClick={() => setShowInfo(!showInfo)} className="text-slate-500 hover:text-teal-400"><Info size={16} /></button>
          <button onClick={onToggleComplete} className={`text-slate-500 ${isCompleted ? 'text-emerald-400' : 'hover:text-white'}`}>
            <CheckCircle2 size={18} />
          </button>
        </div>
      </div>
      
      <h4 className="text-lg font-bold text-white mb-1">{exercise.name}</h4>
      
      {showInfo && <p className="text-xs text-slate-300 bg-slate-700/50 p-2 rounded mb-3 animate-in fade-in">{exercise.description}</p>}

      <div className="mt-4 pt-3 border-t border-slate-700 flex justify-between items-center">
        <span className="text-xs font-mono text-slate-500">45s ON / 15s OFF</span>
        <button onClick={() => setShowTimer(!showTimer)} className="text-xs font-bold text-teal-400 hover:underline flex items-center gap-1">
          {showTimer ? 'Ocultar Timer' : 'Iniciar Timer'} <Play size={12} />
        </button>
      </div>

      {showTimer && <ExerciseTimer duration={45} onComplete={() => alert("¡Tiempo!")} />}
    </div>
  );
};

// --- MAIN COMPONENT (CON FIX DE BUCLE) ---
export default function Gimnasio() {
  // ✅ SOLUCIÓN: Leemos localStorage DIRECTAMENTE en el estado inicial.
  // Esto evita que el componente se renderice, luego lea, luego actualice y cause un bucle.
  const [userEquipment, setUserEquipment] = useState(() => {
    // Si estamos en el navegador, intentamos leer. Si no, null.
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userTrainingEquipment');
    }
    return null;
  });

  // Si no hay equipo seleccionado al inicio, mostramos el modal automáticamente.
  const [showModal, setShowModal] = useState(!userEquipment);
  
  const [completed, setCompleted] = useState({});

  const handleSelect = (id) => {
    localStorage.setItem('userTrainingEquipment', id);
    setUserEquipment(id);
    setShowModal(false);
  };

  return (
    <div className="p-6 md:p-10 pb-24 min-h-screen bg-slate-950 text-white animate-in fade-in duration-500">
      {showModal && (
        <EquipmentModal 
          onSelect={handleSelect} 
          availableEquipment={EQUIPMENT_OPTIONS} 
          // Permitimos cerrar solo si ya hay algo seleccionado previamente
          onClose={() => userEquipment && setShowModal(false)} 
        />
      )}
      
      <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gimnasio Digital</h1>
          <p className="text-slate-400 text-sm mt-1">
            Modo Actual: <span className="text-teal-400 font-bold">{userEquipment === 'cuerpo' ? 'Peso Corporal' : 'Mancuernas'}</span>
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="text-xs bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 hover:border-teal-500 transition-colors">
          Cambiar Equipo
        </button>
      </div>

      <div className="space-y-12">
        {trainingProgram?.weeks?.map(week => (
          <div key={week.week}>
            <h2 className="text-xl font-bold text-teal-400 mb-4 border-b border-slate-800 pb-2">Semana {week.week}: {week.title}</h2>
            <div className="space-y-6">
              {week.days.map(day => (
                <div key={day.day}>
                  <h3 className="text-lg font-semibold text-white mb-3 pl-2 border-l-2 border-indigo-500">Día {day.day} - {day.title}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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