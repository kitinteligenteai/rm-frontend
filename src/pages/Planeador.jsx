// src/pages/Planeador.jsx (v7.0 - Modo Refrigerador Listo)
import React, { useState } from 'react';
import { useSmartPlanner } from '../hooks/useSmartPlanner';
import { recipes } from '../data/recipes';
import ShoppingList from '../components/ShoppingList';
import RecipeDetailModal from '../components/planner/RecipeDetailModal';
import { 
  ShoppingCart, Sun, Moon, Coffee, Utensils, 
  Dumbbell, Dice5, XCircle, CheckCircle, Printer 
} from 'lucide-react';

const SlotIcons = { desayuno: Sun, comida: Utensils, cena: Moon, snack: Coffee };

// Lista Estática
const GenericShoppingList = () => (
  <div className="bg-white p-6 rounded-2xl shadow-xl border-t-4 border-indigo-500 print:border-0 print:shadow-none">
    <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
      <ShoppingCart className="w-5 h-5 text-indigo-600" /> Lista de Supervivencia
    </h3>
    <div className="grid md:grid-cols-2 gap-6 print:grid-cols-2">
      <div>
        <h4 className="font-bold text-teal-700 text-sm mb-2 uppercase tracking-wider">Proteínas</h4>
        <ul className="space-y-2 text-sm text-slate-700">
          <li>• Huevos (30 pzas)</li>
          <li>• Atún en agua (5 latas)</li>
          <li>• Pechuga de Pollo (1 kg)</li>
          <li>• Carne Molida / Bistec (1 kg)</li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold text-green-700 text-sm mb-2 uppercase tracking-wider">Vegetales y Grasas</h4>
        <ul className="space-y-2 text-sm text-slate-700">
          <li>• Mix de Verduras Congeladas</li>
          <li>• Espinacas y Nopales</li>
          <li>• Aguacates (5-7 pzas)</li>
          <li>• Nueces / Almendras</li>
        </ul>
      </div>
    </div>
  </div>
);

export default function Planeador() {
  const { weekPlan, updateSlot, shuffleSlot, calculateDailyStats, days, slots } = useSmartPlanner();
  const [activeTab, setActiveTab] = useState('gusto'); 
  const [viewingRecipe, setViewingRecipe] = useState(null);
  const [selectedDaySlot, setSelectedDaySlot] = useState(null);
  const [showShoppingList, setShowShoppingList] = useState(false);

  const RecipeSelectorModal = () => {
    if (!selectedDaySlot) return null;
    const targetSlotConfig = slots.find(s => s.id === selectedDaySlot.slotId);
    const compatibleRecipes = recipes.filter(r => targetSlotConfig.types.includes(r.type));
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in print:hidden">
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
                <div><p className="font-bold text-slate-200 text-sm group-hover:text-teal-400 line-clamp-2">{recipe.name}</p></div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-full mx-auto pb-24 animate-in fade-in duration-500 print:p-0 print:bg-white">
      {selectedDaySlot && <RecipeSelectorModal />}
      {viewingRecipe && <RecipeDetailModal recipe={viewingRecipe} isOpen={true} onClose={() => setViewingRecipe(null)} />}

      {/* HEADER - Oculto al imprimir */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Planeador Semanal</h1>
          <p className="text-slate-400 text-sm">Organiza tus comidas.</p>
        </div>
        <div className="flex gap-3">
            <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition-colors">
                <Printer className="w-4 h-4" /> Imprimir Menú
            </button>
            <div className="bg-slate-800 p-1 rounded-xl flex border border-slate-700">
            <button onClick={() => setActiveTab('gusto')} className={`px-4 py-2 rounded-lg text-sm font-bold ${activeTab === 'gusto' ? 'bg-teal-600 text-white' : 'text-slate-400'}`}>Planeador</button>
            <button onClick={() => setActiveTab('rapido')} className={`px-4 py-2 rounded-lg text-sm font-bold ${activeTab === 'rapido' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>Guía Rápida</button>
            </div>
        </div>
      </div>

      {/* Header SOLO para Impresión */}
      <div className="hidden print:block mb-6 text-center">
        <h1 className="text-2xl font-bold text-black">Mi Plan Semanal - Reinicio Metabólico</h1>
        <p className="text-sm text-gray-600">Pégalo en tu refrigerador y mantén el enfoque.</p>
      </div>

      {activeTab === 'rapido' && (
        <div className="space-y-8">
          <div className="bg-gradient-to-r from-indigo-900/80 to-slate-900 border border-indigo-500/30 p-8 rounded-3xl text-center print:hidden">
            <h2 className="text-2xl font-bold text-white mb-4">Guía de Emergencia</h2>
            <p className="text-indigo-200 max-w-2xl mx-auto">Si no tienes tiempo, usa esta estructura base.</p>
          </div>
          <GenericShoppingList />
        </div>
      )}

      {activeTab === 'gusto' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 print:grid-cols-7 print:gap-2 print:text-xs">
            {days.map((day) => {
              const dailyProtein = calculateDailyStats(day);
              let proteinColor = "bg-red-500";
              if (dailyProtein > 60) proteinColor = "bg-yellow-500";
              if (dailyProtein > 90) proteinColor = "bg-emerald-500";

              return (
                <div key={day} className="min-w-[180px] lg:min-w-0 bg-slate-800/40 border border-slate-700 rounded-xl overflow-hidden flex flex-col print:bg-white print:border-gray-300 print:min-w-0">
                  <div className="p-3 bg-slate-800 border-b border-slate-700 flex justify-between items-center print:bg-gray-100 print:border-gray-300 print:p-2">
                    <span className="font-bold text-white text-sm print:text-black">{day}</span>
                    <span className="text-[10px] text-slate-400 print:text-gray-600">{dailyProtein}g</span>
                  </div>
                  
                  <div className="p-2 space-y-2 flex-1 print:space-y-1">
                    {slots.map((slot) => {
                      const recipe = weekPlan[day]?.[slot.id];
                      const Icon = SlotIcons[slot.id];
                      return (
                        <div key={slot.id} className="group relative">
                          {/* Shuffle solo en pantalla */}
                          <button onClick={(e) => { e.stopPropagation(); shuffleSlot(day, slot.id); }} className="absolute right-1 top-1 z-10 p-1 bg-slate-900/80 rounded text-teal-400 opacity-0 group-hover:opacity-100 hover:text-white print:hidden"><Dice5 className="w-3 h-3" /></button>

                          <div onClick={() => recipe ? setViewingRecipe(recipe) : setSelectedDaySlot({ day, slotId: slot.id })} className={`p-2 rounded-lg border cursor-pointer min-h-[70px] flex flex-col justify-center relative transition-all ${recipe ? 'bg-slate-700/40 border-slate-600 hover:border-teal-500 print:bg-white print:border-gray-200' : 'bg-slate-800/30 border-dashed border-slate-700 hover:bg-slate-800 print:hidden'}`}>
                            <div className="flex items-center gap-2 mb-1 opacity-60 print:opacity-100">
                                <Icon size={12} className="print:text-gray-800" /> <span className="text-[9px] uppercase font-bold print:text-gray-800">{slot.label.split(' ')[0]}</span>
                            </div>
                            {recipe && <p className="text-xs font-medium text-slate-200 line-clamp-2 leading-tight print:text-black">{recipe.name}</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center pt-6 print:hidden">
             <button onClick={() => setShowShoppingList(!showShoppingList)} className="flex items-center gap-2 bg-white text-slate-900 font-bold py-3 px-8 rounded-full shadow-xl hover:bg-slate-200 transition-all">
                <ShoppingCart className="w-5 h-5 text-teal-600" /> {showShoppingList ? 'Ocultar Lista' : 'Ver Lista de Compras'}
             </button>
          </div>
          
          {/* Lista de Compras (Siempre visible al imprimir si está abierta) */}
          <div className={showShoppingList ? 'block' : 'hidden print:block'}>
            <div className="mt-12 bg-white rounded-3xl p-1 shadow-2xl border-t-4 border-teal-500 print:shadow-none print:border-0">
                <ShoppingList mealPlan={weekPlan} />
            </div>
          </div>

        </div>
      )}
    </div>
  );
}