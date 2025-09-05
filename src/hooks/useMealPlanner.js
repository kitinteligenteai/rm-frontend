// src/hooks/useMealPlanner.js
import { useState, useEffect } from 'react';

const IS_SERVER = typeof window === 'undefined';

export const useMealPlanner = () => {
  const [weeklyPlan, setWeeklyPlan] = useState({});

  // Efecto para cargar el plan desde localStorage solo en el cliente
  useEffect(() => {
    if (IS_SERVER) return;

    try {
      const savedPlan = localStorage.getItem('chef-sistematizado-meal-plan');
      if (savedPlan) {
        setWeeklyPlan(JSON.parse(savedPlan));
      }
    } catch (error) {
      console.error("Error reading meal plan from localStorage", error);
      setWeeklyPlan({}); // Resetea a un objeto vacío en caso de error
    }
  }, []); // Se ejecuta solo una vez al montar el componente

  // Efecto para guardar el plan en localStorage cada vez que cambia
  useEffect(() => {
    if (IS_SERVER) return;

    try {
      // No guardar un objeto vacío al inicio si no hay nada
      if (Object.keys(weeklyPlan).length > 0) {
        localStorage.setItem('chef-sistematizado-meal-plan', JSON.stringify(weeklyPlan));
      }
    } catch (error) {
      console.error("Error saving meal plan to localStorage", error);
    }
  }, [weeklyPlan]);

  const updateMealPlan = (newPlan) => {
    setWeeklyPlan(newPlan);
  };

  const updateMeal = (dayIndex, mealType, recipe) => {
    const weekKey = 'week_0'; // Asumimos una sola semana para simplicidad
    setWeeklyPlan(prev => {
      const newWeekData = { ...prev[weekKey] };
      newWeekData[`day_${dayIndex}`] = {
        ...newWeekData[`day_${dayIndex}`],
        [mealType]: recipe
      };
      return { ...prev, [weekKey]: newWeekData };
    });
  };

  return {
    weeklyPlan,
    updateMealPlan,
    updateMeal
  };
};
