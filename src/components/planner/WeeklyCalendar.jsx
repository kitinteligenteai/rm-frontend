// src/components/planner/WeeklyCalendar.jsx (VERSIÓN FINAL SIN 'react-dnd')
import React from 'react';
import { Clock } from 'lucide-react';

// Componente para un solo hueco de comida. Ahora es un simple botón.
const MealSlot = ({ meal, onRecipeClick }) => {
  if (!meal) {
    return (
      <div className="h-32 border-2 border-dashed rounded-xl flex items-center justify-center border-neutral-300 bg-neutral-50">
        <div className="text-center">
          <p className="text-caption text-neutral-500">Vacío</p>
        </div>
      </div>
    );
  }

  // Determina el color del borde basado en el tipo de comida
  const mealTypeColor = meal.type === 'Platillo Ligero' ? 'border-primary-300' : 'border-secondary-300';

  return (
    <div
      onClick={() => onRecipeClick(meal)}
      className={`h-32 bg-white rounded-xl border-2 p-3 cursor-pointer transition-all hover:shadow-medium hover:${mealTypeColor}`}
    >
      <div className={`w-full h-1 ${meal.type === 'Platillo Ligero' ? 'bg-primary-400' : 'bg-secondary-400'} rounded-full mb-2`}></div>
      <h4 className="font-medium text-neutral-800 text-sm leading-tight line-clamp-2">{meal.name}</h4>
      {meal.cookTime && (
        <div className="flex items-center space-x-1 text-caption text-neutral-500 mt-2">
          <Clock className="w-3 h-3" />
          <span>{meal.cookTime}</span>
        </div>
      )}
    </div>
  );
};

// Componente principal del calendario semanal
const WeeklyCalendar = ({ weeklyPlan, onRecipeClick }) => {
  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const mealTypes = ['arranque', 'recarga'];

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {days.map((day, dayIndex) => (
          <div key={day} className="space-y-4">
            <div className="text-center">
              <h3 className="font-medium text-neutral-800 mb-1">{day}</h3>
              <div className="w-full h-px bg-neutral-200"></div>
            </div>
            <div className="space-y-3">
              {mealTypes.map((mealType) => (
                <MealSlot
                  key={mealType}
                  meal={weeklyPlan?.[`day_${dayIndex}`]?.[mealType]}
                  onRecipeClick={onRecipeClick}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklyCalendar;
