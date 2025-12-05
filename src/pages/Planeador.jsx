// src/pages/Planeador.jsx (v8.0 - Guía Visual Restaurada y Optimizada)
import React, { useState } from 'react';
import { useSmartPlanner } from '../hooks/useSmartPlanner';
import { recipes } from '../data/recipes';
import ShoppingList from '../components/ShoppingList';
import RecipeDetailModal from '../components/planner/RecipeDetailModal';
import { 
  ShoppingCart, Sun, Moon, Coffee, Utensils, 
  Dumbbell, Dice5, XCircle, CheckCircle, Printer, Zap 
} from 'lucide-react';

const SlotIcons = { desayuno: Sun, comida: Utensils, cena: Moon, snack: Coffee };

// --- COMPONENTE: ESTRATEGIA VISUAL (LO QUE FALTABA) ---
const QuickStrategyVisual = () => (
  <div className="mb-8">
    <div className="bg-gradient-to-r from-indigo-900/80 to-slate-900 border border-indigo-500/30 p-6 rounded-3xl text-center print:bg-white print:border-0 print:p-0 print:text-left">
      <h2 className="text-2xl font-bold text-white mb-2 print:text-black print:text-xl">Estrategia de Supervivencia</h2>
      <p className="text-indigo-200 max-w-2xl mx-auto text-base leading-relaxed mb-6 print:text-gray-600 print:mx-0">
        Si no tienes tiempo de cocinar recetas complejas, usa esta fórmula base para salvar la semana:
      </p>
      
      <div className="grid md:grid-cols-3 gap-4 text-left">
        {/* Desayuno */}
        <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 print:border-gray-300 print:bg-gray-50">
          <div className="flex items-center gap-2 mb-2 text-yellow-400 font-bold print:text-black">
            <Sun size={18} /> Desayuno
          </div>
          <p className="text-slate-300 text-sm print:text-gray-800">
            <strong>Opción A:</strong> Huevos al gusto (2-3) con verduras (espinacas/nopales).<br/>
            <strong>Opción B:</strong> Batido de Proteína (1 scoop + fresas + nueces).
          </p>
        </div>

        {/* Comida */}
        <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 print:border-gray-300 print:bg-gray-50">
          <div className="flex items-center gap-2 mb-2 text-teal-400 font-bold print:text-black">
            <Utensils size={18} /> Comida Fuerte
          </div>
          <p className="text-slate-300 text-sm print:text-gray-800">
            Elige una proteína asada (200g de Pollo, Res o Pescado) + <br/>
            Montaña de Verduras (frescas o congeladas) + <br/>
            Grasa buena (Aguacate o Aceite de Oliva).
          </p>
        </div>

        {/* Cena */}
        <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 print:border-gray-300 print:bg-gray-50">
          <div className="flex items-center gap-2 mb-2 text-indigo-400 font-bold print:text-black">
            <Moon size={18} /> Cena Ligera
          </div>
          <p className="text-slate-300 text-sm print:text-gray-800">
            Repite la opción del desayuno (Huevos/Batido) o algo ligero como:<br/>
            Atún en agua con ensalada o Tostadas de pollo.<br/>
            <span className="text-slate-500 italic print:text-gray-500 text-xs mt-1 block">Antojo: Gelatina light o Puñado de nueces.</span>
          </p>
        </div>
      </div>
    </div>
  </div>
);

// --- LISTA GENÉRICA ---
const GenericShoppingList = () => (
  <div className="bg-white p-6 rounded-2xl shadow-xl border-t-4 border-indigo-500 print:border-0 print:shadow-none print:p-0 print:mt-6">
    <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
      <ShoppingCart className="w-5 h-5 text-indigo-600" /> Lista de Compras Básica
    </h3>
    <div className="grid md:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4">
      <div>
        <h4 className="font-bold text-teal-700 text-sm mb-2 uppercase tracking-wider">Proteínas (Base)</h4>
        <ul className="space-y-2 text-sm text-slate-700">
          <li className="flex items-center gap-2"><CheckCircle size={14} className="text-teal-500"/> Huevos (30 pzas)</li>
          <li className="flex items-center gap-2"><CheckCircle size={14} className="text-teal-500"/> Atún en agua (5 latas)</li>
          <li className="flex items-center gap-2"><CheckCircle size={14} className="text-teal-500"/> Pechuga de Pollo (1 kg)</li>
          <li className="flex items-center gap-2"><CheckCircle size={14} className="text-teal-500"/> Carne Molida / Bistec (1 kg)</li>
          <li className="flex items-center gap-2"><CheckCircle size={14} className="text-teal-500"/> Proteína en Polvo (Sin azúcar)</li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold text-green-700 text-sm mb-2 uppercase tracking-wider">Vegetales y Grasas</h4>
        <ul className="space-y-2 text-sm text-slate-700">
          <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500"/> Mix de Verduras Congeladas</li>
          <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500"/> Espinacas y Nopales</li>
          <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500"/> Aguacates (5-7 pzas)</li>
          <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500"/> Nueces / Almendras</li>
          <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500"/> Aceite de Oliva / Ghee / Manteca</li>
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
                <div><p className="font-bold text-slate-200 text-sm group-hover:text-teal-400 line-clamp-2">{recipe.name}</p><p className="text-xs text-slate-500 mt-1">{recipe.proteina_aprox_g}g Prot.</p></div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-full mx-auto pb-24 animate-in fade-in duration-500 print:p-8 print:bg-white">
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
                <Printer className="w-4 h-4" /> Imprimir
            </button>
            <div className="bg-slate-800 p-1 rounded-xl flex border border-slate-700">
            <button onClick={() => setActiveTab('gusto')} className={`px-4 py-2 rounded-lg text-sm font-bold ${activeTab === 'gusto' ? 'bg-teal-600 text-white' : 'text-slate-400'}`}>A mi Gusto</button>
            <button onClick={() => setActiveTab('rapido')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 ${activeTab === 'rapido' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}> <Zap size={14}/> Modo Prisa</button>
            </div>
        </div>
      </div>

      {/* HEADER IMPRESIÓN */}
      <div className="hidden print:block mb-6 text-center border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-black">Mi Plan Semanal - Reinicio Metabólico</h1>
        <p className="text-sm text-gray-600">Enfoque: 50% Vegetales | 25% Proteína | 25% Grasa</p>
      </div>

      {/* --- MODO PRISA --- */}
      {activeTab === 'rapido' && (
        <div className="space-y-8">
          {/* AQUÍ ESTÁ LA GUÍA VISUAL RESTAURADA */}
          <QuickStrategyVisual />
          <GenericShoppingList />
        </div>
      )}

      {/* --- MODO A MI GUSTO --- */}
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