// RUTA: src/components/evaluation/NutritionPlanCalculator.jsx
// ESTADO: HOTFIX v1 - Lógica de Cálculo y Microcopy Corregidos

import React, { useState } from 'react';
import { motion } from 'framer-motion';

const NutritionPlanCalculator = ({ onComplete }) => {
  const [gender, setGender] = useState('male');
  const [weight, setWeight] = useState('');
  const [stature, setStature] = useState('');
  const [age, setAge] = useState('');
  const [activityLevel, setActivityLevel] = useState('light');
  const [goal, setGoal] = useState('lose_fat_preserve_muscle'); // Nuevo estado para el objetivo
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);

  const calculatePlan = () => {
    if (!weight || !stature || !age) {
      setError('Por favor, completa todos los campos.');
      return;
    }
    setError('');
    setIsCalculating(true);

    setTimeout(() => {
        const weightKg = parseFloat(weight);
        const statureCm = parseFloat(stature);
        const ageNum = parseInt(age);

        const idealWeight = (gender === 'male') ? 22 * Math.pow(statureCm / 100, 2) : 21 * Math.pow(statureCm / 100, 2);
        const calculationWeight = Math.min(weightKg, idealWeight * 1.2);
        
        // Matriz de decisión para multiplicador de proteína
        let proteinMultiplier = 1.8; // Base para perder grasa
        if (goal === 'lose_fat_gain_muscle') proteinMultiplier = 2.2;
        if (goal === 'maintain') proteinMultiplier = 1.6;
        if (goal === 'gain_muscle') proteinMultiplier = 2.2;

        if (activityLevel === 'moderate') proteinMultiplier += 0.2;
        if (activityLevel === 'active') proteinMultiplier += 0.4;
        if (ageNum > 60) proteinMultiplier = Math.max(proteinMultiplier, 2.0);

        const proteinTarget = Math.round(calculationWeight * proteinMultiplier);
        const proteinCalories = proteinTarget * 4;

        const bmr = (10 * weightKg) + (6.25 * statureCm) - (5 * ageNum) + (gender === 'male' ? 5 : -161);
        const activityMultipliers = { light: 1.375, moderate: 1.55, active: 1.725 };
        const tdee = bmr * activityMultipliers[activityLevel];
        
        // Matriz de decisión para ajuste calórico
        let calorieAdjuster = 0.80; // Déficit del 20% para perder grasa
        if (goal === 'maintain') calorieAdjuster = 1.0;
        if (goal === 'gain_muscle') calorieAdjuster = 1.10; // Superávit del 10% para ganar músculo

        const targetCalories = tdee * calorieAdjuster;

        const carbTarget = 80;
        const carbCalories = carbTarget * 4;

        const fatCalories = targetCalories - proteinCalories - carbCalories;
        const fatTarget = Math.round(fatCalories / 9);

        const finalResults = { protein: proteinTarget, fat: fatTarget, carbs: carbTarget, calories: Math.round(targetCalories) };
        
        setResults(finalResults);
        setIsCalculating(false);
        onComplete(finalResults);
    }, 1500);
  };

  if (results) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-8 bg-white rounded-2xl shadow-lg border border-gray-200"
      >
        <div className="text-center">
          <h3 className="text-2xl font-bold text-[#00838F]">Tu Plan Nutricional Base</h3>
          <p className="mt-2 text-gray-600">Estos son tus objetivos diarios para iniciar el reinicio.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 text-center">
          <motion.div initial={{ opacity: 0, y:20 }} animate={{ opacity:1, y:0, transition:{delay:0.2}}} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700 font-semibold">Proteína</p>
            <p className="text-3xl font-bold text-blue-900">{results.protein}g</p>
            <p className="text-xs text-blue-600">Saciedad y Músculo</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y:20 }} animate={{ opacity:1, y:0, transition:{delay:0.4}}} className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-700 font-semibold">Grasas Saludables</p>
            <p className="text-3xl font-bold text-green-900">{results.fat}g</p>
            <p className="text-xs text-green-600">Energía Estable y Saciedad</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y:20 }} animate={{ opacity:1, y:0, transition:{delay:0.6}}} className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-sm text-orange-700 font-semibold">Carbohidratos Netos</p>
            <p className="text-3xl font-bold text-orange-900">&lt;{results.carbs}g</p>
            <p className="text-xs text-orange-600">Tu Límite para Quemar Grasa</p>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="p-6 sm:p-8 bg-white rounded-2xl shadow-lg border border-gray-200">
      <h3 className="text-2xl font-bold text-gray-800 text-center">Paso 2: Calculadora de Plan Nutricional</h3>
      <div className="space-y-4 mt-6">
        {/* Campos de Género, Edad, Estatura, Peso */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Género</label>
            <select value={gender} onChange={e => setGender(e.target.value)} className="w-full p-3 mt-1 border border-gray-300 rounded-md">
              <option value="male">Masculino</option>
              <option value="female">Femenino</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Edad</label>
            <input type="number" value={age} onChange={e => setAge(e.target.value)} className="w-full p-3 mt-1 border border-gray-300 rounded-md" placeholder="Años" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Estatura (cm)</label>
            <input type="number" value={stature} onChange={e => setStature(e.target.value)} className="w-full p-3 mt-1 border border-gray-300 rounded-md" placeholder="Ej: 175" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Peso Actual (kg)</label>
            <input type="number" value={weight} onChange={e => setWeight(e.target.value)} className="w-full p-3 mt-1 border border-gray-300 rounded-md" placeholder="Ej: 80" />
          </div>
        </div>
        {/* Campo de Actividad */}
        <div>
            <label className="block text-sm font-medium text-gray-700">Actividad Semanal</label>
            <select value={activityLevel} onChange={e => setActivityLevel(e.target.value)} className="w-full p-3 mt-1 border border-gray-300 rounded-md">
              <option value="light">Ligera (0-2 días ejercicio)</option>
              <option value="moderate">Moderada (3-4 días)</option>
              <option value="active">Activa (5+ días)</option>
            </select>
        </div>
        {/* Campo de Objetivo Principal */}
        <div>
            <label className="block text-sm font-medium text-gray-700">Tu Objetivo Principal</label>
            <select value={goal} onChange={e => setGoal(e.target.value)} className="w-full p-3 mt-1 border border-gray-300 rounded-md">
              <option value="lose_fat_preserve_muscle">Perder grasa (preservando músculo)</option>
              <option value="lose_fat_gain_muscle">Perder grasa y ganar músculo</option>
              <option value="maintain">Mantener peso y optimizar salud</option>
              <option value="gain_muscle">Ganar masa muscular</option>
            </select>
        </div>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <button onClick={calculatePlan} disabled={isCalculating} className="w-full px-4 py-3 bg-[#00838F] text-white font-bold rounded-lg hover:bg-[#006064] transition-all disabled:bg-gray-400">
          {isCalculating ? 'Calculando...' : 'Calcular mi Plan Base'}
        </button>
      </div>
    </div>
  );
};

export default NutritionPlanCalculator;
