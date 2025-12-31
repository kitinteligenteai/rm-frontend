// src/components/ShoppingList.jsx
// v10.0 - Lista Maestra: Cantidades Estimadas + Categorización Estricta

import React, { useMemo, useState } from 'react';
import { ShoppingCart, Check, MessageCircle, Leaf, Drumstick, Milk, Archive, Circle, HelpCircle, Share2 } from 'lucide-react';

// --- 1. DICCIONARIO DE LIMPIEZA ---
// Normaliza nombres para agrupar (ej: "cebolla morada" y "cebolla blanca" -> "Cebollas")
const normalizeIngredient = (rawName) => {
  let name = rawName.toLowerCase();
  
  // Eliminar paréntesis y cortes irrelevantes para la compra
  name = name.replace(/\(.*\)/g, "").trim();
  const stopWords = ["picad[oa]s?", "finamente", "en cubos", "en rodajas", "filetead[oa]", "cocid[oa]", "asado", "pelad[oa]", "desvenad[oa]", "sin semillas", "a temperatura ambiente", "refrigerad[oa]", "con cáscara", "sin hueso", "partido", "a la mitad", "trozo", "para guisar", "bistecs", "medallones", "fresca", "fresco", "rebanados"];
  const regex = new RegExp(`\\b(${stopWords.join("|")})\\b`, "gi");
  name = name.replace(regex, "").trim();

  // Mapeo directo a nombres estándar
  if (name.includes("huevo") || name.includes("yema") || name.includes("clara")) return "Huevos";
  if (name.includes("cebolla")) return "Cebollas";
  if (name.includes("jitomate") || name.includes("tomate")) return "Jitomates / Tomates";
  if (name.includes("aguacate")) return "Aguacates";
  if (name.includes("chile") || name.includes("jalapeño") || name.includes("serrano")) return "Chiles frescos";
  if (name.includes("cilantro") || name.includes("perejil") || name.includes("albahaca") || name.includes("hierba")) return "Hierbas de Olor (Cilantro/Perejil)";
  if (name.includes("limón") || name.includes("limon") || name.includes("limones")) return "Limones";
  if (name.includes("ajo")) return "Cabezas de Ajo";
  if (name.includes("calabacita")) return "Calabacitas";
  if (name.includes("ejote")) return "Ejotes";
  if (name.includes("chayote")) return "Chayotes";
  if (name.includes("champiñon")) return "Champiñones";
  if (name.includes("nopal")) return "Nopales";

  // Proteínas específicas
  if (name.includes("bistec") || name.includes("res")) return name.charAt(0).toUpperCase() + name.slice(1); // Mantiene nombre original limpio (ej: Costilla de res)
  if (name.includes("pollo") || name.includes("pechuga") || name.includes("muslo")) return "Pollo (Piezas o Pechuga)";
  if (name.includes("carne molida")) return "Carne Molida (Res/Cerdo)";
  if (name.includes("atún")) return "Atún (Lomo/Medallón o Lata agua)";

  // Grasas y Básicos
  if (name.includes("ghee") || name.includes("mantequilla") || name.includes("manteca") || name.includes("aceite de coco")) return "Grasas (Ghee/Mantequilla/Manteca)";
  if (name.includes("aceite de oliva")) return "Aceite de Oliva Extra Virgen";
  if (name.includes("sal") && !name.includes("salmón")) return "Sal de Mar";
  if (name.includes("pimienta")) return "Pimienta Negra";
  if (name.includes("endulzante") || name.includes("monje") || name.includes("stevia")) return "Endulzante Permitido";

  // Capitalizar lo que sobre
  return name.charAt(0).toUpperCase() + name.slice(1).replace(/\s+/g, ' ').trim();
};

// --- 2. CEREBRO CLASIFICADOR (Keywords) ---
const getCategory = (itemName) => {
  const lower = itemName.toLowerCase();
  
  // Listas de palabras clave para forzar la categoría correcta
  const PROTEINAS = ["carne", "pollo", "pescado", "atún", "atun", "camaron", "chorizo", "tocino", "hígado", "higado", "costilla", "chamorro", "chicharrón", "bistec", "res", "cerdo", "pavo", "lomo", "pierna", "muslo", "milanesa"];
  const VERDURAS = ["cebolla", "tomate", "jitomate", "aguacate", "cilantro", "perejil", "chile", "nopal", "verdura", "fruta", "limón", "limon", "limones", "ajo", "calabacita", "chayote", "ejote", "champiñon", "pimiento", "lechuga", "espinaca", "acelga", "coliflor", "brocoli", "frutos rojos", "berries", "fresa", "albahaca"];
  const LACTEOS_HUEVO = ["huevo", "queso", "crema", "leche", "yogur", "yoghurt", "mantequilla", "ghee"];
  const DESPENSA = ["sal", "pimienta", "aceite", "grasas", "vinagre", "endulzante", "especia", "harina", "polvo", "cacao", "chia", "chía", "linaza", "nueces", "almendras", "vainilla", "tártaro", "crémor", "curcuma", "cúrcuma"];

  if (PROTEINAS.some(k => lower.includes(k))) return "Carnes y Pescados";
  if (VERDURAS.some(k => lower.includes(k))) return "Frutas y Verduras";
  if (LACTEOS_HUEVO.some(k => lower.includes(k))) return "Lácteos y Huevos";
  if (DESPENSA.some(k => lower.includes(k))) return "Despensa y Básicos";
  
  return "Otros (Revisar)";
};

// --- 3. CALCULADORA DE CANTIDADES ---
const estimateQuantity = (name, count, category) => {
  // Reglas heurísticas basadas en el número de recetas que usan el ingrediente
  if (category === "Carnes y Pescados") {
    // Aprox 200g por receta por persona
    return `Total aprox: ${count * 200}g`; 
  }
  if (name.includes("Huevos")) {
    const total = count * 2; // 2 huevos por receta promedio
    return total > 12 ? "Compra Tapa de 30" : "Compra Docena";
  }
  if (category === "Frutas y Verduras") {
    // Si es algo contable (aguacate, cebolla)
    if (["Aguacates", "Cebollas", "Limones", "Jitomates / Tomates", "Chayotes", "Calabacitas"].includes(name)) {
      return `Aprox: ${count * 2} piezas`; 
    }
    return `Suficiente para ${count} recetas`;
  }
  if (category === "Despensa y Básicos") {
    return "Verificar existencias";
  }
  return `Para ${count} comidas`;
};

const CATEGORY_CONFIG = {
  'Frutas y Verduras': { icon: <Leaf size={20} className="text-green-500" />, order: 1 },
  'Carnes y Pescados': { icon: <Drumstick size={20} className="text-red-500" />, order: 2 },
  'Lácteos y Huevos': { icon: <Milk size={20} className="text-blue-500" />, order: 3 },
  'Despensa y Básicos': { icon: <Archive size={20} className="text-amber-500" />, order: 4 },
  'Otros (Revisar)': { icon: <HelpCircle size={20} className="text-slate-400" />, order: 5 },
};

const ShoppingList = ({ mealPlan }) => {
  const [checkedItems, setCheckedItems] = useState({});

  const processedList = useMemo(() => {
    if (!mealPlan) return {};
    const map = new Map();

    // 1. Aplanar y normalizar
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
              // Clasificar UNA VEZ normalizado
              map.set(cleanName, { 
                name: cleanName, 
                count: 1, 
                category: getCategory(cleanName) 
              });
            }
          });
        }
      });
    });

    // 2. Agrupar y Calcular Cantidades
    const grouped = { 
        'Frutas y Verduras': [], 
        'Carnes y Pescados': [], 
        'Lácteos y Huevos': [], 
        'Despensa y Básicos': [], 
        'Otros (Revisar)': [] 
    };
    
    Array.from(map.values()).forEach(item => {
      // Calcular la cantidad sugerida
      item.quantityLabel = estimateQuantity(item.name, item.count, item.category);

      if (grouped[item.category]) {
          grouped[item.category].push(item);
      } else {
          // Fallback por si acaso
          grouped['Otros (Revisar)'].push(item);
      }
    });

    return grouped;
  }, [mealPlan]);

  const toggleItem = (name) => setCheckedItems(prev => ({ ...prev, [name]: !prev[name] }));

  const sendToWhatsapp = () => {
    let text = `🛒 *Mi Lista Inteligente - Reinicio Metabólico*\n\n`;
    // Ordenar categorías para el mensaje
    const categoriesOrdered = Object.keys(CATEGORY_CONFIG).sort((a, b) => CATEGORY_CONFIG[a].order - CATEGORY_CONFIG[b].order);

    categoriesOrdered.forEach((cat) => {
      const items = processedList[cat];
      if (items && items.length > 0) {
        text += `*${cat.toUpperCase()}*\n`;
        items.forEach(item => {
           if (!checkedItems[item.name]) {
               text += `⬜ ${item.name} (${item.quantityLabel})\n`;
           }
        });
        text += `\n`;
      }
    });
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden">
      <div className="p-4 md:p-6 bg-slate-950 border-b border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShoppingCart className="text-teal-400" /> Lista de Compras
            </h2>
            <p className="text-slate-400 text-xs mt-1">Calculada según tus recetas seleccionadas.</p>
        </div>
        <button onClick={sendToWhatsapp} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 text-sm transition-all shadow-lg shadow-green-900/20">
            <MessageCircle size={18} /> Enviar a WhatsApp
        </button>
      </div>

      <div className="p-4 md:p-6 space-y-8">
        {Object.keys(CATEGORY_CONFIG)
            .sort((a, b) => CATEGORY_CONFIG[a].order - CATEGORY_CONFIG[b].order)
            .map((category) => {
                const items = processedList[category];
                if (!items || items.length === 0) return null;

                return (
                    <div key={category}>
                    <h3 className="text-sm font-bold text-teal-500 uppercase tracking-wider mb-3 flex items-center gap-2 border-b border-slate-800 pb-2">
                        {CATEGORY_CONFIG[category].icon} {category}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {items.map((item, idx) => (
                        <div key={idx} 
                            onClick={() => toggleItem(item.name)}
                            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                                checkedItems[item.name] 
                                ? 'bg-slate-900/50 border-slate-800 opacity-50' 
                                : 'bg-slate-800 border-slate-700 hover:border-slate-500'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`transition-colors ${checkedItems[item.name] ? 'text-teal-500' : 'text-slate-500'}`}>
                                    {checkedItems[item.name] ? <CheckCircle size={20} /> : <Circle size={20} />}
                                </div>
                                <div>
                                    <span className={`block font-medium ${checkedItems[item.name] ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                                        {item.name}
                                    </span>
                                    <span className="text-xs text-teal-400/80 font-mono">
                                        {item.quantityLabel}
                                    </span>
                                </div>
                            </div>
                        </div>
                        ))}
                    </div>
                    </div>
                );
            })}
            
        {Object.values(processedList).every(arr => arr.length === 0) && (
            <div className="text-center text-slate-500 py-10">
                <p>Tu lista está vacía.</p>
                <p className="text-sm mt-2">Agrega recetas al Planeador Semanal primero.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default ShoppingList;