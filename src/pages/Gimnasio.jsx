import React, { useState, useEffect, useRef } from 'react';
import { trainingProgram } from '../data/trainingProgram.js';
import EquipmentModal from '../components/gimnasio/EquipmentModal.jsx';
import { Dumbbell, Info, Play, Pause, RotateCcw, CheckCircle2 } from 'lucide-react';
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
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      clearInterval(timerRef.current);
      onComplete();
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, timeLeft, onComplete]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => setIsRunning(!isRunning);
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(duration);
  };

  const progress = (timeLeft / duration) * 100;
  const progressBarColor = timeLeft <= 10 ? 'bg-red-500' : timeLeft <= 30 ? 'bg-orange-500' : 'bg-teal-500';

  return (
    <div className="flex flex-col items-center mt-4">
      <div className="relative w-full h-2 rounded-full bg-slate-700 mb-2 overflow-hidden">
        <motion.div
          className={`${progressBarColor} h-full`}
          initial={{ width: '100%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "linear" }}
        ></motion.div>
      </div>
      <div className="flex items-center gap-4">
        <button onClick={toggleTimer} className="p-2 rounded-full bg-slate-700/50 hover:bg-teal-600/50 transition-colors">
          {isRunning ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white" />}
        </button>
        <span className="text-2xl font-bold text-white font-mono">{formatTime(timeLeft)}</span>
        <button onClick={resetTimer} className="p-2 rounded-full bg-slate-700/50 hover:bg-orange-600/50 transition-colors">
          <RotateCcw className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
};

const ExerciseCard = ({ exercise, slotTitle, isCompleted, onToggleComplete }) => {
  const [showTip, setShowTip] = useState(false);
  const [showTimer, setShowTimer] = useState(false);

  if (!exercise) return null;

  return (
    <div className={`bg-slate-800 border border-slate-700 rounded-xl p-5 relative transition-all group ${isCompleted ? 'bg-emerald-900/20 border-emerald-600/30' : 'hover:border-teal-500/50'}`}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">{slotTitle}</span>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowTip(!showTip)} className="text-slate-500 hover:text-white transition-colors">
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      <h4 className="font-bold text-white text-lg mb-2">{exercise.name}</h4>

      <AnimatePresence>
        {showTip && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-indigo-900/50 text-indigo-200 text-xs p-3 rounded-lg mb-3 border border-indigo-500/30 overflow-hidden"
          >
            {exercise.description}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 pt-4 border-t border-slate-700 flex items-center justify-between">
        <span className="text-xs text-slate-500 font-mono">45s ON / 15s OFF</span>
        <button onClick={() => setShowTimer(!showTimer)} className="bg-slate-700/50 p-1.5 rounded-full hover:bg-teal-500/50 transition-colors">
          {showTimer ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white" />}
        </button>
      </div>

      {showTimer && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <ExerciseTimer duration={60} onComplete={() => setShowTimer(false)} />
        </div>
      )}

      <button onClick={onToggleComplete} className={`absolute bottom-4 right-4 p-2 rounded-full ${isCompleted ? 'bg-emerald-600' : 'bg-slate-700/50 hover:bg-slate-600'} text-white transition-colors`}>
        <CheckCircle2 className="w-5 h-5" />
      </button>
    </div>
  );
};

const Gimnasio = () => {
  const [userEquipment, setUserEquipment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [completedExercises, setCompletedExercises] = useState({});

  // CORRECCIÓN: useEffect con array vacío para evitar bucle infinito
  useEffect(() => {
    const savedEquipment = localStorage.getItem('userTrainingEquipment');
    if (!savedEquipment) {
      setShowModal(true);
    } else {
      setUserEquipment(savedEquipment);
    }
  }, []);

  const handleEquipmentSelect = (equipmentId) => {
    localStorage.setItem('userTrainingEquipment', equipmentId);
    setUserEquipment(equipmentId);
    setShowModal(false);
  };

  const handleToggleComplete = (id) => {
    setCompletedExercises(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (!userEquipment && !showModal) return <div className="p-10 text-center text-slate-400">Cargando...</div>;

  return (
    <div className="p-6 md:p-10 pb-24 animate-in fade-in duration-500">
      {showModal && <EquipmentModal onSelect={handleEquipmentSelect} availableEquipment={EQUIPMENT_OPTIONS} onClose={() => userEquipment && setShowModal(false)} />}
      
      <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Gimnasio Digital</h1>
          <p className="text-slate-400 max-w-xl">Entrena inteligente. <span className="text-teal-400">{userEquipment === 'cuerpo' ? 'Peso corporal' : 'Mancuernas'}</span>.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="text-sm font-semibold text-teal-400 hover:text-teal-300 border border-teal-500/30 px-4 py-2 rounded-lg transition-colors">
          Cambiar Equipo
        </button>
      </div>

      {trainingProgram?.weeks?.map((weekData) => (
        <div key={weekData.week} className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-teal-500/10 rounded-lg flex items-center justify-center text-teal-400 font-bold text-lg">{weekData.week}</div>
            <h2 className="text-2xl font-bold text-white">{weekData.title}</h2>
          </div>
          <div className="space-y-8">
            {weekData.days.map((day) => (
              <div key={day.day} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-6 border-l-4 border-indigo-500 pl-3">Día {day.day}: {day.title}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {day.routine.map((slot) => (
                    <ExerciseCard 
                      key={`${weekData.week}-${day.day}-${slot.slot}`} 
                      slotTitle={slot.slot} 
                      exercise={slot.variants[userEquipment]} 
                      isCompleted={completedExercises[`${weekData.week}-${day.day}-${slot.slot}`]}
                      onToggleComplete={() => handleToggleComplete(`${weekData.week}-${day.day}-${slot.slot}`)}
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