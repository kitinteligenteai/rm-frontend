// Contenido COMPLETO Y ACTUALIZADO para: rm-frontend/src/pages/Gimnasio.jsx

import React, { useState, useEffect } from 'react';
import { trainingProgram } from '../data/trainingProgram.js';
import EquipmentModal from '../components/gimnasio/EquipmentModal.jsx';

const EQUIPMENT_OPTIONS = [
  { id: 'cuerpo', name: 'Solo mi Cuerpo', description: 'Ejercicios que no requieren equipo, solo una silla o toalla.' },
  { id: 'mancuernas', name: 'Tengo Mancuernas', description: 'Rutinas que incorporan el uso de mancuernas.' },
];

const ExerciseCard = ({ exercise, slotTitle }) => {
  if (!exercise) {
    return (
      <div className="border rounded-lg p-4 bg-gray-100 text-gray-500 shadow-inner">
        <h4 className="font-bold text-gray-600">{slotTitle}</h4>
        <p className="text-sm mt-2">Ejercicio no disponible para tu equipo. Intenta con otra selección.</p>
      </div>
    );
  }
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
      <h4 className="font-bold text-teal-700">{exercise.name}</h4>
      <p className="text-sm text-gray-600 mt-2">{exercise.description}</p>
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

  // Función para cerrar el modal
  const handleCloseModal = () => {
    // Solo cierra el modal si ya hay un equipo seleccionado.
    // Si es la primera vez, fuerza al usuario a elegir.
    if (userEquipment) {
      setShowModal(false);
    }
    // Si no hay equipo seleccionado, el modal no se puede cerrar.
    // Esto mantiene el comportamiento original para la primera visita.
    // Para cambiar esto y permitir cerrar siempre, simplemente usa:
    // setShowModal(false);
  };

  // Para permitir que el modal se cierre siempre, incluso la primera vez,
  // simplemente define la función así:
  const handleCloseModalAlways = () => {
    setShowModal(false);
  };


  if (!userEquipment && !showModal) {
    return <div className="p-8 text-center">Cargando configuración...</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8 bg-gray-50 min-h-full">
      {/* 
        Aquí pasamos la función para cerrar el modal.
        He usado 'handleCloseModalAlways' para implementar el cambio que pediste:
        que el usuario pueda salir incluso si entra por error la primera vez.
      */}
      {showModal && (
        <EquipmentModal 
          onSelect={handleEquipmentSelect} 
          availableEquipment={EQUIPMENT_OPTIONS}
          onClose={handleCloseModalAlways} 
        />
      )}

      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">Gimnasio Digital Adaptable</h1>
        <p className="text-lg text-gray-500 mt-2 max-w-2xl mx-auto">Tu programa de entrenamiento, personalizado según tu equipo.</p>
        {userEquipment && (
          <button onClick={() => setShowModal(true)} className="mt-4 text-sm text-blue-600 hover:underline">
            Cambiar equipo (Seleccionado: {EQUIPMENT_OPTIONS.find(e => e.id === userEquipment)?.name})
          </button>
        )}
      </div>

      {userEquipment && trainingProgram && trainingProgram.weeks && (
        <div className="space-y-12">
          {trainingProgram.weeks.map((weekData) => (
            <div key={weekData.week} className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Semana {weekData.week}: {weekData.title}</h2>
              {weekData.days.map((day) => (
                <div key={day.day} className="border-t pt-6 mt-6">
                  <h3 className="text-xl font-semibold text-gray-700 mb-4">Día {day.day}: {day.title}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          ))}
        </div>
      )}
    </div>
  );
};

export default Gimnasio;
