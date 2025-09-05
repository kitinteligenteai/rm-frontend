// Contenido COMPLETO y REPARADO para: rm-frontend/src/pages/BovedaRecetas.jsx

import React, { useState, useEffect } from 'react';
import { recipes as allRecipes } from '../data/recipes.js';

// --- Sub-componentes con Estilos Mejorados ---
const RecipeCard = ({ recipe, onClick }) => (
  <div
    className="group bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
    onClick={() => onClick(recipe)}
  >
    <div className="relative">
      <img src={recipe.imageUrl || 'https://placehold.co/600x400/334155/e2e8f0?text=Receta'} alt={recipe.name} className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110" />
      <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all duration-300"></div>
    </div>
    <div className="p-5">
      <h3 className="text-xl font-bold mb-2 text-gray-800 group-hover:text-teal-600 transition-colors duration-300">{recipe.name}</h3>
      <p className="text-gray-600 text-sm h-16 overflow-hidden">{recipe.description}</p>
    </div>
  </div>
 );

const RecipeModal = ({ recipe, onClose }) => {
  if (!recipe) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 text-3xl font-bold">&times;</button>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4 pr-8">{recipe.name}</h2>
          <img src={recipe.imageUrl || 'https://placehold.co/600x400/334155/e2e8f0?text=Receta'} alt={recipe.name} className="w-full h-64 object-cover rounded-md mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-xl font-bold text-gray-800 mb-3 border-b-2 border-teal-500 pb-2">Ingredientes</h4>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {recipe.ingredients.map((ing, index ) => <li key={index}>{`${ing.quantity} ${ing.unit || ''} de ${ing.name}`}</li>)}
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-800 mb-3 border-b-2 border-teal-500 pb-2">Instrucciones</h4>
              <ol className="list-decimal list-inside space-y-3 text-gray-700">
                {recipe.instructions.map((step, index) => <li key={index}>{step}</li>)}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BovedaRecetas = () => {
  const [filteredRecipes, setFilteredRecipes] = useState(allRecipes);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    const newFilteredRecipes = allRecipes.filter(r => r && r.name && r.name.toLowerCase().includes(lowercasedFilter));
    setFilteredRecipes(newFilteredRecipes);
  }, [searchTerm]);

  return (
    <div className="min-h-full bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto p-4 md:p-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">Bóveda de Recetas</h1>
          <p className="text-lg text-gray-500 mt-2 max-w-2xl mx-auto">Explora, busca y descubre tu próxima comida saludable.</p>
        </div>
        <div className="mb-10 max-w-lg mx-auto">
          <input type="text" placeholder="Buscar por nombre..." className="w-full p-4 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500" onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {/* --- LÍNEA DE CÓDIGO CORREGIDA --- */}
          {/* Se añade .filter(Boolean) para eliminar cualquier elemento nulo del array antes de renderizar */}
          {filteredRecipes
            .filter(Boolean)
            .map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} onClick={setSelectedRecipe} />
          ))}
        </div>
        {selectedRecipe && <RecipeModal recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />}
      </div>
    </div>
  );
};

export default BovedaRecetas;
