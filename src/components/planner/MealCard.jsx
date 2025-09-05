// src/components/planner/MealCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

const MealCard = ({ meal, mealType, onRecipeClick }) => {
  // Maneja el clic solo si hay una receta y una función
  const handleClick = () => {
    if (meal && onRecipeClick) {
      onRecipeClick(meal);
    }
  };

  const colorClass = mealType === 'arranque' ? 'primary' : 'secondary';

  return (
    <motion.div
      onClick={handleClick}
      className={`h-full bg-white rounded-xl border-2 p-3 cursor-pointer transition-all hover:shadow-medium border-neutral-200 hover:border-${colorClass}-300`}
      whileHover={{ y: -2 }}
      layout
    >
      <div className={`w-full h-1 bg-${colorClass}-400 rounded-full mb-2`}></div>
      <h4 className="font-medium text-neutral-800 text-sm leading-tight line-clamp-2">{meal.name}</h4>
      <div className="flex items-center space-x-1 text-caption text-neutral-500 mt-2">
        <Clock className="w-3 h-3" />
        <span>{meal.cookTime}</span>
      </div>
    </motion.div>
  );
};

export default MealCard;
