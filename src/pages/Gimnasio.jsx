// src/pages/Gimnasio.jsx (v3.0 - Con Timer y Visuales Premium)
import React, { useState, useEffect } from 'react';
import { trainingProgram } from '../data/trainingProgram.js';
import EquipmentModal from '../components/gimnasio/EquipmentModal.jsx';
import { Dumbbell, Info, Play, Pause, RotateCcw, CheckCircle } from 'lucide-react';

const EQUIPMENT_OPTIONS = [
  { id: 'cuerpo', name: 'Solo mi Cuerpo', description: 'Ejercicios sin equipo.' },
  { id: 'mancuernas', name: 'Tengo Mancuernas', description: 'Rutinas con peso.' },
];

// --- COMPONENTE DE TARJETA CON TIMER ---
const ExerciseCard = ({ exercise, slotTitle }) => {
  const [showTip, setShowTip] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45); // 45 segundos por defecto
  const [isResting, setIsResting] = useState(false);

  useEffect(() => {
    let interval = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0) {
      setTimerActive(false);
      // Si terminó el trabajo, pasar a descanso (simple toggle)
      if (!isResting) {
        setIsResting(true);
        setTimeLeft(15); // 15s descanso
        setTimerActive(true); // Auto-start descanso
      } else {
        setIsResting(false); // Fin del ciclo
      }
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft, isResting]);

  const toggleTimer = () => setTimerActive(!timerActive);
  const resetTimer = () => {
    setTimerActive(false);
    setIsResting(false);
    setTimeLeft(45);
  };

  if (!exercise) return null;

  return (
    <div className={`border border-slate-700 rounded-xl p-5 transition-all relative overflow-hidden
      ${isResting ? 'bg-indigo-900/30 border-indigo-500/50' : 'bg-slate-800'}
      ${timerActive && !isResting ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/10' : ''}
    `}>
      {/* Barra de Progreso de Fondo */}
      {timerActive && (
        <div 
          className={`absolute bottom-0 left-0 h-1 transition-all duration-1000 linear ${isResting ? 'bg-indigo-500' : 'bg-emerald-500'}`} 
          style={{ width: `${(timeLeft / (isResting ? 15 : 45)) * 100}%` }}
        />
      )}

      <div className="flex justify-between items-start mb-3">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{slotTitle}</span>
        <button onClick={() => setShowTip(!showTip)} className="text-slate-500 hover:text-white"><Info size={16}/></button>
      </div>
      
      <h4 className="font-bold text-white text-lg mb-2">{exercise.name}</h4>
      
      {showTip && (
        <p className="text-xs text-slate-300 bg-slate-700/50 p-2 rounded mb-3 animate-in fade-in">
          {exercise.description}
        </p>
      )}

      {/* CONTROLES DEL TIMER */}
      <div className="mt-4 flex items-center justify-between bg-slate-900/50 p-2 rounded-lg">
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleTimer}
            className={`p-2 rounded-full text-white transition-colors ${timerActive ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-teal-600 hover:bg-teal-500'}`}
          >
            {timerActive ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <div>
            <span className={`font-mono text-xl font-bold ${isResting ? 'text-indigo-400' : 'text-white'}`}>
              00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
            </span>
            <span className="text-[10px] text-slate-500 uppercase ml-1 font-bold">
              {isResting ? 'Descanso' : 'Trabajo'}
            </span>
          </div>
        </div>
        
        <button onClick={resetTimer} className="text-slate-500 hover:text-white p-2">
          <RotateCcw size={16} />
        </button>
      </div>
    </div>
  );
};

const Gimnasio = () => {
  const [userEquipment, setUserEquipment] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const savedEquipment = localStorage.getItem('userTrainingEquipment');
    if (savedEquipment) {
      setUserEquipment(savedEquipment);
    } else {
      setShowModal(true);
    }
  }, []);

  const handleEquipmentSelect = (equipmentId) => {
    localStorage.setItem('userTrainingEquipment', equipmentId);
    setUserEquipment(equipmentId);
    setShowModal(false);
  };

  if (!userEquipment && !showModal) return <div className="p-10 text-center text-slate-400">Cargando...</div>;

  return (
    <div className="p-6 md:p-10 pb-24 animate-in fade-in duration-500">
      {showModal && (
        <EquipmentModal 
          onSelect={handleEquipmentSelect} 
          availableEquipment={EQUIPMENT_OPTIONS}
          onClose={() => userEquipment && setShowModal(false)} 
        />
      )}

      <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Gimnasio Digital</h1>
          <p className="text-slate-400 max-w-xl">
            Modo Entrenador: Dale Play a cada ejercicio. 45s de trabajo, 15s de descanso.
          </p>
        </div>
        <button 
          onClick={() => setShowModal(true)} 
          className="text-sm font-semibold text-teal-400 hover:text-teal-300 border border-teal-500/30 px-4 py-2 rounded-lg transition-colors"
        >
          Cambiar Equipo
        </button>
      </div>

      {trainingProgram?.weeks?.map((weekData) => (
        <div key={weekData.week} className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-teal-500/10 rounded-lg flex items-center justify-center text-teal-400 font-bold text-lg">
              {weekData.week}
            </div>
            <h2 className="text-2xl font-bold text-white">{weekData.title}</h2>
          </div>
          
          <div className="space-y-8">
            {weekData.days.map((day) => (
              <div key={day.day} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-6 border-l-4 border-indigo-500 pl-3">
                  Día {day.day}: {day.title}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {day.routine.map((slot) => (
                    <ExerciseCard 
                      key={slot.slot} 
                      slotTitle={slot.slot} 
                      exercise={slot.variants[userEquipment]} 
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Gimnasio;