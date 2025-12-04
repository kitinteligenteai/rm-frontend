import React, { useState, useEffect, useRef } from 'react';
import { trainingProgram } from '../data/trainingProgram.js';
import EquipmentModal from '../components/gimnasio/EquipmentModal.jsx';
import { Info, Play, Pause, RotateCcw, CheckCircle2, Dumbbell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EQUIPMENT_OPTIONS = [
  { id: 'cuerpo', name: 'Solo mi Cuerpo', description: 'Ejercicios sin equipo.' },
  { id: 'mancuernas', name: 'Tengo Mancuernas', description: 'Rutinas con peso.' },
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

const ExerciseCard = ({ exercise, slotTitle, isCompleted, onToggleComplete }) => {
  const [showInfo, setShowInfo] = useState(false);
  const [showTimer, setShowTimer] = useState(false);

  if (!exercise) return null;

  return (
    <div className={`relative p-5 rounded-xl border transition-all ${isCompleted ? 'bg-emerald-900/20 border-emerald-500/30 opacity-80' : 'bg-slate-800 border-slate-700'}`}>
      <div className="flex justify-between items-start mb-3">
        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{slotTitle}</span>
        <button onClick={() => setShowInfo(!showInfo)} className="text-slate-500 hover:text-teal-400"><Info size={16} /></button>
      </div>
      <h4 className="font-bold text-white text-lg mb-3">{exercise.name}</h4>
      <div className="bg-slate-900/50 rounded-lg p-6 mb-3 border border-slate-700 flex items-center justify-center gap-4">
        <div className="bg-teal-500/10 p-3 rounded-full text-teal-400"><Dumbbell size={32} /></div>
        <p className="text-xs text-slate-400 leading-relaxed flex-1 border-l border-slate-700 pl-4">{exercise.description}</p>
      </div>
      <div className="mt-4 pt-3 border-t border-slate-700 flex justify-between items-center">
        <span className="text-xs font-mono text-slate-500">45s ON / 15s OFF</span>
        <div className="flex gap-3">
            <button onClick={() => setShowTimer(!showTimer)} className={`text-xs font-bold flex items-center gap-1 px-3 py-1.5 rounded-full transition-colors ${showTimer ? 'bg-slate-700 text-white' : 'bg-slate-900 text-teal-400 border border-teal-500/30'}`}>
              {showTimer ? 'Cerrar' : 'Timer'} <Play size={10} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onToggleComplete(); }} className={`p-1.5 rounded-full border transition-all ${isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-600 text-slate-600 hover:text-slate-400'}`}>
                <CheckCircle2 size={18} />
            </button>
        </div>
      </div>
      {showTimer && <div className="mt-4 pt-4 border-t border-slate-700"><ExerciseTimer duration={45} onComplete={() => {}} /></div>}
    </div>
  );
};

export default function Gimnasio() {
  const [userEquipment, setUserEquipment] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('userTrainingEquipment');
    return null;
  });
  const [showModal, setShowModal] = useState(!userEquipment);
  const [completed, setCompleted] = useState({});

  const handleSelect = (id) => {
    localStorage.setItem('userTrainingEquipment', id);
    setUserEquipment(id);
    setShowModal(false);
  };

  return (
    <div className="p-6 md:p-10 pb-24 min-h-screen bg-slate-950 text-white animate-in fade-in duration-500">
      {showModal && <EquipmentModal onSelect={handleSelect} availableEquipment={EQUIPMENT_OPTIONS} onClose={() => userEquipment && setShowModal(false)} />}
      <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Gimnasio Digital</h1>
          <p className="text-slate-400 max-w-xl">Entrena inteligente. <span className="text-teal-400 font-bold">{userEquipment === 'cuerpo' ? 'Peso Corporal' : 'Mancuernas'}</span>.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="text-xs bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 hover:border-teal-500 transition-colors">Cambiar Equipo</button>
      </div>
      <div className="space-y-12">
        {trainingProgram?.weeks?.map(week => (
          <div key={week.week} className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-teal-500/10 rounded-lg flex items-center justify-center text-teal-400 font-bold text-lg">{week.week}</div>
              <h2 className="text-2xl font-bold text-white">{week.title}</h2>
            </div>
            <div className="space-y-8">
              {week.days.map(day => (
                <div key={day.day} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-6 border-l-4 border-indigo-500 pl-3">Día {day.day}: {day.title}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {day.routine.map((slot, idx) => (
                      <ExerciseCard key={idx} slotTitle={slot.slot} exercise={slot.variants[userEquipment]} isCompleted={completed[`${week.week}-${day.day}-${idx}`]} onToggleComplete={() => setCompleted(prev => ({...prev, [`${week.week}-${day.day}-${idx}`]: !prev[`${week.week}-${day.day}-${idx}`]}))} />
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