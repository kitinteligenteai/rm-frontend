// src/components/ShoppingList.jsx (VERSIÓN FINAL CON ESTÉTICA "LUJO TERRENAL")
import React, { useMemo, useState } from 'react';
import { ShoppingCart, Check, Trash2, Leaf, Drumstick, Milk } from 'lucide-react';
import { motion } from 'framer-motion';

// Íconos para las categorías
const categoryIcons = {
  'Frutas y Verduras': <Leaf size={20} className="text-primary-600" />,
  'Carnes y Pescados': <Drumstick size={20} className="text-red-500" />,
  'Lácteos y Huevos': <Milk size={20} className="text-blue-500" />,
  'Despensa': <ShoppingCart size={20} className="text-amber-600" />,
  'Otros': <ShoppingCart size={20} className="text-neutral-500" />,
};

const ShoppingList = ({ mealPlan }) => {
  const [checkedItems, setCheckedItems] = useState({});

  const groupedList = useMemo(() => {
    if (!mealPlan) return {};
    const ingredientsMap = new Map();

    Object.values(mealPlan).forEach(dailyMeals => {
      if(!dailyMeals) return;
      Object.values(dailyMeals).forEach(recipe => {
        if (recipe && recipe.ingredients) {
          recipe.ingredients.forEach(ing => {
            if (!ing || !ing.name) return;
            const key = ing.name.toLowerCase().trim();
            const quantity = ing.quantity;
            const category = ing.category || 'Otros';

            if (ingredientsMap.has(key)) {
              ingredientsMap.get(key).quantities.push(quantity);
            } else {
              ingredientsMap.set(key, { name: ing.name, quantities: [quantity], category });
            }
          });
        }
      });
    });

    const grouped = {};
    ingredientsMap.forEach(item => {
      if (!grouped[item.category]) grouped[item.category] = [];
      grouped[item.category].push(item);
    });

    for (const category in grouped) {
      grouped[category].sort((a, b) => a.name.localeCompare(b.name));
    }
    
    return grouped;
  }, [mealPlan]);

  const toggleItem = (itemName) => {
    setCheckedItems(prev => ({ ...prev, [itemName]: !prev[itemName] }));
  };

  const clearChecked = () => setCheckedItems({});

  const categories = Object.keys(groupedList).sort();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <motion.header 
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="font-display text-display text-neutral-800 mb-4 flex items-center justify-center gap-3">
          <ShoppingCart className="w-10 h-10 text-primary-600" />
          Lista de Súper
        </h1>
        <p className="text-subtitle text-neutral-600">
          Generada y organizada a partir de tu plan semanal.
        </p>
      </motion.header>

      {categories.length > 0 ? (
        <div className="max-w-3xl mx-auto">
          <div className="text-right mb-6">
            <button onClick={clearChecked} className="text-sm flex items-center gap-2 ml-auto text-neutral-500 hover:text-primary-600 transition-colors">
              <Trash2 className="w-4 h-4" />
              Limpiar Selección
            </button>
          </div>
          <div className="space-y-8">
            {categories.map((category, catIndex) => (
              <motion.div 
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: catIndex * 0.1 }}
              >
                <h2 className="text-2xl font-display font-medium text-primary-700 mb-4 flex items-center gap-3 border-b-2 border-neutral-200 pb-2">
                  {categoryIcons[category] || categoryIcons['Otros']}
                  {category}
                </h2>
                <ul className="space-y-3">
                  {groupedList[category].map((item, itemIndex) => {
                    const isChecked = checkedItems[item.name] || false;
                    return (
                      <motion.li
                        key={item.name}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: itemIndex * 0.02 }}
                        onClick={() => toggleItem(item.name)}
                        className={`flex items-center p-4 rounded-xl cursor-pointer transition-all duration-200 shadow-soft
                          ${isChecked 
                            ? 'bg-green-100/50 text-neutral-500' 
                            : 'bg-white hover:bg-neutral-50'
                          }`}
                      >
                        <div className={`w-6 h-6 mr-4 flex-shrink-0 rounded-md flex items-center justify-center border-2 transition-all
                          ${isChecked ? 'bg-green-500 border-green-500' : 'border-neutral-300 bg-neutral-100'}`}>
                          {isChecked && <Check className="w-4 h-4 text-white" />}
                        </div>
                        <div className={`flex-grow ${isChecked ? 'line-through' : ''}`}>
                          <p className="font-medium text-lg capitalize text-neutral-800">{item.name}</p>
                          <p className="text-caption text-neutral-600">{item.quantities.join(' + ')}</p>
                        </div>
                      </motion.li>
                    );
                  })}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-center mt-10 p-10 border-2 border-dashed border-neutral-200 rounded-2xl max-w-2xl mx-auto bg-white/50">
          <h2 className="font-display text-title">Tu lista está vacía.</h2>
          <p className="text-body text-neutral-600 mt-2">
            Genera un plan en la sección <span className="font-semibold text-primary-600">Planeador</span> para ver tus compras aquí.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default ShoppingList;
