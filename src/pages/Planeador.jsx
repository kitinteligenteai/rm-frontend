// src/pages/Planeador.jsx (v5.0 - FINAL PREMIUM)
import React, { useState } from 'react';
import { useSmartPlanner } from '../hooks/useSmartPlanner';
import { recipes } from '../data/recipes';
import ShoppingList from '../components/ShoppingList';
import RecipeDetailModal from '../components/planner/RecipeDetailModal'; // IMPORTANTE
import { 
  RefreshCw, ShoppingCart, Sun, Moon, Coffee, Utensils, 
  Info, Repeat, CheckCircle2
} from 'lucide-react';

const SlotIcons = { desayuno: Sun, comida: Utensils, cena: Moon, snack: Coffee };

export default function Planeador() {
  const { 
    weekPlan, generateQuickMenu, updateSlot, calculateDailyStats, 
    days, slots 
  } = useSmartPlanner();

  const [activeTab, setActiveTab] = useState('gusto'); // 'rapido' | 'gusto'
  const [showList, setShowList] = useState(false);
  
  // Estados para Modales
  const [viewingRecipe, setViewingRecipe] = useState(null); // Para VER detalles
  const [swappingSlot, setSwappingSlot] = useState(null);   // Para CAMBIAR receta

  // --- COMPONENTE: MODAL CAMBIO DE RECETA ---
  const SwapModal = () => {
    if (!swappingSlot) return null;
    const config = slots.find(s => s.id === swappingSlot.slotId);
    const options = recipes.filter(r => config.types.includes(r.type));

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm animate-in fade-in">
        <div className="bg-slate-900 w-full max-w-2xl max-h-[80vh] rounded-2xl border border-slate-700 flex flex-col">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-white">Cambiar {config.label} ({swappingSlot.day})</h3>
            <button onClick={() => setSwappingSlot(null)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
          </div>
          <div className="overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button onClick={() => { updateSlot(swappingSlot.day, swappingSlot.slotId, null); setSwappingSlot(null); }} className="p-3 border border-dashed border-red-500/50 text-red-400 rounded-xl hover:bg-red-900/20 text-center">
              Dejar Vacío (Ayuno)
            </button>
            {options.map(r => (
              <button key={r.id} onClick={() => { updateSlot(swappingSlot.day, swappingSlot.slotId, r); setSwappingSlot(null); }} className="flex gap-3 p-2 rounded-xl bg-slate-800 hover:border-teal-500 border border-transparent text-left group">
                <img src={r.imageUrl} className="w-16 h-16 rounded-lg object-cover bg-slate-700" alt="" />
                <div>
                  <p className="font-bold text-slate-200 text-sm group-hover:text-teal-400 line-clamp-2">{r.name}</p>
                  <p className="text-xs text-slate-500">{r.proteina_aprox_g}g Prot.</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 pb-24 max-w-full mx-auto animate-in fade-in">
      {swappingSlot && <SwapModal />}
      {viewingRecipe && <RecipeDetailModal recipe={viewingRecipe} isOpen={true} onClose={() => setViewingRecipe(null)} />}

      {/* HEADER & TABS */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Planeador Semanal</h1>
          <p className="text-slate-400 text-sm">Elige cómo quieres comer esta semana.</p>
        </div>
        <div className="bg-slate-800 p-1 rounded-xl flex">
          <button onClick={() => setActiveTab('rapido')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'rapido' ? 'bg-teal-500 text-white' : 'text-slate-400'}`}>Modo Prisa</button>
          <button onClick={() => setActiveTab('gusto')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'gusto' ? 'bg-teal-500 text-white' : 'text-slate-400'}`}>A mi Gusto</button>
        </div>
      </div>

      {/* --- MODO PRISA (Explicativo) --- */}
      {activeTab === 'rapido' && (
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 p-8 rounded-3xl border border-indigo-500/30 text-center shadow-2xl">
          <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-400"><RefreshCw size={32} /></div>
          <h2 className="text-2xl font-bold text-white mb-2">¿Semana Complicada?</h2>
          <p className="text-slate-300 max-w-lg mx-auto mb-8">
            No te compliques. Generamos un menú base balanceado al instante. 
            Si no te gusta algo, cámbialo individualmente después.
          </p>
          <button onClick={() => { generateQuickMenu(); setActiveTab('gusto'); }} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:scale-105 transition-transform">
            ✨ Generar Menú Automático
          </button>
        </div>
      )}

      {/* --- MODO A MI GUSTO (Grid) --- */}
      {activeTab === 'gusto' && (
        <div className="space-y-8">
          {/* Grid Semanal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
            {days.map(day => {
              const protein = calculateDailyStats(day);
              const statusColor = protein > 90 ? 'bg-emerald-500' : protein > 60 ? 'bg-yellow-500' : 'bg-red-500';
              
              return (
                <div key={day} className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden flex flex-col min-w-[200px]">
                  <div className="p-3 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
                    <span className="font-bold text-white">{day}</span>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400">{protein}g Prot.</span>
                      <div className="w-16 h-1 bg-slate-700 rounded-full mt-1 overflow-hidden"><div className={`h-full ${statusColor}`} style={{width: `${Math.min(protein, 120)/1.2}%`}} /></div>
                    </div>
                  </div>
                  
                  <div className="p-2 space-y-2 flex-1">
                    {slots.map(slot => {
                      const recipe = weekPlan[day]?.[slot.id];
                      const Icon = SlotIcons[slot.id];
                      return (
                        <div key={slot.id} className="group relative">
                          {/* Botón Cambio (Aparece en Hover) */}
                          <button 
                            onClick={(e) => { e.stopPropagation(); setSwappingSlot({ day, slotId: slot.id }); }}
                            className="absolute -top-2 -right-2 z-10 bg-slate-700 text-white p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all hover:bg-teal-500"
                            title="Cambiar platillo"
                          >
                            <Repeat size={12} />
                          </button>

                          <div 
                            onClick={() => recipe ? setViewingRecipe(recipe) : setSwappingSlot({ day, slotId: slot.id })}
                            className={`p-3 rounded-lg border cursor-pointer min-h-[80px] flex flex-col justify-center transition-colors
                              ${recipe ? 'bg-slate-700/40 border-slate-600 hover:border-teal-500' : 'bg-slate-800/30 border-dashed border-slate-700 hover:bg-slate-800'}`}
                          >
                            <div className="flex items-center gap-2 mb-1 opacity-50">
                              <Icon size={12} /> <span className="text-[10px] uppercase font-bold">{slot.label.split(' ')[0]}</span>
                            </div>
                            {recipe ? (
                              <div className="flex gap-2 items-center">
                                {recipe.imageUrl && <img src={recipe.imageUrl} className="w-8 h-8 rounded object-cover bg-slate-900" alt="" />}
                                <p className="text-xs font-medium text-slate-200 leading-tight line-clamp-2">{recipe.name}</p>
                              </div>
                            ) : (
                              <div className="text-center text-slate-500 text-xs py-1">+ Agregar</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center pt-6">
            <button onClick={() => setShowList(!showList)} className="flex items-center gap-2 bg-white text-slate-900 font-bold py-3 px-8 rounded-full shadow-xl hover:bg-slate-200 transition-all">
              <ShoppingCart className="w-5 h-5" /> {showList ? 'Ocultar Lista' : 'Generar Lista de Compras'}
            </button>
          </div>
        </div>
      )}

      {/* Lista de Compras */}
      {showList && (
        <div className="mt-12 animate-in slide-in-from-bottom-10 fade-in">
          <div className="bg-white rounded-3xl p-1 shadow-2xl border-t-4 border-teal-500">
            <ShoppingList mealPlan={weekPlan} />
          </div>
        </div>
      )}
    </div>
  );
}