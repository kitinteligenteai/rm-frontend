// src/pages/Gimnasio.jsx (v5.0 - Fix Timer, Check y GIFs)
import React, { useState, useEffect, useRef } from 'react';
import { trainingProgram } from '../data/trainingProgram.js';
import EquipmentModal from '../components/gimnasio/EquipmentModal.jsx';
import { Dumbbell, Info, Play, Pause, RotateCcw, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EQUIPMENT_OPTIONS = [
  { id: 'cuerpo', name: 'Solo mi Cuerpo', description: 'Ejercicios sin equipo.' },
  { id: 'mancuernas', name: 'Tengo Mancuernas', description: 'Rutinas con peso.' },
];

// --- TIMER SILENCIOSO ---
const ExerciseTimer = ({ duration, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      setFinished(true);
      clearInterval(timerRef.current);
      // Reproducir un sonido suave (opcional)
      const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
      audio.volume = 0.5;
      audio.play().catch(e => console.log("Audio play prevented"));
      onComplete(); 
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, timeLeft, onComplete]);

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className={`flex flex-col items-center mt-4 p-3 rounded-lg border transition-colors ${finished ? 'bg-emerald-900/30 border-emerald-500/50' : 'bg-slate-900/50 border-slate-700'}`}>
      {!finished ? (
        <>
          <div className="w-full h-1 bg-slate-700 rounded-full mb-3 overflow-hidden">
            <motion.div 
              className="bg-teal-500 h-full" 
              initial={{ width: '100%' }} 
              animate={{ width: `${(timeLeft / duration) * 100}%` }} 
              transition={{ ease: "linear", duration: 1 }}
            />
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsRunning(!isRunning)} className="p-2 rounded-full bg-teal-600 hover:bg-teal-500 text-white transition-transform active:scale-95">
              {isRunning ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <span className="text-2xl font-mono font-bold text-white">{formatTime(timeLeft)}</span>
            <button onClick={() => { setIsRunning(false); setTimeLeft(duration); setFinished(false); }} className="p-2 text-slate-400 hover:text-white">
              <RotateCcw size={20} />
            </button>
          </div>
        </>
      ) : (
        <div className="flex items-center gap-2 text-emerald-400 font-bold animate-in fade-in zoom-in">
          <CheckCircle2 size={24} /> ¡Tiempo Completado!
          <button onClick={() => { setFinished(false); setTimeLeft(duration); }} className="ml-4 text-xs text-slate-400 underline">Reiniciar</button>
        </div>
      )}
    </div>
  );
};

// --- TARJETA DE EJERCICIO ---
const ExerciseCard = ({ exercise, slotTitle, isCompleted, onToggleComplete }) => {
  const [showInfo, setShowInfo] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [showGif, setShowGif] = useState(false);

  if (!exercise) return null;

  return (
    <div className={`relative p-5 rounded-xl border transition-all ${isCompleted ? 'bg-emerald-900/20 border-emerald-500/30 opacity-80' : 'bg-slate-800 border-slate-700'}`}>
      
      {/* Cabecera */}
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{slotTitle}</span>
        <div className="flex gap-2">
           {/* Botón Info */}
          <button onClick={() => setShowInfo(!showInfo)} className={`transition-colors ${showInfo ? 'text-teal-400' : 'text-slate-500 hover:text-white'}`}>
            <Info size={18} />
          </button>
           {/* Botón GIF (Si existiera URL) */}
          <button onClick={() => setShowGif(!showGif)} className={`transition-colors ${showGif ? 'text-purple-400' : 'text-slate-500 hover:text-white'}`} title="Ver demostración">
            <ImageIcon size={18} />
          </button>
        </div>
      </div>
      
      <h4 className="font-bold text-white text-lg mb-1">{exercise.name}</h4>
      
      {/* GIF Placeholder (Aquí irían tus imágenes reales) */}
      {showGif && (
         <div className="mb-3 rounded-lg overflow-hidden border border-slate-600 bg-black aspect-video flex items-center justify-center animate-in fade-in">
            {/* Si tienes la URL real en exercise.gifUrl úsala aquí. Por ahora pongo un placeholder */}
            <p className="text-xs text-slate-500">GIF Demostrativo ({exercise.name})</p>
         </div>
      )}

      {/* Descripción / Hint */}
      {showInfo && (
        <p className="text-xs text-slate-300 bg-slate-700/50 p-3 rounded-lg mb-3 animate-in fade-in border-l-2 border-teal-500">
          💡 {exercise.description}
        </p>
      )}

      {/* Footer de Tarjeta */}
      <div className="mt-4 pt-3 border-t border-slate-700 flex justify-between items-center">
        <span className="text-xs font-mono text-slate-500">45s ON / 15s OFF</span>
        
        <div className="flex gap-3">
            {/* Botón Timer */}
            <button 
                onClick={() => setShowTimer(!showTimer)} 
                className={`text-xs font-bold flex items-center gap-1 px-3 py-1.5 rounded-full transition-colors ${showTimer ? 'bg-slate-700 text-white' : 'bg-slate-900 text-teal-400 border border-teal-500/30'}`}
            >
            {showTimer ? 'Cerrar' : 'Timer'} <Play size={10} />
            </button>

            {/* Botón Completado (Check) - NO ACTIVA TIMER */}
            <button 
                onClick={(e) => {
                    e.stopPropagation(); // Evita clicks accidentales
                    onToggleComplete();
                }} 
                className={`p-1.5 rounded-full border transition-all ${isCompleted ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'border-slate-600 text-slate-600 hover:border-slate-400 hover:text-slate-400'}`}
                title={isCompleted ? 'Marcar como pendiente' : 'Marcar como terminado'}
            >
                <CheckCircle2 size={18} />
            </button>
        </div>
      </div>

      {/* Área del Timer */}
      <AnimatePresence>
        {showTimer && (
          <motion.div initial={{height: 0, opacity: 0}} animate={{height: 'auto', opacity: 1}} exit={{height: 0, opacity: 0}}>
             <ExerciseTimer duration={45} onComplete={() => {}} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function Gimnasio() {
  // Estado perezoso para evitar bucles
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
      {showModal && (
        <EquipmentModal 
          onSelect={handleSelect} 
          availableEquipment={EQUIPMENT_OPTIONS} 
          onClose={() => userEquipment && setShowModal(false)} 
        />
      )}
      
      <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gimnasio Digital</h1>
          <p className="text-slate-400 text-sm mt-1">
            Entrenamiento: <span className="text-teal-400 font-bold">{userEquipment === 'cuerpo' ? 'Peso Corporal' : 'Mancuernas'}</span>
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