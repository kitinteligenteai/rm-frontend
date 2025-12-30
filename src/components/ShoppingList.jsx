import React, { useMemo, useState } from 'react';
import { ShoppingCart, Check, MessageCircle, Leaf, Drumstick, Milk, Archive, Circle } from 'lucide-react';

// --- DICCIONARIO DE NORMALIZACIÓN ---
const normalizeIngredient = (rawName) => {
  let name = rawName.toLowerCase();
  
  // 1. Eliminar paréntesis y palabras basura
  name = name.replace(/\(.*\)/g, "").trim();
  const stopWords = ["picad[oa]s?", "finamente", "en cubos", "en rodajas", "filetead[oa]", "cocid[oa]", "asado", "pelad[oa]", "desvenad[oa]", "sin semillas", "a temperatura ambiente", "refrigerad[oa]", "con cáscara", "sin hueso", "partido", "a la mitad", "trozo", "para guisar", "bistecs", "medallones", "fresca", "fresco"];
  const regex = new RegExp(`\\b(${stopWords.join("|")})\\b`, "gi");
  name = name.replace(regex, "").trim();

  // 2. Unificación Maestra (Tus reglas)
  if (name.includes("huevo") || name.includes("yema") || name.includes("clara")) return "Huevos (Tapa de 30)";
  if (name.includes("cebolla")) return "Cebollas (blanca/morada)";
  if (name.includes("jitomate") || name.includes("tomate")) return "Jitomates / Tomates";
  if (name.includes("aguacate")) return "Aguacates";
  if (name.includes("chile") || name.includes("jalapeño") || name.includes("serrano")) return "Chiles frescos (Serrano/Jalapeño)";
  if (name.includes("cilantro") || name.includes("perejil") || name.includes("albahaca")) return "Hierbas frescas (Cilantro/Perejil/Albahaca)";
  if (name.includes("limón") || name.includes("limon")) return "Limones";
  if (name.includes("ajo")) return "Cabezas de Ajo";
  
  // Agrupación de Grasas
  if (name.includes("ghee") || name.includes("mantequilla") || name.includes("manteca") || name.includes("aceite de coco")) return "Grasas para cocinar (Ghee, Mantequilla, Manteca)";
  if (name.includes("aceite de oliva")) return "Aceite de Oliva Extra Virgen";

  // Agrupación de Básicos
  if (name.includes("sal") && !name.includes("salmón")) return "Sal de Mar / Himalaya";
  if (name.includes("pimienta")) return "Pimienta Negra";
  if (name.includes("endulzante") || name.includes("monje") || name.includes("stevia")) return "Endulzante (Fruto del Monje / Stevia)";
  if (name.includes("atún")) return "Atún (Lomo/Medallón o Lata en Agua/Oliva)";

  // Capitalizar
  return name.charAt(0).toUpperCase() + name.slice(1).replace(/\s+/g, ' ').trim();
};

const CATEGORY_ICONS = {
  'Frutas y Verduras': <Leaf size={20} className="text-green-500" />,
  'Carnes y Pescados': <Drumstick size={20} className="text-red-500" />,
  'Lácteos y Huevos': <Milk size={20} className="text-blue-500" />,
  'Despensa y Básicos': <Archive size={20} className="text-amber-500" />,
  'Otros': <ShoppingCart size={20} className="text-slate-400" />,
};

const getCategory = (item) => {
  const lower = item.toLowerCase();
  if (lower.includes("carne") || lower.includes("pollo") || lower.includes("pescado") || lower.includes("atún") || lower.includes("camaron") || lower.includes("chorizo") || lower.includes("hígado")) return "Carnes y Pescados";
  if (lower.includes("cebolla") || lower.includes("tomate") || lower.includes("aguacate") || lower.includes("cilantro") || lower.includes("chile") || lower.includes("nopales") || lower.includes("verdura") || lower.includes("fruta") || lower.includes("limón")) return "Frutas y Verduras";
  if (lower.includes("queso") || lower.includes("crema") || lower.includes("leche") || lower.includes("yogur") || lower.includes("huevo")) return "Lácteos y Huevos";
  if (lower.includes("sal") || lower.includes("pimienta") || lower.includes("aceite") || lower.includes("grasas") || lower.includes("vinagre") || lower.includes("endulzante") || lower.includes("especia") || lower.includes("harina") || lower.includes("polvo") || lower.includes("ajo")) return "Despensa y Básicos";
  return "Otros";
};

const ShoppingList = ({ mealPlan }) => {
  const [checkedItems, setCheckedItems] = useState({});

  const processedList = useMemo(() => {
    if (!mealPlan) return {};
    const map = new Map();

    Object.values(mealPlan).forEach(dayMeals => {
      if (!dayMeals) return;
      Object.values(dayMeals).forEach(recipe => {
        if (recipe && recipe.ingredients) {
          recipe.ingredients.forEach(ing => {
            const cleanName = normalizeIngredient(ing.name || ing);
            if (map.has(cleanName)) {
              const current = map.get(cleanName);
              map.set(cleanName, { ...current, count: current.count + 1 });
            } else {
              map.set(cleanName, { name: cleanName, count: 1, category: getCategory(cleanName) });
            }
          });
        }
      });
    });

    const grouped = { 'Carnes y Pescados': [], 'Frutas y Verduras': [], 'Lácteos y Huevos': [], 'Despensa y Básicos': [], 'Otros': [] };
    
    Array.from(map.values()).forEach(item => {
      if (grouped[item.category]) grouped[item.category].push(item);
      else grouped['Otros'].push(item);
    });

    return grouped;
  }, [mealPlan]);

  const toggleItem = (name) => setCheckedItems(prev => ({ ...prev, [name]: !prev[name] }));

  const sendToWhatsapp = () => {
    let text = `🛒 *Mi Lista de Súper - Reinicio Metabólico*\n\n`;
    Object.entries(processedList).forEach(([cat, items]) => {
      if (items.length > 0) {
        text += `*${cat.toUpperCase()}*\n`;
        items.forEach(item => {
           if (!checkedItems[item.name]) text += `⬜ ${item.name}\n`;
        });
        text += `\n`;
      }
    });
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="p-4 md:p-6 bg-slate-900 border border-slate-700 rounded-2xl">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 border-b border-slate-800 pb-4">
        <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-teal-400" /> Lista Inteligente
            </h2>
            <p className="text-slate-400 text-xs mt-1">Ingredientes agrupados y limpios.</p>
        </div>
        <button onClick={sendToWhatsapp} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 text-sm transition-all">
            <MessageCircle size={18} /> Enviar a WhatsApp
        </button>
      </div>

      <div className="space-y-6">
        {Object.entries(processedList).map(([category, items]) => (
          items.length > 0 && (
            <div key={category} className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
              <h3 className="text-sm font-bold text-teal-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                {CATEGORY_ICONS[category]} {category}
              </h3>
              <ul className="space-y-2">
                {items.map((item, idx) => (
                  <li key={idx} onClick={() => toggleItem(item.name)}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${checkedItems[item.name] ? 'opacity-40' : 'hover:bg-slate-800'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`transition-colors ${checkedItems[item.name] ? 'text-teal-500' : 'text-slate-600'}`}>
                        {checkedItems[item.name] ? <Check size={18} /> : <Circle size={18} />}
                      </div>
                      <span className={`text-sm ${checkedItems[item.name] ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                        {item.name}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )
        ))}
        {Object.values(processedList).every(arr => arr.length === 0) && (
            <p className="text-center text-slate-500 py-8 text-sm">Selecciona recetas en el Planeador para generar tu lista.</p>
        )}
      </div>
    </div>
  );
};

export default ShoppingList;