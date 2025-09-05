// Contenido COMPLETO y AVANZADO para: src/components/library/ProteinCalculator.jsx

import React, { useState } from 'react';

// Base de datos de alimentos para la guía visual
const proteinSources = [
  { name: 'Huevo grande', protein: 7, unit: 'unidad' },
  { name: 'Pechuga de Pollo (150g)', protein: 45, unit: 'filete' },
  { name: 'Bistec de Res (150g)', protein: 43, unit: 'filete' },
  { name: 'Filete de Salmón (150g)', protein: 38, unit: 'filete' },
  { name: 'Lata de Atún (drenada)', protein: 28, unit: 'lata' },
  { name: 'Puñado de Almendras (30g)', protein: 6, unit: 'puñado' },
];

const ProteinAdvisor = () => {
  const [height, setHeight] = useState('');
  const [sex, setSex] = useState('male');
  const [result, setResult] = useState(null);

  const calculateIdealWeight = (heightCm, sex) => {
    const heightInInches = heightCm / 2.54;
    const inchesOver5Feet = heightInInches - 60;
    if (inchesOver5Feet <= 0) return sex === 'male' ? 50 : 45.5;
    
    const baseWeight = sex === 'male' ? 50 : 45.5;
    const idealWeight = baseWeight + (2.3 * inchesOver5Feet);
    return Math.round(idealWeight);
  };

  const generateFoodGuide = (proteinGoal) => {
    let remainingGoal = proteinGoal;
    const guide = [];
    
    // Lógica simple para crear un ejemplo de día
    const chickenFilets = Math.floor(remainingGoal / proteinSources[1].protein);
    if (chickenFilets > 0) {
      guide.push({ ...proteinSources[1], count: chickenFilets });
      remainingGoal -= chickenFilets * proteinSources[1].protein;
    }

    const eggs = Math.floor(remainingGoal / proteinSources[0].protein);
    if (eggs > 0) {
      guide.push({ ...proteinSources[0], count: eggs });
      remainingGoal -= eggs * proteinSources[0].protein;
    }
    
    if (remainingGoal > 0) {
        const almonds = Math.ceil(remainingGoal / proteinSources[5].protein);
        if (almonds > 0) {
            guide.push({ ...proteinSources[5], count: almonds });
        }
    }

    return guide;
  };

  const handleCalculate = (e) => {
    e.preventDefault();
    const heightNum = parseFloat(height);
    if (isNaN(heightNum) || heightNum <= 100) {
      setResult(null);
      return;
    }

    const idealWeight = calculateIdealWeight(heightNum, sex);
    const proteinGoal = Math.round(idealWeight * 1.8);
    const foodGuide = generateFoodGuide(proteinGoal);

    setResult({ idealWeight, proteinGoal, foodGuide });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Asesor Proteico Personalizado</h3>
      <p className="text-gray-600 mb-6">
        Introduce tus datos para estimar tu peso corporal ideal y tu objetivo proteico diario de referencia.
      </p>
      
      <form onSubmit={handleCalculate} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="height" className="block text-sm font-medium text-gray-700">Tu Estatura (cm)</label>
            <input
              type="number"
              id="height"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="Ej: 175"
              required
              className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label htmlFor="sex" className="block text-sm font-medium text-gray-700">Sexo Biológico</label>
            <select
              id="sex"
              value={sex}
              onChange={(e) => setSex(e.target.value)}
              className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="male">Hombre</option>
              <option value="female">Mujer</option>
            </select>
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-teal-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-700 transition-colors duration-300"
        >
          Calcular mi Objetivo
        </button>
      </form>

      {result && (
        <div className="mt-8 space-y-6">
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
            <p className="text-sm text-gray-600">Tu peso corporal ideal de referencia es aprox.</p>
            <p className="text-2xl font-bold text-gray-800">{result.idealWeight} kg</p>
          </div>
          <div className="p-6 bg-teal-50 border-l-4 border-teal-500 rounded-r-lg">
            <p className="text-lg text-teal-800">Tu objetivo proteico diario recomendado es:</p>
            <p className="text-4xl font-extrabold text-teal-900 mt-2">{result.proteinGoal} gramos</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700">¿Cómo se ve eso en comida real?</h4>
            <p className="text-sm text-gray-500 mb-4">Esto es solo un ejemplo para que te des una idea:</p>
            <ul className="space-y-2">
              {result.foodGuide.map((item, index) => (
                <li key={index} className="flex items-center p-2 bg-gray-100 rounded">
                  <span className="font-bold text-gray-800">{item.count} {item.unit}{item.count > 1 ? 's' : ''} de {item.name}</span>
                  <span className="ml-auto text-sm text-gray-600">~{item.count * item.protein}g</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="mt-6 text-xs text-gray-500">
        <p><strong>Disclaimer:</strong> Este cálculo es una referencia educativa. No sustituye el consejo de un profesional de la salud.</p>
      </div>
    </div>
  );
};

export default ProteinAdvisor; // Cambiamos el nombre para reflejar su nueva capacidad
