// Contenido COMPLETO y FINAL (v3.0) para: src/components/tools/AsesorProteico.jsx

import React, { useState, useMemo } from 'react';
import { FaMale, FaFemale } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const AsesorProteico = () => {
  const [gender, setGender] = useState('male');
  const [height, setHeight] = useState(175);
  const [activity, setActivity] = useState('sedentary');
  const [showResult, setShowResult] = useState(false);

  const proteinTarget = useMemo(() => {
    const heightInMeters = height / 100;
    let idealWeight;
    if (gender === 'male') { idealWeight = (height - 100) * 0.9; } 
    else { idealWeight = (height - 100) * 0.85; }

    let activityMultiplier;
    switch (activity) {
      case 'sedentary': activityMultiplier = 1.8; break;
      case 'light': activityMultiplier = 2.0; break;
      case 'moderate': activityMultiplier = 2.2; break;
      case 'intense': activityMultiplier = 2.4; break;
      default: activityMultiplier = 1.8;
    }
    
    const dailyProtein = idealWeight * activityMultiplier;
    return Math.round(dailyProtein / 5) * 5;
  }, [gender, height, activity]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowResult(true);
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-gray-200">
      <h3 className="text-2xl font-bold text-gray-900 mb-1">Asesor Proteico Personalizado</h3>
      <p className="text-base text-gray-600 mb-6">Descubre tu objetivo diario de proteína en segundos.</p>

      {/* --- FORMULARIO (sin cambios) --- */}
      <form onSubmit={handleSubmit} className="space-y-6 bg-gray-50 p-6 rounded-lg">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">1. Género</label>
          <div className="flex space-x-4">
            <button type="button" onClick={() => setGender('male')} className={`flex-1 p-3 rounded-lg border-2 transition-all text-sm ${gender === 'male' ? 'bg-teal-600 text-white border-teal-700 shadow-md' : 'bg-white hover:bg-gray-100'}`}>
              <FaMale className="mx-auto mb-1" /> Masculino
            </button>
            <button type="button" onClick={() => setGender('female')} className={`flex-1 p-3 rounded-lg border-2 transition-all text-sm ${gender === 'female' ? 'bg-teal-600 text-white border-teal-700 shadow-md' : 'bg-white hover:bg-gray-100'}`}>
              <FaFemale className="mx-auto mb-1" /> Femenino
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="height" className="block text-sm font-bold text-gray-700">2. Altura: <span className="font-black text-teal-600">{height} cm</span></label>
          <input type="range" id="height" min="140" max="210" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600" />
        </div>
        <div>
          <label htmlFor="activity" className="block text-sm font-bold text-gray-700 mb-2">3. Nivel de Actividad Física</label>
          <select id="activity" value={activity} onChange={(e) => setActivity(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500">
            <option value="sedentary">Sedentario (trabajo de oficina)</option>
            <option value="light">Ligero (caminatas, 1-2 entrenamientos/sem)</option>
            <option value="moderate">Moderado (3-4 entrenamientos/sem)</option>
            <option value="intense">Intenso (5+ entrenamientos/sem, trabajo físico)</option>
          </select>
        </div>
        <button type="submit" className="w-full bg-orange-500 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-orange-600 transition-colors text-base shadow-md">
          Calcular Mi Objetivo
        </button>
      </form>

      {showResult && (
        <div className="mt-8 pt-6 border-t-2 border-dashed">
          <h4 className="text-lg font-bold text-center text-gray-800">Tu Objetivo Diario de Proteína es:</h4>
          <p className="text-5xl font-black text-teal-600 text-center my-2">{proteinTarget}g</p>
          
          {/* --- NUEVO: Medidor de Progreso Visual --- */}
          <div className="mt-4">
            <p className="text-center text-sm text-gray-600 mb-2">Imagina tu objetivo como un medidor que llenas durante el día:</p>
            <div className="w-full bg-gray-200 rounded-full h-8 border border-gray-300">
              <div className="bg-teal-500 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ width: `100%` }}>
                {proteinTarget}g
              </div>
            </div>
            <p className="text-center text-xs text-gray-500 mt-2">Cada comida es una oportunidad para añadir gramos a tu medidor.</p>
          </div>

          <div className="text-center mt-8 bg-teal-50 p-4 rounded-lg">
            <p className="text-sm text-teal-800 font-semibold">
              ¿No sabes cómo empezar a llenar tu medidor?
            </p>
            <Link to="/plataforma/biblioteca" className="text-sm font-bold text-teal-600 hover:underline mt-1 inline-block">
              Consulta la Guía Visual de Proteínas →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default AsesorProteico;
