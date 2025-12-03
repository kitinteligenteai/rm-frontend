// src/pages/Planeador.jsx (v6.0 - Estrategia Prisa vs Gusto Definitiva)
import React, { useState } from 'react';
import { useSmartPlanner } from '../hooks/useSmartPlanner';
import { recipes } from '../data/recipes';
import ShoppingList from '../components/ShoppingList';
import RecipeDetailModal from '../components/planner/RecipeDetailModal';
import { 
  ShoppingCart, Sun, Moon, Coffee, Utensils, 
  Dumbbell, Dice5, XCircle, CheckCircle, List
} from 'lucide-react';

const SlotIcons = { desayuno: Sun, comida: Utensils, cena: Moon, snack: Coffee };

// --- LISTA GENÉRICA DE SÚPER (Modo Prisa) ---
const GenericShoppingList = () => (
  <div className="bg-white p-6 rounded-2xl shadow-xl border-t-4 border-indigo-500">
    <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
      <ShoppingCart className="w-5 h-5 text-indigo-600" /> Lista de Supervivencia
    </h3>
    <p className="text-slate-500 text-sm mb-6">Lo básico para sobrevivir la semana sin cocinar complicado.</p>
    
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <h4 className="font-bold text-teal-700 text-sm mb-2 uppercase tracking-wider">Proteínas (Base)</h4>
        <ul className="space-y-2 text-sm text-slate-700">
          <li className="flex items-center gap-2"><CheckCircle size={14} className="text-teal-500"/> Huevos (30 pzas)</li>
          <li className="flex items-center gap-2"><CheckCircle size={14} className="text-teal-500"/> Atún en agua (5-6 latas)</li>
          <li className="flex items-center gap-2"><CheckCircle size={14} className="text-teal-500"/> Pechuga de Pollo / Carne (1 kg c/u)</li>
          <li className="flex items-center gap-2"><CheckCircle size={14} className="text-teal-500"/> Proteína en Polvo (Vainilla/Natural)</li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold text-green-700 text-sm mb-2 uppercase tracking-wider">Vegetales y Grasas</h4>
        <ul className="space-y-2 text-sm text-slate-700">
          <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500"/> Bolsas de Verduras Congeladas (Práctico)</li>
          <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500"/> Espinacas / Lechuga (Listas para comer)</li>
          <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500"/> Aguacates (5-7 piezas)</li>
          <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500"/> Nueces / Almendras (Bolsa grande)</li>
        </ul>
      </div>
    </div>
  </div>
);

export default function Planeador() {
  const { 
    weekPlan, updateSlot, shuffleSlot, calculateDailyStats, days, slots 
  } = useSmartPlanner();

  const [activeTab, setActiveTab] = useState('rapido'); // 'rapido' (Guía) | 'gusto' (Interactivo)
  
  // Estados para Modales
  const [viewingRecipe, setViewingRecipe] = useState(null);
  const [selectedDaySlot, setSelectedDaySlot] = useState(null); // Para cambiar receta
  const [showFullList, setShowFullList] = useState(false); // Lista del modo experto

  // Modal Selección (Modo Experto)
  const RecipeSelectorModal = () => {
    if (!selectedDaySlot) return null;
    const targetSlotConfig = slots.find(s => s.id === selectedDaySlot.slotId);
    const compatibleRecipes = recipes.filter(r => targetSlotConfig.types.includes(r.type));

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
        <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl max-h-[80vh] rounded-2xl flex flex-col shadow-2xl">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <h3 className="text-xl font-bold text-white">Elegir {targetSlotConfig.label}</h3>
            <button onClick={() => setSelectedDaySlot(null)} className="text-slate-400 hover:text-white text-2xl font-bold">&times;</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button onClick={() => { updateSlot(selectedDaySlot.day, selectedDaySlot.slotId, null); setSelectedDaySlot(null); }} className="flex items-center justify-center p-4 rounded-xl border border-dashed border-red-500/50 text-red-400 hover:bg-red-500/10 transition-all">
                <XCircle className="w-5 h-5 mr-2" /> Dejar Vacío
            </button>
            {compatibleRecipes.map(recipe => (
              <button key={recipe.id} onClick={() => { updateSlot(selectedDaySlot.day, selectedDaySlot.slotId, recipe); setSelectedDaySlot(null); }} className="flex items-center gap-3 p-2 rounded-xl bg-slate-800 hover:bg-teal-500/10 border border-transparent hover:border-teal-500 text-left group">
                <img src={recipe.imageUrl} alt={recipe.name} className="w-14 h-14 rounded-lg object-cover bg-slate-700" />
                <div>
                  <p className="font-bold text-slate-200 text-sm group-hover:text-teal-400 line-clamp-2">{recipe.name}</p>
                  <p className="text-xs text-slate-500 mt-1">{recipe.proteina_aprox_g}g Prot.</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-full mx-auto pb-24 animate-in fade-in duration-500">
      {/* Modales */}
      {selectedDaySlot && <RecipeSelectorModal />}
      {viewingRecipe && <RecipeDetailModal recipe={viewingRecipe} isOpen={true} onClose={() => setViewingRecipe(null)} />}

      {/* HEADER & TABS */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Planeador Semanal</h1>
          <p className="text-slate-400 text-sm">Elige tu estrategia para esta semana.</p>
        </div>
        <div className="bg-slate-800 p-1 rounded-xl flex border border-slate-700">
          <button onClick={() => setActiveTab('rapido')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'rapido' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
            Modo Prisa ⚡
          </button>
          <button onClick={() => setActiveTab('gusto')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'gusto' ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
            A mi Gusto 🎨
          </button>
        </div>
      </div>

      {/* --- MODO PRISA (La Guía Simple) --- */}
      {activeTab === 'rapido' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4">
          <div className="bg-gradient-to-r from-indigo-900/80 to-slate-900 border border-indigo-500/30 p-8 rounded-3xl text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Estrategia de Supervivencia</h2>
            <p className="text-indigo-200 max-w-2xl mx-auto text-lg leading-relaxed">
              Si no tienes tiempo de cocinar, sigue esta fórmula simple. 
              No necesitas recetas complejas, solo <strong>ensamblar</strong> ingredientes.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mt-8 text-left">
              <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700">
                <div className="flex items-center gap-2 mb-3 text-yellow-400 font-bold"><Sun /> Desayuno</div>
                <p className="text-slate-300 text-sm">Huevos al gusto con verduras <br/><span className="text-slate-500 italic">o</span><br/> Batido de Proteína (1 scoop + fresas + nueces).</p>
              </div>
              <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700">
                <div className="flex items-center gap-2 mb-3 text-teal-400 font-bold"><Utensils /> Comida</div>
                <p className="text-slate-300 text-sm">Proteína asada (Pollo/Res/Pescado) <br/>+<br/> Montaña de Verduras (frescas o congeladas) + Aguacate.</p>
              </div>
              <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700">
                <div className="flex items-center gap-2 mb-3 text-indigo-400 font-bold"><Moon /> Cena</div>
                <p className="text-slate-300 text-sm">Algo ligero: Atún, Ensalada con pollo, o repetir el desayuno (huevos). <br/><span className="text-slate-500 italic">Antojo: Gelatina light o Nueces.</span></p>
              </div>
            </div>
          </div>

          {/* Lista Genérica */}
          <GenericShoppingList />
        </div>
      )}

      {/* --- MODO A MI GUSTO (Grid Interactivo) --- */}
      {activeTab === 'gusto' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4">
          
          <div className="flex justify-between items-center bg-slate-800/50 p-4 rounded-xl border border-slate-700">
             <div className="flex gap-3 items-center">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400"><Dumbbell size={20}/></div>
                <p className="text-sm text-slate-300">Meta: <span className="text-emerald-400 font-bold">+90g Proteína</span></p>
             </div>
             <button onClick={() => setShowFullList(!showFullList)} className="flex items-center gap-2 bg-white text-slate-900 px-4 py-2 rounded-lg text-sm font-bold shadow-lg hover:bg-slate-200 transition-colors">
                <ShoppingCart size={16}/> {showFullList ? 'Ocultar Lista' : 'Ver Lista Exacta'}
             </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3 overflow-x-auto pb-4">
            {days.map((day) => {
              const dailyProtein = calculateDailyStats(day);
              let proteinColor = "bg-red-500";
              if (dailyProtein > 60) proteinColor = "bg-yellow-500";
              if (dailyProtein > 90) proteinColor = "bg-emerald-500";

              return (
                <div key={day} className="min-w-[180px] lg:min-w-0 bg-slate-800/40 border border-slate-700 rounded-xl overflow-hidden flex flex-col hover:border-slate-600 transition-colors">
                  <div className="p-3 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
                    <span className="font-bold text-white text-sm">{day}</span>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400">{dailyProtein}g</span>
                      <div className="w-12 h-1 bg-slate-700 rounded-full mt-1 overflow-hidden"><div className={`h-full ${proteinColor}`} style={{width: `${Math.min(dailyProtein, 120)/1.2}%`}} /></div>
                    </div>
                  </div>
                  
                  <div className="p-2 space-y-2 flex-1">
                    {slots.map(slot => {
                      const recipe = weekPlan[day]?.[slot.id];
                      const Icon = SlotIcons[slot.id];
                      return (
                        <div key={slot.id} className="group relative">
                          {/* Botón Shuffle */}
                          <button 
                             onClick={(e) => { e.stopPropagation(); shuffleSlot(day, slot.id); }}
                             className="absolute right-1 top-1 z-10 p-1 bg-slate-900/80 rounded text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-white shadow-sm border border-slate-600"
                             title="Cambiar al azar"
                           >
                             <Dice5 className="w-3 h-3" />
                           </button>

                          <div 
                            onClick={() => recipe ? setViewingRecipe(recipe) : setSelectedDaySlot({ day, slotId: slot.id })}
                            className={`p-3 rounded-lg border cursor-pointer min-h-[70px] flex flex-col justify-center relative transition-all
                              ${recipe ? 'bg-slate-700/40 border-slate-600 hover:border-teal-500' : 'bg-slate-800/30 border-dashed border-slate-700 hover:bg-slate-800'}`}
                          >
                            <div className="flex items-center gap-2 mb-1 opacity-60">
                                <Icon size={12} /> <span className="text-[9px] uppercase font-bold">{slot.label.split(' ')[0]}</span>
                            </div>
                            
                            {recipe ? (
                                <div className="flex gap-2 items-start">
                                  {recipe.imageUrl && <img src={recipe.imageUrl} className="w-8 h-8 rounded object-cover bg-slate-900 shrink-0" alt="" />}
                                  <p className="text-xs font-medium text-slate-200 leading-tight line-clamp-2">{recipe.name}</p>
                                </div>
                            ) : (
                                <div className="text-center text-slate-600 text-xs">+</div>
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

          {showFullList && (
            <div className="mt-12 animate-in slide-in-from-bottom-10 fade-in">
               <div className="bg-white rounded-3xl p-1 shadow-2xl border-t-4 border-teal-500">
                 <ShoppingList mealPlan={weekPlan} />
               </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}