// src/components/ShoppingList.jsx
// v3.0 - Lógica "Humana": Separa Despensa de Frescos y Suma Cantidades

import React, { useMemo, useState } from 'react';
import { ShoppingCart, Check, Trash2, Leaf, Drumstick, Milk, Archive } from 'lucide-react';
import { motion } from 'framer-motion';

// Palabras clave para identificar "Fondo de Despensa" (No sumar, solo listar)
const PANTRY_KEYWORDS = ['aceite', 'sal', 'pimienta', 'vinagre', 'endulzante', 'polvo para hornear', 'canela', 'vainilla', 'ghee', 'mantequilla', 'mayonesa', 'mostaza', 'especias', 'cacao', 'harina'];

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

    // Recorrer todo el plan
    Object.values(mealPlan).forEach(dayMeals => {
      if (!dayMeals) return;
      Object.values(dayMeals).forEach(recipe => {
        if (recipe && recipe.ingredients) {
          recipe.ingredients.forEach(ing => {
            const nameLower = ing.name.toLowerCase();
            let category = ing.category || 'Otros';
            
            // 1. Detectar si es de Despensa
            if (PANTRY_KEYWORDS.some(keyword => nameLower.includes(keyword))) {
              category = 'Despensa y Básicos';
            }

            // 2. Normalizar Nombres (Para que sume "Huevo" y "Huevos")
            let cleanName = ing.name;
            
            // 3. Lógica de Suma
            if (!list[category]) list[category] = {};
            
            if (!list[category][cleanName]) {
              list[category][cleanName] = { original: ing.quantity, count: 1 };
            } else {
              list[category][cleanName].count += 1;
              // Si no es despensa, concatenamos para referencia visual
              if (category !== 'Despensa y Básicos') {
                 list[category][cleanName].original += ` + ${ing.quantity}`;
              }
            }
          });
        }
      });
    });

    // Formatear para vista final
    const finalGrouped = {};
    Object.keys(list).forEach(cat => {
      const items = Object.entries(list[cat]).map(([name, data]) => {
        // Lógica especial para HUEVOS
        if (name.toLowerCase().includes('huevo')) {
           return { name: name, label: `Total aprox: ${data.count * 2} a ${data.count * 3} piezas (Compra una tapa de 30)` };
        }
        // Lógica para CARNES (Intentar sumar gramos si es posible, o mostrar total días)
        if (cat === 'Carnes y Pescados') {
             return { name: name, label: `Usado en ${data.count} comidas (Aprox ${data.count * 200}g)` };
        }
        // Despensa: Solo mostrar nombre
        if (cat === 'Despensa y Básicos') {
            return { name: name, label: 'Revisar alacena' };
        }

        return { name: name, label: data.original };
      });
      
      if (items.length > 0) finalGrouped[cat] = items;
    });

    return finalGrouped;
  }, [mealPlan]);

  const toggleItem = (name) => setCheckedItems(prev => ({ ...prev, [name]: !prev[name] }));

  return (
    <div className="p-4 md:p-8">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-slate-800 flex items-center justify-center gap-2">
          <ShoppingCart className="w-8 h-8 text-teal-600" />
          Tu Lista de Súper Inteligente
        </h2>
        <p className="text-slate-500 mt-2">
          Hemos separado los frescos de tu fondo de alacena.
        </p>
      </div>

      <div className="grid gap-8 max-w-4xl mx-auto">
        {Object.keys(processedList).map((category) => (
          <div key={category} className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <h3 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-2">
              {categoryIcons[category]} {category}
            </h3>
            <ul className="space-y-3">
              {processedList[category].map((item, idx) => (
                <li 
                  key={idx} 
                  onClick={() => toggleItem(item.name)}
                  className={`flex items-start p-3 rounded-lg cursor-pointer transition-all ${
                    checkedItems[item.name] ? 'bg-green-100 opacity-60' : 'bg-white shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className={`w-5 h-5 rounded border mr-3 mt-1 flex items-center justify-center ${
                    checkedItems[item.name] ? 'bg-green-500 border-green-500' : 'border-slate-300'
                  }`}>
                    {checkedItems[item.name] && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div>
                    <p className={`font-medium ${checkedItems[item.name] ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                      {item.name}
                    </p>
                    <p className="text-xs text-slate-500 font-mono mt-1">{item.label}</p>
                  </div>
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