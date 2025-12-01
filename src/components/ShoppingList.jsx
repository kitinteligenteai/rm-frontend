// src/components/ShoppingList.jsx (v3.1 - Lógica de Suma Mejorada)
import React, { useMemo, useState } from 'react';
import { ShoppingCart, Check, Trash2, Leaf, Drumstick, Milk, Archive } from 'lucide-react';
import { motion } from 'framer-motion';

const PANTRY_KEYWORDS = ['aceite', 'sal', 'pimienta', 'vinagre', 'endulzante', 'polvo para hornear', 'canela', 'vainilla', 'ghee', 'mantequilla', 'mayonesa', 'mostaza', 'especias', 'cacao', 'harina', 'ajo'];

const categoryIcons = {
  'Frutas y Verduras': <Leaf size={20} className="text-green-600" />,
  'Carnes y Pescados': <Drumstick size={20} className="text-red-500" />,
  'Lácteos y Huevos': <Milk size={20} className="text-blue-500" />,
  'Despensa y Básicos': <Archive size={20} className="text-amber-600" />,
  'Otros': <ShoppingCart size={20} className="text-neutral-500" />,
};

const ShoppingList = ({ mealPlan }) => {
  const [checkedItems, setCheckedItems] = useState({});

  const processedList = useMemo(() => {
    if (!mealPlan) return {};
    const list = {
      'Carnes y Pescados': {},
      'Frutas y Verduras': {},
      'Lácteos y Huevos': {},
      'Despensa y Básicos': {},
      'Otros': {}
    };

    Object.values(mealPlan).forEach(dayMeals => {
      if (!dayMeals) return;
      Object.values(dayMeals).forEach(recipe => {
        if (recipe && recipe.ingredients) {
          recipe.ingredients.forEach(ing => {
            let nameLower = ing.name.toLowerCase();
            let category = ing.category || 'Otros';
            let cleanName = ing.name;

            // 1. UNIFICAR HUEVOS (Lo más importante)
            if (nameLower.includes('huevo') || nameLower.includes('yema') || nameLower.includes('clara')) {
                cleanName = "Huevos";
                category = 'Lácteos y Huevos';
            }

            // 2. Mover a Despensa si es básico
            if (PANTRY_KEYWORDS.some(k => nameLower.includes(k)) && category !== 'Lácteos y Huevos') {
              category = 'Despensa y Básicos';
            }

            if (!list[category]) list[category] = {};

            if (!list[category][cleanName]) {
              list[category][cleanName] = { count: 1 };
            } else {
              list[category][cleanName].count += 1;
            }
          });
        }
      });
    });

    const finalGrouped = {};
    Object.keys(list).forEach(cat => {
      const items = Object.entries(list[cat]).map(([name, data]) => {
        // Lógica Humana de Cantidades
        let label = `Usado en ${data.count} recetas`;

        if (name === "Huevos") {
           const totalHuevos = data.count * 2; // Promedio 2 por receta
           label = totalHuevos > 15 ? "Compra una tapa de 30" : "Compra una docena (12-18 pzas)";
        }
        else if (cat === 'Carnes y Pescados') {
             label = `Total aprox: ${data.count * 200}g`;
        }
        else if (cat === 'Despensa y Básicos') {
            label = "Verificar existencias";
        }

        return { name, label };
      });
      
      if (items.length > 0) finalGrouped[cat] = items;
    });

    return finalGrouped;
  }, [mealPlan]);

  const toggleItem = (name) => setCheckedItems(prev => ({ ...prev, [name]: !prev[name] }));

  return (
    <div className="p-4 md:p-8 bg-slate-50 rounded-3xl">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center justify-center gap-2">
          <ShoppingCart className="w-6 h-6 text-teal-600" />
          Lista de Compras Inteligente
        </h2>
      </div>

      <div className="grid gap-6">
        {Object.keys(processedList).map((category) => (
          <div key={category} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-700 mb-3 flex items-center gap-2">
              {categoryIcons[category]} {category}
            </h3>
            <ul className="space-y-2">
              {processedList[category].map((item, idx) => (
                <li 
                  key={idx} 
                  onClick={() => toggleItem(item.name)}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                    checkedItems[item.name] ? 'opacity-40' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                      checkedItems[item.name] ? 'bg-teal-500 border-teal-500' : 'border-slate-300'
                    }`}>
                      {checkedItems[item.name] && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className={`font-medium ${checkedItems[item.name] ? 'line-through' : 'text-slate-700'}`}>
                      {item.name}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono bg-slate-100 px-2 py-1 rounded">{item.label}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShoppingList;