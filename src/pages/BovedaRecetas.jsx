// src/pages/BovedaRecetas.jsx
// v2.0 - Diseño Estilo Netflix (Dark Mode Premium)

import React, { useState, useEffect } from 'react';
import { recipes as allRecipes } from '../data/recipes.js';
import { Search, Clock, Flame, ChefHat, X, Filter, ArrowRight, Zap, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- COMPONENTES UI INTERNOS ---

const CategoryTab = ({ label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
      active 
        ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/40 scale-105' 
        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
    }`}
  >
    {label}
  </button>
);

const RecipeBadge = ({ icon: Icon, text, color }) => (
  <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${color}`}>
    <Icon size={12} /> {text}
  </div>
);

const RecipeCard = ({ recipe, onClick }) => {
  // Detector de badges automáticos
  const isHighProtein = recipe.proteina_aprox_g > 30;
  const isFast = recipe.tags?.includes('rápido');

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="group bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 hover:border-teal-500/50 hover:shadow-2xl hover:shadow-teal-900/20 cursor-pointer transition-all flex flex-col h-full"
      onClick={() => onClick(recipe)}
    >
      {/* Imagen */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={recipe.imageUrl || 'https://placehold.co/600x400/1e293b/475569?text=Receta'} 
          alt={recipe.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-90" />
        
        {/* Badges Flotantes */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {isHighProtein && (
            <span className="bg-orange-500/90 text-white text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-sm shadow-sm flex items-center gap-1">
              <Flame size={10} /> +PROT
            </span>
          )}
          {isFast && (
            <span className="bg-blue-500/90 text-white text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-sm shadow-sm flex items-center gap-1">
              <Zap size={10} /> RÁPIDO
            </span>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-white mb-2 leading-tight group-hover:text-teal-400 transition-colors">
          {recipe.name}
        </h3>
        <p className="text-slate-400 text-xs line-clamp-2 mb-4 flex-1">
          {recipe.description}
        </p>

        {/* Footer Card */}
        <div className="flex justify-between items-center border-t border-slate-800 pt-3 mt-auto">
          <div className="text-xs text-slate-500 font-mono flex items-center gap-1">
            <span className="text-teal-500 font-bold">{recipe.proteina_aprox_g}g</span> Prot
          </div>
          <div className="text-xs font-bold text-slate-300 flex items-center gap-1 group-hover:underline">
            Ver receta <ArrowRight size={12} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const RecipeModal = ({ recipe, onClose }) => {
  if (!recipe) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 animate-in fade-in duration-200" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-20 bg-black/50 hover:bg-slate-800 text-white p-2 rounded-full backdrop-blur-sm transition-all"
        >
          <X size={24} />
        </button>

        {/* Columna Izquierda: Imagen y Tips */}
        <div className="md:w-2/5 relative h-64 md:h-auto">
          <img 
            src={recipe.imageUrl} 
            alt={recipe.name} 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent md:bg-gradient-to-r md:from-transparent md:via-slate-900/20 md:to-slate-900" />
          
          {/* Widget de Dante (Tips) */}
          <div className="absolute bottom-4 left-4 right-4 bg-slate-950/80 backdrop-blur-md p-4 rounded-xl border border-slate-800 hidden md:block">
            <div className="flex items-center gap-2 mb-2 text-yellow-400 font-bold text-xs uppercase tracking-widest">
              <ChefHat size={16} /> Tip del Chef Dante
            </div>
            <p className="text-slate-300 text-sm italic">
              "{recipe.tips_dante?.general || recipe.tips_dante?.estricto || "Disfruta cada bocado consciente."}"
            </p>
          </div>
        </div>

        {/* Columna Derecha: Detalles */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto">
          <span className="inline-block px-3 py-1 bg-teal-500/10 text-teal-400 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            {recipe.type || "Receta"}
          </span>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{recipe.name}</h2>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {recipe.tags?.map(tag => (
              <span key={tag} className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700">
                #{tag}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Ingredientes */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-teal-500 rounded-full"></div> Ingredientes
              </h3>
              <ul className="space-y-2">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                    <span className="text-teal-500 mt-1">•</span> 
                    <span>
                      <strong className="text-slate-100">{ing.quantity}</strong> {ing.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Instrucciones */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                 <div className="w-1 h-6 bg-indigo-500 rounded-full"></div> Preparación
              </h3>
              <ol className="space-y-4">
                {recipe.instructions.map((step, i) => (
                  <li key={i} className="flex gap-4 group">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-xs font-bold group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                      {i + 1}
                    </span>
                    <p className="text-slate-300 text-sm leading-relaxed">{step}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Tip móvil */}
          <div className="mt-8 bg-slate-800/50 p-4 rounded-xl border border-slate-700 md:hidden">
             <p className="text-slate-300 text-xs italic text-center">
              💡 Tip: {recipe.tips_dante?.general}
            </p>
          </div>

        </div>
      </motion.div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---

const BovedaRecetas = () => {
  const [activeTab, setActiveTab] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [filteredRecipes, setFilteredRecipes] = useState(allRecipes);

  const categories = ["Todos", "Principales", "Ligeros", "Antojos"];

  useEffect(() => {
    let result = allRecipes;

    // 1. Filtro por Pestaña
    if (activeTab === "Principales") {
      result = result.filter(r => r.type === "Platillo Principal");
    } else if (activeTab === "Ligeros") {
      result = result.filter(r => r.type === "Platillo Ligero");
    } else if (activeTab === "Antojos") {
      result = result.filter(r => r.type === "Antojo sin Culpa");
    }

    // 2. Filtro por Buscador
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(r => 
        r.name.toLowerCase().includes(lower) || 
        r.tags.some(t => t.toLowerCase().includes(lower))
      );
    }

    setFilteredRecipes(result);
  }, [activeTab, searchTerm]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-20 animate-in fade-in duration-500">
      
      {/* HEADER HERO */}
      <div className="relative bg-slate-900 border-b border-slate-800 pt-10 pb-16 px-6 md:px-12 mb-8">
         <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight">
               Bóveda de <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">Recetas Maestras</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
               Más de 80 fórmulas culinarias diseñadas para sanar tu metabolismo sin sacrificar el sabor.
            </p>
         </div>

         {/* BARRA DE BÚSQUEDA FLOTANTE */}
         <div className="max-w-xl mx-auto mt-8 relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
               <Search className="text-slate-500" size={20} />
            </div>
            <input 
               type="text" 
               placeholder="¿Qué se te antoja hoy? (Ej. Pollo, Chocolate...)" 
               className="w-full bg-slate-950 border border-slate-700 text-white py-4 pl-12 pr-4 rounded-2xl shadow-xl focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all placeholder:text-slate-600"
               onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* PESTAÑAS DE NAVEGACIÓN */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
           {categories.map(cat => (
             <CategoryTab 
               key={cat} 
               label={cat} 
               active={activeTab === cat} 
               onClick={() => setActiveTab(cat)} 
             />
           ))}
        </div>

        {/* GRID DE RESULTADOS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
           <AnimatePresence mode='popLayout'>
             {filteredRecipes.map(recipe => (
               <RecipeCard 
                  key={recipe.id} 
                  recipe={recipe} 
                  onClick={setSelectedRecipe} 
               />
             ))}
           </AnimatePresence>
        </div>

        {/* ESTADO VACÍO */}
        {filteredRecipes.length === 0 && (
           <div className="text-center py-20 opacity-50">
              <Filter size={48} className="mx-auto mb-4 text-slate-600" />
              <p className="text-xl font-bold">No encontramos recetas con esos criterios.</p>
              <p className="text-sm">Intenta buscar otro ingrediente.</p>
           </div>
        )}

      </div>

      {/* MODAL DE DETALLE */}
      {selectedRecipe && (
        <RecipeModal recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
      )}
    </div>
  );
};

export default BovedaRecetas;