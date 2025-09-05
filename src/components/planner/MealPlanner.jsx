// src/components/planner/MealPlanner.jsx
import React, { useState, useEffect } from 'react';
import RecipeManager from './RecipeManager';
import WeeklyCalendar from './WeeklyCalendar';
import { useMealPlanner } from '../../hooks/useMealPlanner';
import { generateWeeklyPlan } from '../../lib/dantePlanner';
import Button from '../common/Button';
import { RotateCcw } from 'lucide-react';

const MealPlanner = ({ onRecipeSelect }) => {
  const { weeklyPlan, updateMeal, updateMealPlan } = useMealPlanner();
  const [selectedRecipeForSwap, setSelectedRecipeForSwap] = useState(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (!weeklyPlan || Object.keys(weeklyPlan).length === 0) {
      handleGenerateNewPlan();
    }
  }, []);

  const handleGenerateNewPlan = () => {
    const newPlan = generateWeeklyPlan();
    updateMealPlan({ week_0: newPlan });
  };

  const handleRecipeSelectFromManager = (recipe) => {
    setSelectedRecipeForSwap(recipe);
  };

  const handleSlotClick = (dayIndex, mealType) => {
    if (selectedRecipeForSwap) {
      updateMeal(0, dayIndex, mealType, selectedRecipeForSwap);
      setSelectedRecipeForSwap(null);
    } else {
      const meal = weeklyPlan?.week_0?.[`day_${dayIndex}`]?.[mealType];
      if (meal) {
        onRecipeSelect(meal);
      }
    }
  };
  
  if (!isClient) return <div className="text-center p-12">Cargando...</div>;

  return (
    <div className="flex h-full">
      <div className="w-1/3 border-r border-neutral-200">
        <RecipeManager onRecipeSelect={handleRecipeSelectFromManager} selectedRecipeId={selectedRecipeForSwap?.id} />
      </div>
      <div className="flex-1 bg-neutral-50 flex flex-col">
        <div className="p-6 border-b border-neutral-200">
          <div className="flex justify-between items-center">
            <h2 className="font-display text-title text-neutral-800">Tu Plan Semanal</h2>
            <Button onClick={handleGenerateNewPlan} variant="outline" size="small"><RotateCcw className="w-4 h-4 mr-2" />Nuevo Plan</Button>
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          <WeeklyCalendar weeklyPlan={weeklyPlan?.week_0} onSlotClick={handleSlotClick} isSwapModeActive={!!selectedRecipeForSwap} />
        </div>
      </div>
    </div>
  );
};
export default MealPlanner;
