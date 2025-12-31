import React, { useMemo, useState } from 'react';
import { ShoppingCart, Check, MessageCircle, Leaf, Drumstick, Milk, Archive, Circle, HelpCircle, Droplets } from 'lucide-react';

// --- 1. NORMALIZADOR DE NOMBRES ---
const normalizeIngredient = (rawName) => {
  let name = rawName.toLowerCase();
  
  // Limpieza agresiva de términos de cocina
  name = name.replace(/\(.*\)/g, "").trim(); // Quitar paréntesis
  const stopWords = ["picad[oa]s?", "finamente", "en cubos", "en rodajas", "filetead[oa]", "cocid[oa]", "asado", "pelad[oa]", "desvenad[oa]", "sin semillas", "a temperatura ambiente", "refrigerad[oa]", "con cáscara", "sin hueso", "partido", "a la mitad", "trozo", "para guisar", "bistecs", "medallones", "fresca", "fresco", "rebanados", "carnosa"];
  const regex = new RegExp(`\\b(${stopWords.join("|")})\\b`, "gi");
  name = name.replace(regex, "").trim();

  // Mapeos Directos
  if (name.includes("huevo") || name.includes("yema")) return "Huevos";
  if (name.includes("cebolla")) return "Cebollas";
  if (name.includes("jitomate") || name.includes("tomate")) return "Jitomates / Tomates";
  if (name.includes("aguacate")) return "Aguacates";
  if (name.includes("chile") || name.includes("jalapeño") || name.includes("serrano") || name.includes("morita") || name.includes("arbol")) return "Chiles (Serrano/Jalapeño/Secos)";
  if (name.includes("cilantro") || name.includes("perejil") || name.includes("albahaca") || name.includes("hierba")) return "Hierbas de Olor (Cilantro/Perejil)";
  if (name.includes("limón") || name.includes("limon")) return "Limones";
  if (name.includes("ajo")) return "Cabezas de Ajo";
  if (name.includes("calabacita")) return "Calabacitas";
  if (name.includes("ejote")) return "Ejotes";
  if (name.includes("chayote")) return "Chayotes";
  if (name.includes("champiñon")) return "Champiñones";
  if (name.includes("nopal")) return "Nopales";
  if (name.includes("frutos rojos") || name.includes("fresa") || name.includes("berries")) return "Frutos Rojos (Fresas/Moras)";

  // Proteínas
  if (name.includes("pollo") || name.includes("pechuga") || name.includes("muslo") || name.includes("pierna")) return "Pollo (Piezas o Pechuga)";
  if (name.includes("carne molida")) return "Carne Molida (Res/Cerdo)";
  if (name.includes("atún") || name.includes("atun")) return "Atún (Lomo, Medallón o Lata en Agua)";
  if (name.includes("bistec")) return "Bistec de Res";
  if (name.includes("costilla")) return "Costilla (Res/Cerdo)";
  if (name.includes("chorizo")) return "Chorizo (Sin soya)";
  if (name.includes("tofu")) return "Tofu Firme";

  // Grasas y Básicos
  if (name.includes("ghee") || name.includes("mantequilla") || name.includes("manteca") || name.includes("aceite de coco")) return "Grasas para Cocinar (Ghee/Mantequilla/Manteca)";
  if (name.includes("aceite de oliva")) return "Aceite de Oliva Extra Virgen";
  if (name.includes("sal") && !name.includes("salmón")) return "Sal de Mar / Himalaya";
  if (name.includes("pimienta")) return "Pimienta Negra";
  if (name.includes("endulzante") || name.includes("monje") || name.includes("stevia")) return "Endulzante Permitido";
  if (name.includes("harina de almendra")) return "Harina de Almendras";
  if (name.includes("polvo para hornear")) return "Polvo para hornear";

  return name.charAt(0).toUpperCase() + name.slice(1).replace(/\s+/g, ' ').trim();
};

// --- 2. CATEGORIZADOR ESTRICTO ---
const getCategory = (itemName) => {
  const lower = itemName.toLowerCase();
  
  // ¡ORDEN IMPORTANTE! Verduras antes que carnes para evitar el bug de "f-res-cos"
  
  const VERDURAS = ["cebolla", "tomate", "jitomate", "aguacate", "cilantro", "perejil", "chile", "nopal", "verdura", "fruta", "limón", "limon", "ajo", "calabacita", "chayote", "ejote", "champiñon", "pimiento", "lechuga", "espinaca", "acelga", "coliflor", "brocoli", "frutos rojos", "berries", "fresa", "albahaca", "hierbas"];
  if (VERDURAS.some(k => lower.includes(k))) return "Frutas y Verduras";

  const PROTEINAS = ["carne", "pollo", "pescado", "atún", "atun", "camaron", "chorizo", "tocino", "hígado", "higado", "costilla", "chamorro", "chicharrón", "bistec", "res", "cerdo", "pavo", "lomo", "pierna", "muslo", "milanesa", "tofu", "salmon", "salmón"];
  // Usamos regex para "res" para que sea palabra completa y no coincida con "frescos"
  if (/\bres\b/.test(lower) || PROTEINAS.some(k => lower.includes(k))) return "Carnes y Pescados";

  const GRASAS = ["aceite", "mantequilla", "ghee", "manteca", "grasa"];
  if (GRASAS.some(k => lower.includes(k))) return "Aceites y Grasas";

  const LACTEOS = ["huevo", "queso", "crema", "leche", "yogur", "yoghurt"];
  if (LACTEOS.some(k => lower.includes(k))) return "Lácteos y Huevos";

  const DESPENSA = ["sal ", "pimienta", "vinagre", "endulzante", "especia", "harina", "polvo", "cacao", "chia", "chía", "linaza", "nueces", "almendras", "vainilla", "tártaro", "crémor", "curcuma", "cúrcuma"];
  if (DESPENSA.some(k => lower.includes(k))) return "Despensa y Básicos";
  
  return "Otros (Revisar)";
};

// --- 3. CALCULADORA REALISTA ---
const estimateQuantity = (name, count, category) => {
  const lower = name.toLowerCase();

  // REGLA: Huevos (2 por receta promedio)
  if (lower.includes("huevo")) {
    const total = count * 2;
    if (total <= 12) return "Compra Docena (12 pzas)";
    if (total <= 18) return "Compra Paquete (18 pzas)";
    return "Compra Tapa (30 pzas)";
  }

  // REGLA: Proteínas (200g por receta es estándar)
  if (category === "Carnes y Pescados") {
    return `Total aprox: ${count * 200}g`; 
  }

  // REGLA: Verduras (Ajustado a la realidad)
  if (category === "Frutas y Verduras") {
    // Cosas que se usan poco
    if (lower.includes("ajo") || lower.includes("chile") || lower.includes("hierbas")) {
        return "Al gusto / Unas piezas";
    }
    // Cosas que se usan medio (Cebolla, Aguacate) -> 0.5 por receta
    if (lower.includes("cebolla") || lower.includes("aguacate") || lower.includes("calabacita") || lower.includes("pepino")) {
        return `Aprox: ${Math.ceil(count * 0.5)} piezas`;
    }
    // Cosas que se usan 1 a 1 (Tomate, Nopal)
    if (lower.includes("jitomate") || lower.includes("tomate") || lower.includes("nopal") || lower.includes("limón")) {
        return `Aprox: ${count} piezas`;
    }
    return `Para ${count} recetas`;
  }

  // REGLA: Despensa (Duran mucho)
  if (category === "Despensa y Básicos" || category === "Aceites y Grasas") {
    return "Verificar existencias";
  }

  return `Para ${count} recetas`;
};

const CATEGORY_CONFIG = {
  'Frutas y Verduras': { icon: <Leaf size={20} className="text-green-500" />, order: 1 },
  'Carnes y Pescados': { icon: <Drumstick size={20} className="text-red-500" />, order: 2 },
  'Lácteos y Huevos': { icon: <Milk size={20} className="text-blue-500" />, order: 3 },
  'Aceites y Grasas': { icon: <Droplets size={20} className="text-yellow-500" />, order: 4 },
  'Despensa y Básicos': { icon: <Archive size={20} className="text-amber-500" />, order: 5 },
  'Otros (Revisar)': { icon: <HelpCircle size={20} className="text-slate-400" />, order: 6 },
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

    const grouped = {};
    Object.keys(CATEGORY_CONFIG).forEach(cat => grouped[cat] = []);
    
    Array.from(map.values()).forEach(item => {
      item.quantityLabel = estimateQuantity(item.name, item.count, item.category);
      if (grouped[item.category]) {
          grouped[item.category].push(item);
      } else {
          if(!grouped['Otros (Revisar)']) grouped['Otros (Revisar)'] = [];
          grouped['Otros (Revisar)'].push(item);
      }
    });

    return grouped;
  }, [mealPlan]);

  const toggleItem = (name) => setCheckedItems(prev => ({ ...prev, [name]: !prev[name] }));

  const sendToWhatsapp = () => {
    let text = `🛒 *Mi Lista Inteligente - Reinicio Metabólico*\n\n`;
    Object.keys(CATEGORY_CONFIG).sort((a, b) => CATEGORY_CONFIG[a].order - CATEGORY_CONFIG[b].order).forEach((cat) => {
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
            <p className="text-slate-400 text-xs mt-1">Cantidades estimadas para tu menú.</p>
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
            
        {Object.values(processedList).every(arr => (!arr || arr.length === 0)) && (
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