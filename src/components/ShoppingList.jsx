import React, { useMemo, useState } from 'react';
import { ShoppingCart, Check, MessageCircle, Leaf, Drumstick, Milk, Archive, Circle, HelpCircle, Share2, Printer } from 'lucide-react';

// --- 1. NORMALIZADOR (Limpieza de Texto) ---
const normalizeIngredient = (rawName) => {
  let name = rawName.toLowerCase();
  
  // Quitar paréntesis y contenido extra
  name = name.replace(/\(.*\)/g, "").trim();
  
  // Palabras a ignorar para poder agrupar
  const stopWords = [
    "picad[oa]s?", "finamente", "en cubos", "en rodajas", "filetead[oa]", 
    "cocid[oa]", "asado", "pelad[oa]", "desvenad[oa]", "sin semillas", 
    "a temperatura ambiente", "refrigerad[oa]", "con cáscara", "sin hueso", 
    "partido", "a la mitad", "trozo", "para guisar", "bistecs", "medallones", 
    "fresca", "fresco", "rebanados", "carnosa", "seco", "limpio"
  ];
  const regex = new RegExp(`\\b(${stopWords.join("|")})\\b`, "gi");
  name = name.replace(regex, "").trim();

  // Mapeos de Ingredientes Comunes
  if (name.includes("huevo") || name.includes("yema")) return "Huevos";
  if (name.includes("cebolla")) return "Cebollas (Blanca/Morada)";
  if (name.includes("jitomate") || name.includes("tomate")) return "Jitomates / Tomates";
  if (name.includes("aguacate")) return "Aguacates";
  if (name.includes("chile") || name.includes("jalapeño") || name.includes("serrano") || name.includes("pimiento") || name.includes("morron")) return "Chiles y Pimientos";
  if (name.includes("cilantro") || name.includes("perejil") || name.includes("albahaca") || name.includes("hierba") || name.includes("epazote")) return "Hierbas Frescas";
  if (name.includes("limón") || name.includes("limon")) return "Limones";
  if (name.includes("ajo")) return "Ajo (Cabezas)";
  if (name.includes("calabacita") || name.includes("calabaza")) return "Calabacitas";
  if (name.includes("ejote")) return "Ejotes";
  if (name.includes("chayote")) return "Chayotes";
  if (name.includes("champiñon") || name.includes("hongo") || name.includes("seta")) return "Champiñones / Hongos";
  if (name.includes("nopal")) return "Nopales";
  if (name.includes("frutos rojos") || name.includes("fresa") || name.includes("berries") || name.includes("mora")) return "Frutos Rojos (Fresas/Moras)";
  if (name.includes("lechuga") || name.includes("espinaca") || name.includes("acelga") || name.includes("kale")) return "Hojas Verdes (Lechuga/Espinaca)";

  // Proteínas
  if (name.includes("pollo") || name.includes("pechuga") || name.includes("muslo") || name.includes("pierna")) return "Pollo (Piezas variadas)";
  if (name.includes("carne molida")) return "Carne Molida (Res/Cerdo)";
  if (name.includes("atún") || name.includes("atun")) return "Atún (Lomo/Medallón o Lata Agua)";
  if (name.includes("bistec") || name.includes("res") || name.includes("arrachera") || name.includes("suadero") || name.includes("aguja") || name.includes("diezmillo") || name.includes("chamorro") || name.includes("costilla")) return "Carne de Res (Cortes varios)";
  if (name.includes("cerdo") || name.includes("chuleta") || name.includes("puerco") || name.includes("chicharrón") || name.includes("chicharron") || name.includes("longaniza") || name.includes("chorizo") || name.includes("tocino")) return "Cerdo y Derivados";
  if (name.includes("pescado") || name.includes("tilapia") || name.includes("robalo") || name.includes("huachinango") || name.includes("salmon") || name.includes("salmón") || name.includes("camaron") || name.includes("marisco")) return "Pescados y Mariscos";
  if (name.includes("tofu")) return "Tofu Firme";

  // Grasas y Básicos
  if (name.includes("ghee") || name.includes("mantequilla") || name.includes("manteca") || name.includes("aceite de coco")) return "Grasas Solidas (Ghee/Mantequilla/Manteca)";
  if (name.includes("aceite de oliva") || name.includes("aceite de aguacate")) return "Aceites Líquidos (Oliva/Aguacate)";
  if (name.includes("sal") && !name.includes("salmón")) return "Sal de Mar / Himalaya";
  if (name.includes("pimienta")) return "Pimienta y Especias";
  if (name.includes("endulzante") || name.includes("monje") || name.includes("stevia") || name.includes("eritritol")) return "Endulzante Permitido";
  if (name.includes("harina")) return "Harinas Low-Carb (Almendra/Coco)";
  if (name.includes("polvo para hornear") || name.includes("bicarbonato")) return "Polvos para Hornear";
  if (name.includes("vinagre")) return "Vinagres (Manzana/Balsámico)";
  if (name.includes("cacao") || name.includes("cocoa")) return "Cacao en Polvo";

  // Capitalizar lo que no cayó en reglas
  return name.charAt(0).toUpperCase() + name.slice(1).replace(/\s+/g, ' ').trim();
};

// --- 2. CATEGORIZADOR ESTRICTO ---
const getCategory = (cleanName) => {
  const lower = cleanName.toLowerCase();
  
  if (lower.includes("res") || lower.includes("pollo") || lower.includes("cerdo") || lower.includes("pescado") || lower.includes("atún") || lower.includes("camaron") || lower.includes("tofu") || lower.includes("carne")) return "Carnes y Pescados";
  
  if (lower.includes("cebolla") || lower.includes("tomate") || lower.includes("aguacate") || lower.includes("hierba") || lower.includes("chile") || lower.includes("nopal") || lower.includes("limon") || lower.includes("ajo") || lower.includes("calabacita") || lower.includes("chayote") || lower.includes("ejote") || lower.includes("champiñon") || lower.includes("hojas verdes") || lower.includes("frutos rojos")) return "Frutas y Verduras";
  
  if (lower.includes("huevo") || lower.includes("queso") || lower.includes("crema") || lower.includes("leche") || lower.includes("yogur")) return "Lácteos y Huevos";
  
  if (lower.includes("aceite") || lower.includes("grasa") || lower.includes("manteca") || lower.includes("mantequilla") || lower.includes("ghee")) return "Aceites y Grasas";
  
  if (lower.includes("sal") || lower.includes("pimienta") || lower.includes("vinagre") || lower.includes("endulzante") || lower.includes("harina") || lower.includes("polvo") || lower.includes("cacao") || lower.includes("semilla") || lower.includes("nuez") || lower.includes("vainilla") || lower.includes("tártaro")) return "Despensa y Básicos";
  
  return "Otros (Revisar)";
};

// --- 3. CALCULADORA DE CANTIDADES (Lógica Humana) ---
const estimateQuantity = (name, count) => {
  const lower = name.toLowerCase();

  // Huevos: Regla simple
  if (lower.includes("huevo")) {
    const total = count * 2; // Promedio 2 huevos por uso
    if (total <= 12) return "1 Docena";
    if (total <= 18) return "1 Paquete (18 pzas)";
    return "1 Tapa (30 pzas)";
  }

  // Proteínas: 150-200g por receta
  if (lower.includes("carne") || lower.includes("pollo") || lower.includes("cerdo") || lower.includes("pescado") || lower.includes("res")) {
    return `Aprox: ${(count * 0.15).toFixed(1)} - ${(count * 0.2).toFixed(1)} kg`;
  }

  // Verduras de Uso Rudo (Cebolla, Tomate) -> 1 pieza cada 2-3 recetas
  if (lower.includes("cebolla") || lower.includes("aguacate") || lower.includes("calabacita")) {
    const piezas = Math.ceil(count * 0.5); // Media pieza por receta
    return `Aprox: ${piezas} piezas`;
  }
  
  // Verduras de Uso Diario (Tomate)
  if (lower.includes("tomate") || lower.includes("jitomate") || lower.includes("limon")) {
    return `Aprox: ${count} piezas`; // 1 pieza por receta
  }

  // Ajos y Hierbas (Rendidores)
  if (lower.includes("ajo")) return "1-2 Cabezas";
  if (lower.includes("hierba") || lower.includes("cilantro")) return "1-2 Manojos";

  // Básicos (Aceites, Especias)
  if (lower.includes("aceite") || lower.includes("sal") || lower.includes("pimienta") || lower.includes("grasa") || lower.includes("vinagre") || lower.includes("endulzante")) {
    return "Verificar alacena";
  }

  return `Suficiente para ${count} recetas`;
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
      item.quantityLabel = estimateQuantity(item.name, item.count);
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

  const copyToClipboard = () => {
    let text = `🛒 *Lista Reinicio Metabólico*\n\n`;
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
    navigator.clipboard.writeText(text);
    alert("Lista copiada al portapapeles");
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden">
      <div className="p-4 md:p-6 bg-slate-950 border-b border-slate-800 flex justify-between items-center gap-4">
        <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShoppingCart className="text-teal-400" /> Lista de Compras
            </h2>
            <p className="text-slate-400 text-xs mt-1">Basada en tu selección actual.</p>
        </div>
        <div className="flex gap-2">
            <button onClick={copyToClipboard} className="p-2 bg-slate-800 hover:bg-slate-700 text-teal-400 rounded-lg transition-colors">
                <Share2 size={20} />
            </button>
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-6">
        {Object.keys(CATEGORY_CONFIG)
            .sort((a, b) => CATEGORY_CONFIG[a].order - CATEGORY_CONFIG[b].order)
            .map((category) => {
                const items = processedList[category];
                if (!items || items.length === 0) return null;

                return (
                    <div key={category}>
                    <h3 className="text-xs font-bold text-teal-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                        {CATEGORY_CONFIG[category].icon} {category}
                    </h3>
                    <div className="space-y-1">
                        {items.map((item, idx) => (
                        <div key={idx} 
                            onClick={() => toggleItem(item.name)}
                            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer group transition-all ${
                                checkedItems[item.name] ? 'opacity-30' : 'hover:bg-slate-800'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`transition-colors ${checkedItems[item.name] ? 'text-teal-500' : 'text-slate-600 group-hover:text-slate-400'}`}>
                                    {checkedItems[item.name] ? <CheckCircle size={18} /> : <Circle size={18} />}
                                </div>
                                <span className={`text-sm ${checkedItems[item.name] ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                                    {item.name}
                                </span>
                            </div>
                            <span className="text-xs text-slate-500 font-mono">
                                {item.quantityLabel}
                            </span>
                        </div>
                        ))}
                    </div>
                    </div>
                );
            })}
            
        {Object.values(processedList).every(arr => (!arr || arr.length === 0)) && (
            <div className="text-center text-slate-500 py-10">
                <p>Tu lista está vacía.</p>
                <p className="text-sm mt-2">Ve al Planeador para agregar recetas.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default ShoppingList;