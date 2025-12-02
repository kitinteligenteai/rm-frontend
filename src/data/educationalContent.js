// src/data/educationalContent.js
// REPOSITORIO DE FILOSOFÍA Y GUÍAS PRÁCTICAS (v2.1 Full)

// 1. FILOSOFÍA
export const philosophyContent = [
  {
    id: 'manifesto',
    title: 'Calidad sobre Cantidad',
    content: "No somos una calculadora. Tu cuerpo es un laboratorio químico complejo. 100 calorías de brócoli le dan instrucciones de sanación a tu ADN; 100 calorías de azúcar le dan instrucciones de enfermedad. Enfócate en nutrir.",
    icon: '💎'
  },
  {
    id: 'sustainability',
    title: 'Progreso, no Perfección',
    content: "La vida es para disfrutarse. Si te sales del plan en una comida, no te castigues. Simplemente retoma en la siguiente. La constancia vence a la intensidad.",
    icon: '🌱'
  },
  {
    id: 'listening',
    title: 'Escucha a tu Cuerpo',
    content: "Tu cuerpo es sabio. Si tienes hambre real, come proteínas y grasas. Si estás cansado, descansa. Aprender a distinguir entre hambre real y ansiedad emocional es tu superpoder.",
    icon: '👂'
  }
];

// 2. GUÍAS DE SUPERVIVENCIA (Información Práctica del Dr.)
export const survivalGuides = [
  {
    id: 'plate-formula',
    title: 'La Fórmula del Plato (50/25/25)',
    category: 'Básicos',
    icon: '🍽️',
    content: `
      <p>Para asegurar saciedad y nutrición, arma tu plato así:</p>
      <ul class="list-none space-y-2 mt-2">
        <li>🥦 <strong>50% Vegetales (Fibra):</strong> Espinacas, Nopales, Brócoli, Calabacitas. Salteados con grasa buena.</li>
        <li>🍗 <strong>25% Proteína (Estructura):</strong> Pollo, Res, Cerdo, Pescado, Huevos. Es lo que más sacia.</li>
        <li>🥑 <strong>25% Grasas (Energía):</strong> Aguacate, Aceitunas, Almendras, Aceite de Oliva (en frío).</li>
      </ul>
    `
  },
  {
    id: 'drinks',
    title: 'Hidratación y Bebidas',
    category: 'Bebidas',
    icon: '💧',
    content: `
      <p><strong>Permitidos (Sin Límite):</strong> Agua natural, Agua mineral, Café negro, Té verde/herbal, Agua de Jamaica/Limón (sin azúcar).</p>
      <p><strong>El Truco del Vinagre:</strong> Diluye 15ml de Vinagre de Sidra de Manzana (con cultivo madre) en un vaso de agua y tómalo 10 min antes de comer. Ayuda a reducir el pico de glucosa.</p>
      <p><strong>Suero Casero:</strong> Agua mineral + Limón + 1/2 cdita de Sal de Mar. Vital si sientes dolor de cabeza o fatiga.</p>
    `
  },
  {
    id: 'fats',
    title: 'Grasas: Cuáles usar y cómo',
    category: 'Cocina',
    icon: '🍳',
    content: `
      <p>Las grasas no engordan, la insulina sí. Pero la calidad importa:</p>
      <div class="mt-3">
        <h4 class="font-bold text-teal-500">🔥 Para Cocinar (Aguantan calor)</h4>
        <p class="text-sm mb-2">Mantequilla (No Margarina), Ghee (Mantequilla clarificada), Manteca de Cerdo, Aceite de Aguacate, Aceite de Coco.</p>
        
        <h4 class="font-bold text-green-500">🥗 Para Aderezar (En frío)</h4>
        <p class="text-sm mb-2">Aceite de Oliva Extra Virgen (Prensado en frío). No lo uses para freír.</p>
        
        <h4 class="font-bold text-red-500">🚫 Inflamatorios (Evitar)</h4>
        <p class="text-sm">Aceites vegetales de semilla: Canola, Soya, Girasol, Maíz, Cártamo.</p>
      </div>
    `
  },
  {
    id: 'supplements',
    title: 'Suplementación Inteligente',
    category: 'Nutrición',
    icon: '💊',
    content: `
      <p>No son obligatorios, pero potencian tus resultados:</p>
      <ul class="list-disc pl-5 space-y-2 mt-2">
        <li><strong>Proteína en Polvo (Whey):</strong> Busca Aislada (Isolate) o Hidrolizada. Cero azúcar. <br/><em>Recomendación:</em> <strong>Holix Labs</strong> (Natural/Sin Sabor), Isopure Zero Carb, Birdman Falcon (Vegana).</li>
        <li><strong>Probióticos:</strong> <em>Recomendación:</em> Bioleven (Costco).</li>
        <li><strong>Fibra:</strong> Psyllium Husk (1 cda en agua después de cenar).</li>
        <li><strong>Estrés:</strong> Ashwagandha (adaptógeno para bajar cortisol).</li>
        <li><strong>Caldo de Huesos:</strong> Marca RGB Alimentos o Serendipity.</li>
      </ul>
    `
  },
  {
    id: 'supermarket',
    title: 'Detective de Etiquetas',
    category: 'Compras',
    icon: '🛒',
    content: `
      <p>No te fíes de la portada. Lee los ingredientes al reverso.</p>
      <ul class="list-disc pl-5 space-y-2 mt-2">
        <li><strong>Embutidos:</strong> El chorizo debe tener cerdo, chile, vinagre y especias. Si dice "Soya", "Fécula", "Dextrosa" o "Almidón", déjalo.</li>
        <li><strong>Endulzantes Aprobados:</strong> Stevia pura (hoja verde o extracto sin relleno), Fruta del Monje (Monk Fruit 100%), Alulosa.</li>
        <li><strong>Evitar:</strong> Jarabe de maíz, Maltodextrina, Azúcar invertido.</li>
      </ul>
    `
  },
  {
    id: 'social',
    title: 'Vida Social y Alcohol',
    category: 'Social',
    icon: '🥂',
    content: `
      <p><strong>El alcohol pausa la quema de grasa.</strong> Si vas a celebrar, hazlo inteligentemente:</p>
      <ul class="list-disc pl-5 mt-2">
        <li><strong>Opciones "Menos Peores":</strong> Tequila (blanco), Mezcal, Whisky, Vodka. Siempre derechos o con agua mineral y limón. Vino tinto seco (1 copa).</li>
        <li><strong>Evitar a toda costa:</strong> Cerveza (es pan líquido), cocteles dulces, refrescos.</li>
        <li><strong>Botana:</strong> Lleva nueces, aceitunas o chicharrones de cerdo.</li>
      </ul>
    `
  }
];

export const toolsContent = [];