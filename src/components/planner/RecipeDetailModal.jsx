// src/components/planner/RecipeDetailModal.jsx (v2.0 - High Contrast Fix)
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ChefHat, Sparkles, X } from 'lucide-react';

const RecipeDetailModal = ({ recipe, isOpen, onClose }) => {
  if (!isOpen || !recipe) return null;
  
  // Definimos colores fuertes
  const colorClass = recipe.type === 'Platillo Ligero' ? 'text-indigo-600' : 'text-teal-600';
  const bgClass = recipe.type === 'Platillo Ligero' ? 'bg-indigo-50' : 'bg-teal-50';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col" 
        initial={{ scale: 0.95, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }}
      >
        {/* Header con Imagen de Fondo (Opcional) o Color Solido */}
        <div className="relative bg-slate-50 p-6 border-b border-slate-200 flex justify-between items-start">
          <div className="pr-10">
            <span className={`text-xs font-bold uppercase tracking-wider ${colorClass} border border-current px-2 py-1 rounded-full mb-2 inline-block`}>
              {recipe.type}
            </span>
            {/* TÍTULO EN NEGRO PURO PARA LEGIBILIDAD */}
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">
              {recipe.name}
            </h2>
            <p className="text-slate-600 mt-2 text-sm font-medium leading-relaxed">
              {recipe.description}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 bg-white rounded-full shadow-md text-slate-500 hover:text-red-500 transition-colors absolute top-4 right-4"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* INGREDIENTES */}
          <section>
            <div className="flex items-center gap-2 mb-4 border-b pb-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-bold text-slate-800">Ingredientes</h3>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recipe.ingredients?.map((ing, i) => (
                <li key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-700 font-medium text-sm">{ing.name}</span>
                  <span className="text-slate-900 font-bold text-sm">{ing.quantity}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* INSTRUCCIONES */}
          <section>
            <div className="flex items-center gap-2 mb-4 border-b pb-2">
              <ChefHat className="w-5 h-5 text-teal-600" />
              <h3 className="text-lg font-bold text-slate-800">Preparación</h3>
            </div>
            <div className="space-y-4">
              {recipe.instructions?.map((inst, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-slate-800 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">
                    {i + 1}
                  </div>
                  <p className="text-slate-700 leading-relaxed text-base mt-1">
                    {inst}
                  </p>
                </div>
              ))}
            </div>
          </section>
          
          {/* Tips de Dante (Si existen) */}
          {recipe.tips_dante && (
            <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100">
              <h4 className="font-bold text-indigo-900 mb-2 text-sm">💡 Tip del Chef</h4>
              <p className="text-indigo-800 text-sm">{recipe.tips_dante.general || recipe.tips_dante.familiar}</p>
            </div>
          )}

        </div>

        {/* Footer Fijo */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button onClick={onClose} className="px-6 py-2 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 transition-colors">
            Cerrar Receta
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default RecipeDetailModal;