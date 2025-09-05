// Contenido COMPLETO para el NUEVO archivo: src/components/ProteinCalculator.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ProteinCalculator = () => {
  const [gender, setGender] = useState('male');
  const [height, setHeight] = useState(175);
  const [activityLevel, setActivityLevel] = useState('sedentary');
  const [proteinGoal, setProteinGoal] = useState(null);

  const calculateProtein = (e) => {
    e.preventDefault();
    let baseHeight = height;
    if (gender === 'female') {
      baseHeight -= 5;
    }
    const idealWeight = baseHeight - 100;
    let multiplier = 1.2; // Moderado por defecto

    if (activityLevel === 'sedentary') multiplier = 1.0;
    if (activityLevel === 'active') multiplier = 1.5;

    const goal = Math.round(idealWeight * multiplier);
    setProteinGoal(goal);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={calculateProtein} className="space-y-6">
        {/* Género */}
        <div>
          <label className="block text-lg font-serif text-gray-700 mb-2">1. Género</label>
          <div className="grid grid-cols-2 gap-4">
            <button type="button" onClick={() => setGender('male')} className={`p-4 rounded-lg border-2 transition-all ${gender === 'male' ? 'bg-teal-600 border-teal-700 text-white' : 'bg-gray-100 border-gray-300'}`}>Masculino</button>
            <button type="button" onClick={() => setGender('female')} className={`p-4 rounded-lg border-2 transition-all ${gender === 'female' ? 'bg-pink-500 border-pink-600 text-white' : 'bg-gray-100 border-gray-300'}`}>Femenino</button>
          </div>
        </div>

        {/* Altura */}
        <div>
          <label htmlFor="height" className="block text-lg font-serif text-gray-700 mb-2">2. Altura: {height} cm</label>
          <input type="range" id="height" min="140" max="210" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
        </div>

        {/* Nivel de Actividad */}
        <div>
          <label htmlFor="activityLevel" className="block text-lg font-serif text-gray-700 mb-2">3. Nivel de Actividad Física</label>
          <select id="activityLevel" value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg bg-white">
            <option value="sedentary">Sedentario (trabajo de oficina)</option>
            <option value="moderate">Moderado (caminatas, ejercicio ligero)</option>
            <option value="active">Activo (entrenamiento regular)</option>
          </select>
        </div>

        <button type="submit" className="w-full bg-orange-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-700 transition-colors text-lg">
          Calcular Mi Objetivo
        </button>
      </form>

      {proteinGoal && (
        <div className="mt-8 text-center bg-teal-50 p-6 rounded-xl border border-teal-200">
          <p className="text-lg text-gray-600">Tu Objetivo Diario de Proteína es:</p>
          <p className="text-6xl font-extrabold text-teal-700 my-2">{proteinGoal}g</p>
          <p className="text-gray-500">Imagina tu plato para llegar a esta meta durante el día.</p>
          <p className="mt-4 text-center text-blue-600 hover:underline">
            <Link to="/plataforma/guia-visual-proteina">¿No sabes cómo empezar? Consulta la Guía Visual de Proteínas →</Link>
          </p>
        </div>
      )}
    </div>
  );
};

export default ProteinCalculator;
