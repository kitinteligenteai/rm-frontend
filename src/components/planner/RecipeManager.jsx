// src/components/planner/RecipeManager.jsx
import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { recipes } from '../../data/recipes';
import { motion } from 'framer-motion';

const RecipeCard = ({ recipe, onRecipeSelect, isSelected }) => {
  const selectedClasses = isSelected ? 'ring-2 ring-primary-500 shadow-medium' : 'border-neutral-200 hover:shadow-medium hover:border-primary-300';
  return (
    <motion.div onClick={() => onRecipeSelect(recipe)} className={`bg-white rounded-xl border p-4 cursor-pointer transition-all ${selectedClasses}`} whileHover={{ scale: 1.03 }} layout>
      <h3 className="font-medium text-neutral-800 text-sm leading-tight line-clamp-2">{recipe.name}</h3>
      <p className="text-caption text-neutral-600 line-clamp-2 mt-1">{recipe.description}</p>
    </motion.div>
  );
};

const RecipeManager = ({ onRecipeSelect, selectedRecipeId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredRecipes = useMemo(() => recipes.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase())), [searchTerm]);

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b border-neutral-200">
        <h2 className="font-display text-title text-neutral-800 mb-4">Recetario</h2>
        <div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" /><input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg" /></div>
      </div>
      <div className="flex-1 overflow-auto p-6 space-y-4">
        {filteredRecipes.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} onRecipeSelect={onRecipeSelect} isSelected={recipe.id === selectedRecipeId} />)}
      </div>
      <div className="p-4 border-t border-neutral-200 bg-neutral-50 text-center">
        <p className="text-caption text-neutral-600">{selectedRecipeId ? <strong>Receta seleccionada.</strong> : "Selecciona una receta"}</p>
        <p className="text-xs text-neutral-500">{selectedRecipeId ? "Haz clic en un día del plan para colocarla." : "para reemplazar una comida."}</p>
      </div>
    </div>
  );
};
export default RecipeManager;
