import React, { useState } from 'react';
import { useSmartPlanner } from '../hooks/useSmartPlanner';
import { recipes } from '../data/recipes';
import ShoppingList from '../components/ShoppingList';
import { ShoppingCart, Utensils, Coffee, Moon, Sun, Dumbbell, Dice5, XCircle, Sparkles } from 'lucide-react';

const SlotIcons = { desayuno: Sun, comida: Utensils, cena: Moon, snack: Coffee };

export default function Planeador() {
  const { weekPlan, generateQuickMenu, updateSlot, shuffleSlot, calculateDailyStats, days, slots } = useSmartPlanner();
  const [selectedDaySlot, setSelectedDaySlot] = useState(null);
  const [showShoppingList, setShowShoppingList] = useState(false);

  const RecipeSelectorModal = () => {
    if (!selectedDaySlot) return null;
    const targetSlotConfig = slots.find(s => s.id === selectedDaySlot.slotId);
    const compatibleRecipes = recipes.filter(r => targetSlotConfig.types.includes(r.type));

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
        <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl max-h-[80vh] rounded-2xl flex flex-col shadow-2xl">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <h3 className="text-xl font-bold text-white">Elegir {targetSlotConfig.label}</h3>
            <button onClick={() => setSelectedDaySlot(null)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button onClick={() => { updateSlot(selectedDaySlot.day, selectedDaySlot.slotId, null); setSelectedDaySlot(null); }} className="flex items-center justify-center p-4 rounded-xl border border-dashed border-red-500/50 text-red-400 hover:bg-red-500/10">
                <XCircle className="w-5 h-5 mr-2" /> Dejar Vacío
            </button>
            {compatibleRecipes.map(recipe => (
              <button key={recipe.id} onClick={() => { updateSlot(selectedDaySlot.day, selectedDaySlot.slotId, recipe); setSelectedDaySlot(null); }} className="flex items-center gap-3 p-2 rounded-xl bg-slate-800 hover:bg-teal-500/10 border border-transparent hover:border-teal-500 text-left group">
                <img src={recipe.imageUrl} alt={recipe.name} className="w-14 h-14 rounded-lg object-cover bg-slate-700" />
                <div><p className="font-bold text-slate-200 text-sm group-hover:text-teal-400 line-clamp-2">{recipe.name}</p><p className="text-xs text-slate-500 mt-1">{recipe.proteina_aprox_g}g Prot.</p></div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-full mx-auto pb-24 animate-in fade-in duration-500">
      {selectedDaySlot && <RecipeSelectorModal />}
      
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Planeador Semanal</h1>
          <p className="text-slate-400 text-sm">Arma tu menú ideal arrastrando recetas o usa el autocompletar.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => generateQuickMenu(false)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg">
            <Sparkles className="w-4 h-4" /> Re-Generar Todo
          </button>
          <button onClick={() => setShowShoppingList(!showShoppingList)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold ${showShoppingList ? 'bg-teal-500 text-slate-900' : 'bg-slate-800 text-teal-400 border border-teal-500/30'}`}>
            <ShoppingCart className="w-4 h-4" /> {showShoppingList ? 'Ocultar Lista' : 'Ver Lista'}
          </button>
        </div>
      </div>

      <div className="bg-indigo-900/20 border border-indigo-500/30 p-4 rounded-xl mb-8 flex gap-4 items-center">
        <div className="p-2 bg-indigo-500/20 rounded-lg text-emerald-400"><Dumbbell className="w-5 h-5" /></div>
        <p className="text-slate-400 text-xs md:text-sm"><strong className="text-white">Objetivo Proteína:</strong> Busca la barra <span className="text-emerald-400">Verde (+90g)</span> para cuidar tu músculo.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 overflow-x-auto pb-4">
        {days.map((day) => {
          const dailyProtein = calculateDailyStats(day);
          let proteinColor = "bg-red-500";
          if (dailyProtein > 60) proteinColor = "bg-yellow-500";
          if (dailyProtein > 90) proteinColor = "bg-emerald-500";

          return (
            <div key={day} className="min-w-[160px] lg:min-w-0 bg-slate-800/40 border border-slate-700 rounded-xl overflow-hidden flex flex-col">
              <div className="p-3 bg-slate-800 border-b border-slate-700">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-white text-sm">{day}</h3>
                  <span className="text-[10px] text-slate-400 font-mono">{dailyProtein}g</span>
                </div>
                <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden"><div className={`h-full ${proteinColor}`} style={{ width: `${Math.min((dailyProtein / 110) * 100, 100)}%` }}></div></div>
              </div>
              <div className="p-2 space-y-2 flex-1">
                {slots.map((slot) => {
                  const recipe = weekPlan[day]?.[slot.id];
                  const Icon = SlotIcons[slot.id];
                  return (
                    <div key={slot.id} className="relative group">
                      <button onClick={(e) => { e.stopPropagation(); shuffleSlot(day, slot.id); }} className="absolute right-1 top-1 z-10 p-1 bg-slate-900/80 rounded text-teal-400 opacity-0 group-hover:opacity-100 hover:text-white" title="Cambiar al azar"><Dice5 className="w-3 h-3" /></button>
                      <div onClick={() => setSelectedDaySlot({ day, slotId: slot.id })} className={`p-2 rounded-lg border cursor-pointer min-h-[70px] flex flex-col justify-center relative ${recipe ? 'bg-slate-700/40 border-slate-600 hover:border-teal-500' : 'bg-slate-800/30 border-dashed border-slate-700 hover:border-slate-500'}`}>
                        <div className="flex items-center gap-2 mb-1"><Icon className="w-3 h-3 text-slate-500" /><span className="text-[9px] uppercase font-bold text-slate-500">{slot.label.split(' ')[0]}</span></div>
                        {recipe ? <p className="text-xs font-medium text-slate-200 line-clamp-2 leading-tight">{recipe.name}</p> : <div className="text-center text-slate-600 text-xs group-hover:text-teal-500">+ Agregar</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {showShoppingList && <div className="mt-12 animate-in slide-in-from-bottom-10 fade-in"><div className="bg-white rounded-3xl p-1 shadow-2xl border-t-4 border-teal-500"><ShoppingList mealPlan={weekPlan} /></div></div>}
    </div>
  );
}