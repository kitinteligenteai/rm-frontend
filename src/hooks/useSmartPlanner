// src/hooks/useSmartPlanner.js
// Lógica del Planeador Inteligente v1.0

import { useState, useEffect } from 'react';
import { recipes } from '../data/recipes';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

// Configuración de los espacios de comida
const MEAL_SLOTS = [
  { id: 'desayuno', label: 'Desayuno', types: ['Platillo Ligero'] },
  { id: 'comida', label: 'Comida', types: ['Platillo Principal'] },
  { id: 'cena', label: 'Cena', types: ['Platillo Ligero'] },
  { id: 'snack', label: 'Antojo', types: ['Antojo sin Culpa'] }
];

export function useSmartPlanner() {
  const [weekPlan, setWeekPlan] = useState({});
  const [activeTab, setActiveTab] = useState('rapido'); // 'rapido' | 'experto'

  // 1. Cargar datos guardados al iniciar
  useEffect(() => {
    const saved = localStorage.getItem('rm_smart_plan');
    if (saved) {
      setWeekPlan(JSON.parse(saved));
    } else {
      generateQuickMenu(); // Si es nuevo, generar uno automático
    }
  }, []);

  // 2. Guardar cambios automáticamente
  useEffect(() => {
    if (Object.keys(weekPlan).length > 0) {
      localStorage.setItem('rm_smart_plan', JSON.stringify(weekPlan));
    }
  }, [weekPlan]);

  // --- GENERADOR AUTOMÁTICO (Modo Rápido) ---
  const generateQuickMenu = () => {
    const newPlan = {};
    
    // Filtramos las recetas de tu base de datos
    const ligeros = recipes.filter(r => r.type === 'Platillo Ligero');
    const fuertes = recipes.filter(r => r.type === 'Platillo Principal');
    const antojos = recipes.filter(r => r.type === 'Antojo sin Culpa');

    // Función para elegir al azar
    const getRandom = (arr) => arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : null;

    DAYS.forEach(day => {
      newPlan[day] = {
        desayuno: getRandom(ligeros),
        comida: getRandom(fuertes),
        cena: getRandom(ligeros), 
        // 50% de probabilidad de tener snack
        snack: Math.random() > 0.5 ? getRandom(antojos) : null 
      };
    });
    setWeekPlan(newPlan);
  };

  // --- ACTUALIZAR MANUALMENTE (Modo Experto) ---
  const updateSlot = (day, slotId, recipe) => {
    setWeekPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [slotId]: recipe
      }
    }));
  };

  // --- SEMÁFORO DE PROTEÍNA ---
  const calculateDailyStats = (day) => {
    const meals = weekPlan[day];
    if (!meals) return 0;

    let totalProtein = 0;
    MEAL_SLOTS.forEach(slot => {
      const recipe = meals[slot.id];
      if (recipe && recipe.proteina_aprox_g) {
        totalProtein += recipe.proteina_aprox_g;
      }
    });

    // Redondear a 1 decimal
    return Math.round(totalProtein * 10) / 10;
  };

  return {
    weekPlan,
    generateQuickMenu,
    updateSlot,
    calculateDailyStats,
    activeTab,
    setActiveTab,
    days: DAYS,
    slots: MEAL_SLOTS
  };
}