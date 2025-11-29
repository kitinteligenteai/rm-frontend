// src/pages/Planeador.jsx
// Interfaz Gráfica del Planeador Inteligente

import React, { useState } from 'react';
import { useSmartPlanner } from '../hooks/useSmartPlanner';
import { recipes } from '../data/recipes';
import ShoppingList from '../components/ShoppingList';
import { 
  RefreshCw, ShoppingCart, Utensils, 
  Coffee, Moon, Sun, Dumbbell, CheckCircle2
} from 'lucide-react';

const SlotIcons = {
  desayuno: Sun,
  comida: Utensils,
  cena: Moon,
  snack: Coffee
};

export default function Planeador() {
  const { 
    weekPlan, generateQuickMenu, updateSlot, calculateDailyStats, 
    activeTab, setActiveTab, days, slots 
  } = useSmartPlanner();

  const [selectedDaySlot, setSelectedDaySlot] = useState(null);
  const [showShoppingList, setShowShoppingList] = useState(false);

  // --- MODAL PARA SELECCIONAR RECETA ---
  const RecipeSelectorModal = () => {
    if (!selectedDaySlot) return null;
    
    const targetSlotConfig = slots.find(s => s.id === selectedDaySlot.slotId);
    // Filtramos recetas compatibles
    const compatibleRecipes = recipes.filter(r => targetSlotConfig.types.includes(r.type));

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl max-h-[80vh] rounded-2xl flex flex-col shadow-2xl">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-white">Cambiar {targetSlotConfig.label}</h3>
              <p className="text-sm text-slate-400">{selectedDaySlot.day}</p>
            </div>
            <button onClick={() => setSelectedDaySlot(null)} className="text-slate-400 hover:text-white text-2xl font-bold">&times;</button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Opción para quitar platillo */}
            <button 
                onClick={() => {
                  updateSlot(selectedDaySlot.day, selectedDaySlot.slotId, null);
                  setSelectedDaySlot(null);
                }}
                className="flex items-center justify-center p-4 rounded-xl border border-dashed border-slate-600 text-slate-400 hover:border-red-500 hover:text-red-500 transition-all"
            >
                Quitar Platillo (Dejar vacío)
            </button>

            {compatibleRecipes.map(recipe => (
              <button 
                key={recipe.id}
                onClick={() => {
                  updateSlot(selectedDaySlot.day, selectedDaySlot.slotId, recipe);
                  setSelectedDaySlot(null);
                }}
                className="flex items-center gap-3 p-2 rounded-xl bg-slate-800 hover:bg-teal-500/10 hover:border-teal-500 border border-transparent transition-all text-left group"
              >
                <img src={recipe.imageUrl} alt={recipe.name} className="w-14 h-14 rounded-lg object-cover bg-slate-700" />
                <div>
                  <p className="font-bold text-slate-200 text-sm group-hover:text-teal-400 line-clamp-2">{recipe.name}</p>
                  <p className="text-xs text-slate-500 mt-1">{recipe.proteina_aprox_g}g Proteína</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto pb-24 animate-in fade-in duration-500">
      {selectedDaySlot && <RecipeSelectorModal />}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Planeador Inteligente</h1>
          <p className="text-slate-400 text-sm md:text-base max-w-xl">
            Tu nutricionista personal. Genera un menú balanceado al instante o personaliza cada detalle según tus gustos.
          </p>
        </div>

        {/* Switcher */}
        <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button 
            onClick={() => setActiveTab('rapido')}
            className={`px-4 md:px-6 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${activeTab === 'rapido' ? 'bg-teal-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            Automático
          </button>
          <button 
            onClick={() => setActiveTab('experto')}
            className={`px-4 md:px-6 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${activeTab === 'experto' ? 'bg-teal-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            Manual (Experto)
          </button>
        </div>
      </div>

      {/* --- VISTA AUTOMÁTICA (Simple) --- */}
      {activeTab === 'rapido' && (
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <RefreshCw className="w-8 h-8 text-teal-400" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Menú Balanceado en 1 Clic</h2>
            <p className="text-slate-300 text-sm md:text-base mb-8">
              Utilizamos nuestra base de datos de 60+ recetas para crear una semana perfecta que cumple con el requerimiento proteico y de vegetales.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={generateQuickMenu}
                className="bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold py-3 px-6 rounded-xl shadow-lg shadow-teal-500/20 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Generar Nuevo Menú
              </button>
              <button 
                onClick={() => setShowShoppingList(!showShoppingList)}
                className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                {showShoppingList ? 'Ocultar Lista' : 'Ver Lista de Compras'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- VISTA EXPERTO (Grilla Semanal) --- */}
      {activeTab === 'experto' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Tip Sarcopenia */}
          <div className="bg-indigo-900/20 border border-indigo-500/30 p-4 rounded-xl flex gap-4 items-start">
            <div className="p-2 bg-indigo-500/20 rounded-lg mt-1 shrink-0">
              <Dumbbell className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h4 className="text-indigo-300 font-bold text-sm">Protege tu Músculo</h4>
              <p className="text-indigo-200/80 text-xs mt-1 leading-relaxed">
                La barra debajo de cada día te indica cuánta proteína estás consumiendo. 
                Tu meta es mantenerla en <span className="text-emerald-400 font-bold">Verde (+90g)</span> para evitar perder masa muscular.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            {days.map((day) => {
              const dailyProtein = calculateDailyStats(day);
              
              // Lógica del Semáforo
              let proteinColor = "bg-red-500";
              let proteinText = "Bajo";
              if (dailyProtein > 60) { proteinColor = "bg-yellow-500"; proteinText = "Medio"; }
              if (dailyProtein > 90) { proteinColor = "bg-emerald-500"; proteinText = "Óptimo"; }

              return (
                <div key={day} className="bg-slate-800/40 border border-slate-700 rounded-xl overflow-hidden flex flex-col hover:border-slate-600 transition-colors">
                  {/* Header Día */}
                  <div className="p-3 bg-slate-800 border-b border-slate-700">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold text-white text-sm">{day}</h3>
                      <span className="text-[10px] text-slate-400 font-mono">{dailyProtein}g</span>
                    </div>
                    {/* Barra de Progreso */}
                    <