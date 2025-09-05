// src/components/BonusRecipes.jsx (VERSIÓN FINAL CON FILTRADO POR PLAN)
import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Utensils, Zap, Clock } from 'lucide-react';
import { getRecipeVersion } from '../lib/dantePlanner';

const BonusCard = ({ recipeMatrix, userPlan, onSelect }) => {
  const recipeVersion = getRecipeVersion(recipeMatrix, userPlan);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      onClick={() => onSelect(recipeVersion)}
      className="bg-secondary-dark rounded-xl p-4 cursor-pointer hover:bg-brand-orange/10 
                 border-2 border-accent-gold/50 hover:border-accent-gold
                 transition-all duration-300 group shadow-lg hover:shadow-xl"
    >
      <h3 className="font-serif text-lg font-semibold text-accent-gold truncate group-hover:text-white transition-colors">
        {recipeMatrix.name}
      </h3>
      <p className="text-sm text-text-muted mt-1 font-sans line-clamp-2 h-10">
        {recipeVersion.description}
      </p>
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-primary-dark/50 text-xs text-text-muted font-sans">
        <div className="flex items-center gap-1.5" title="Tipo">
          <Utensils size={14} />
          <span>{recipeMatrix.type}</span>
        </div>
        <div className="flex items-center gap-1.5" title="Tiempo de Preparación">
          <Clock size={14} />
          <span>{recipeVersion.prepTime}</span>
        </div>
        <div className="flex items-center gap-1.5" title="Puntos Dante">
          <Zap size={14} className="text-accent-gold" />
          <span>{recipeVersion.dantePoints} pts</span>
        </div>
      </div>
    </motion.div>
  );
};

const BonusRecipes = ({ allRecipes, userProfile, onShowDetail }) => {

  const bonusRecipes = useMemo(() => {
    // Filtramos por tipo "Postre" Y que estén disponibles en el plan del usuario
    return Array.isArray(allRecipes) 
      ? allRecipes.filter(recipe => recipe.type === 'Postre' && recipe.planes.includes(userProfile.chosenPlan))
      : [];
  }, [allRecipes, userProfile.chosenPlan]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-serif text-white mb-4"><Gift className="inline w-10 h-10 text-accent-gold mr-3" />Postres Sin Culpa</h1>
        <p className="text-lg text-text-muted max-w-2xl mx-auto">
          El toque dulce que tu cuerpo y mente merecen. Recetas diseñadas para disfrutar sin remordimientos.
        </p>
      </motion.header>
      
      <motion.div 
        layout 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <AnimatePresence>
          {bonusRecipes.length > 0 ? (
            bonusRecipes.map(recipeMatrix => (
              <BonusCard key={recipeMatrix.id} recipeMatrix={recipeMatrix} userPlan={userProfile.chosenPlan} onSelect={onShowDetail} />
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center py-20"
            >
              <h3 className="font-serif text-2xl text-text-light">No hay postres disponibles para tu plan actual.</h3>
              <p className="text-text-muted mt-2">Dante está trabajando en nuevas creaciones para ti.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default BonusRecipes;
