// src/components/planner/RecipeDetailModal.jsx (VERSIÓN FINAL CORREGIDA)
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ChefHat, Sparkles } from 'lucide-react';
import Button from '../common/Button';

const RecipeDetailModal = ({ recipe, isOpen, onClose }) => {
  if (!isOpen) return null;
  const colorClass = recipe.type === 'Platillo Ligero' ? 'primary' : 'secondary';
  
  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-strong overflow-hidden flex flex-col" 
        initial={{ scale: 0.9 }} 
        animate={{ scale: 1 }} 
        exit={{ scale: 0.9 }}
      >
        <header className={`p-6 border-b border-neutral-200`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="font-display text-display text-neutral-800 mb-2">{recipe.name}</h1>
              <p className="text-body text-neutral-600">{recipe.description}</p>
            </div>
            <Button onClick={onClose} variant="ghost" size="small" className="flex items-center space-x-2 ml-4">
              <ArrowLeft className="w-4 h-4" />
              <span>Volver</span>
            </Button>
          </div>
        </header>
        
        <div className="overflow-y-auto p-6 space-y-8">
          {/* SECCIÓN DE INGREDIENTES CORREGIDA */}
          <section>
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className={`w-5 h-5 text-${colorClass}-600`} />
              <h2 className="font-display text-title text-neutral-800">Ingredientes</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recipe.ingredients?.map((ing, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl border">
                  <span className="text-body font-medium">{ing.name}</span>
                  <span className={`text-caption text-${colorClass}-700 font-medium`}>{ing.quantity}</span>
                </div>
              ))}
            </div>
          </section>

          {/* SECCIÓN DE INSTRUCCIONES CORREGIDA */}
          <section>
            <div className="flex items-center space-x-2 mb-4">
              <ChefHat className={`w-5 h-5 text-${colorClass}-600`} />
              <h2 className="font-display text-title text-neutral-800">Instrucciones</h2>
            </div>
            <div className="space-y-4">
              {recipe.instructions?.map((inst, i) => (
                <div key={i} className="flex space-x-4">
                  <div className={`w-8 h-8 bg-${colorClass}-600 text-white rounded-full flex items-center justify-center font-medium text-sm flex-shrink-0 mt-1`}>
                    {i + 1}
                  </div>
                  <p className="text-body text-neutral-700 leading-relaxed flex-1">{inst}</p>
                </div>
              ))}
            </div>
          </section>

          {/* SECCIÓN DE TIPS (YA ESTABA BIEN) */}
          {recipe.tips_dante && (
            <section>
              <div className="bg-gradient-to-r from-secondary-50 to-primary-50 rounded-2xl p-6 border">
                <h3 className="font-display text-title mb-3">Tips del Chef</h3>
                <div className="space-y-4 text-body text-neutral-700">
                  {recipe.tips_dante.general && <div><h4 className="font-medium mb-2">💡 General</h4><p>{recipe.tips_dante.general}</p></div>}
                  {recipe.tips_dante.estricto && <div><h4 className="font-medium mb-2">🎯 Estricto</h4><p>{recipe.tips_dante.estricto}</p></div>}
                  {recipe.tips_dante.familiar && <div><h4 className="font-medium mb-2">👨‍👩‍👧‍👦 Familiar</h4><p>{recipe.tips_dante.familiar}</p></div>}
                </div>
              </div>
            </section>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default RecipeDetailModal;
