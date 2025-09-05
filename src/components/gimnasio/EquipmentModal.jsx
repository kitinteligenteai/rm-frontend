// Contenido COMPLETO Y ACTUALIZADO para: src/components/gimnasio/EquipmentModal.jsx

import React from 'react';

// El componente ahora recibe 'onClose' para poder cerrarse.
const EquipmentModal = ({ onSelect, availableEquipment, onClose }) => {
  
  // Esta función maneja el clic en el fondo oscuro.
  // Si el clic es en el div del fondo (el 'wrapper'), se cierra.
  // Si es en el contenido del modal, no hace nada.
  const handleCloseOnOverlay = (e) => {
    if (e.target.id === 'modal-wrapper') {
      onClose();
    }
  };

  return (
    <div
      id="modal-wrapper"
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50"
      onClick={handleCloseOnOverlay} // Añadido el manejador de clic en el fondo
    >
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center relative">
        {/* --- BOTÓN DE CERRAR (X) --- */}
        <button 
          onClick={onClose} // Llama a la función onClose que viene de las props
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Cerrar modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">Bienvenido al Gimnasio Digital</h2>
        <p className="text-gray-600 mb-8">Para personalizar tu experiencia, por favor, selecciona el equipo que tienes disponible.</p>
        <div className="space-y-4">
          {availableEquipment.map((equip ) => (
            <button
              key={equip.id}
              onClick={() => onSelect(equip.id)}
              className="w-full text-left p-4 border rounded-lg hover:bg-gray-100 hover:border-teal-500 transition-all"
            >
              <h3 className="font-bold text-lg text-gray-800">{equip.name}</h3>
              <p className="text-sm text-gray-500">{equip.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EquipmentModal;
