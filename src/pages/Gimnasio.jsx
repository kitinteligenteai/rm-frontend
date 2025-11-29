// src/pages/Gimnasio.jsx (v2.0 - Visual + Tooltips)
import React, { useState, useEffect } from 'react';
import { trainingProgram } from '../data/trainingProgram.js';
import EquipmentModal from '../components/gimnasio/EquipmentModal.jsx';
import { Dumbbell, Info, PlayCircle } from 'lucide-react';

const EQUIPMENT_OPTIONS = [
  { id: 'cuerpo', name: 'Solo mi Cuerpo', description: 'Ejercicios que no requieren equipo, solo una silla o toalla.' },
  { id: 'mancuernas', name: 'Tengo Mancuernas', description: 'Rutinas que incorporan el uso de mancuernas.' },
];

const ExerciseCard = ({ exercise, slotTitle }) => {
  const [showTip, setShowTip] = useState(false);

  if (!exercise) return null;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-teal-500/50 transition-all group relative">
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">{slotTitle}</span>
        <button onClick={() => setShowTip(!showTip)} className="text-slate-500 hover:text-white transition-colors">
          <Info className="w-4 h-4" />
        </button>
      </div>
      
      <h4 className="font-bold text-white text-lg mb-2 group-hover:text-teal-300 transition-colors">{exercise.name}</h4>
      
      {/* Tooltip / Explicación */}
      {showTip && (
        <div className="bg-indigo-900/90 text-indigo-100 text-xs p-3 rounded-lg mb-3 border border-indigo-500/30 animate-in fade-in zoom-in">
          <strong>¿Por qué este ejercicio?</strong> {exercise.description}
        </div>
      )}

      <p className={`text-sm text-slate-400 leading-relaxed ${showTip ? 'hidden' : 'block'}`}>
        {exercise.description}
      </p>

      <div className="mt-4 pt-4 border-t border-slate-700 flex items-center justify-between">
        <span className="text-xs text-slate-500 font-mono">45s trabajo / 15s descanso</span>
        {/* Si tuvieras video, aquí iría el botón */}
        <div className="bg-slate-700/50 p-1.5 rounded-full">
           <PlayCircle className="w-5 h-5 text-slate-500" />
        </div>
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

  if (!userEquipment && !showModal) return <div className="p-10 text-center text-slate-400">Cargando tu entrenador...</div>;

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
            Tu programa de entrenamiento metabólico, adaptado a {userEquipment === 'cuerpo' ? 'tu peso corporal' : 'tus mancuernas'}.
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