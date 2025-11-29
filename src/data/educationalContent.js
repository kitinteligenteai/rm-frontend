// src/data/educationalContent.js
// REPOSITORIO DE FILOSOFÍA Y GUÍAS PRÁCTICAS

// 1. FILOSOFÍA (Tarjetas Superiores - Inspiración)
export const philosophyContent = [
  {
    id: 'manifesto',
    title: 'Calidad sobre Cantidad',
    content: "No somos una calculadora de calorías. Somos un laboratorio químico complejo. 100 calorías de brócoli no le dicen lo mismo a tus hormonas que 100 calorías de pan. Enfócate en nutrir, no en contar.",
    icon: '💎'
  },
  {
    id: 'sustainability',
    title: 'Progreso, no Perfección',
    content: "Si fallas en una comida, no tires el día entero. El éxito metabólico se construye con lo que haces el 90% del tiempo. Regresa al plan en la siguiente comida y sigue adelante.",
    icon: '🌱'
  },
  {
    id: 'listening',
    title: 'Escucha a tu Cuerpo',
    content: "Tu cuerpo es sabio. Si tienes hambre real, come proteínas y grasas. Si estás cansado, descansa. Aprender a distinguir entre hambre real y ansiedad es tu superpoder.",
    icon: '👂'
  }
];

// 2. GUÍAS DE SUPERVIVENCIA (Información Práctica + Tips)
export const survivalGuides = [
  {
    id: 'plate-formula',
    title: 'La Fórmula del Plato (50/25/25)',
    category: 'Básicos',
    icon: '🍽️',
    content: `
      <p>No pesamos comida, usamos proporciones visuales:</p>
      <ul class="list-none space-y-3 mt-2">
        <li>🥦 <strong>50% Vegetales (Fibra):</strong> Brócoli, Espinacas, Nopales, Calabacitas, Pimientos, Chayotes. (¡Llenan y nutren!)</li>
        <li>🍗 <strong>25% Proteína (Saciedad):</strong> Pollo, Res, Cerdo, Pescado, Huevos, Atún/Sardinas.</li>
        <li>🥑 <strong>25% Grasas Saludables (Energía):</strong> Aguacate, Aceitunas, Aceite de Oliva, Almendras, Pistaches.</li>
      </ul>
    `
  },
  {
    id: 'drinks',
    title: 'Hidratación Permitida',
    category: 'Bebidas',
    icon: '💧',
    content: `
      <p>Lo que bebes importa tanto como lo que comes. Opciones aprobadas:</p>
      <ul class="list-disc pl-5 space-y-2 mt-2">
        <li><strong>Agua Natural / Mineral:</strong> La base de todo.</li>
        <li><strong>Suero Casero:</strong> Agua mineral + Jugo de limón + Pizca de sal de mar (Vital para evitar dolor de cabeza al inicio).</li>
        <li><strong>Café Negro y Té:</strong> Sin azúcar. Manzanilla, menta, té verde, canela.</li>
        <li><strong>Aguas Frescas:</strong> Jamaica, Tamarindo o Pepino/Limón (Endulzadas SOLO con Stevia, Monk Fruit o Alulosa).</li>
      </ul>
    `
  },
  {
    id: 'fats',
    title: 'Grasas: Cuáles usar y cómo',
    category: 'Cocina',
    icon: '🍳',
    content: `
      <p>No todas las grasas son iguales. Usa esta guía:</p>
      <div class="mt-3">
        <h4 class="font-bold text-teal-400">🔥 Para Cocinar (Aguantan calor)</h4>
        <p class="text-sm mb-2">Mantequilla, Ghee (Mantequilla clarificada), Manteca de Cerdo, Aceite de Aguacate, Aceite de Coco.</p>
        
        <h4 class="font-bold text-green-400">🥗 Para Aderezar (En frío)</h4>
        <p class="text-sm mb-2">Aceite de Oliva Extra Virgen (Prensado en frío). ¡No lo quemes!</p>
        
        <h4 class="font-bold text-red-400">🚫 Tóxicos (Tirar a la basura)</h4>
        <p class="text-sm">Aceites vegetales de semilla: Canola, Soya, Girasol, Maíz, Cártamo. Son altamente inflamatorios.</p>
      </div>
    `
  },
  {
    id: 'sweeteners',
    title: 'Endulzantes: La Verdad',
    category: 'Alacena',
    icon: '🍯',
    content: `
      <p>El objetivo es dejar el sabor dulce, pero si necesitas usar algo, estas son las <strong>únicas 3 opciones</strong> que no disparan tu insulina:</p>
      <ol class="list-decimal pl-5 space-y-1 mt-2">
        <li><strong>Stevia:</strong> Pura, sin mezclas (revisa que no tenga dextrosa).</li>
        <li><strong>Fruta del Monje (Monk Fruit):</strong> 100% puro.</li>
        <li><strong>Alulosa:</strong> Excelente para postres.</li>
      </ol>
      <p class="mt-2 text-xs bg-red-500/20 p-2 rounded border border-red-500/30">⚠️ Evita: Splenda, Canderel, Azúcar morena, Miel de abeja/agave (en fase de pérdida de grasa).</p>
    `
  },
  {
    id: 'supplements',
    title: 'Suplementación Inteligente',
    category: 'Nutrición',
    icon: '💊',
    content: `
      <h4 class="font-bold text-white mt-2">Proteína en Polvo (Whey)</h4>
      <p>Útil para romper el ayuno o post-entreno. <strong>Regla:</strong> Debe ser Aislada (Isolate) o Hidrolizada. Cero carbohidratos/azúcar.</p>
      <p><em>Recomendación:</em> <strong>Holix Labs</strong> (Natural/Sin sabor) es una excelente opción limpia.</p>
      
      <h4 class="font-bold text-white mt-4">Magnesio y Electrolitos</h4>
      <p>El citrato o glicinato de magnesio por la noche ayuda al descanso y la función muscular.</p>
    `
  },
  {
    id: 'supermarket',
    title: 'Detective de Etiquetas',
    category: 'Compras',
    icon: '🛒',
    content: `
      <p>No leas la caja por enfrente, lee los <strong>Ingredientes</strong>.</p>
      <ul class="list-disc pl-5 space-y-2 mt-2">
        <li><strong>Embutidos (Chorizo/Tocino):</strong> Ingredientes permitidos: Carne, sal, especias, vinagre. <br/>Evita si dice: Dextrosa, Fécula, Almidón, Soya, Nitritos añadidos.</li>
        <li><strong>Regla de Oro:</strong> Si tiene ingredientes que no puedes pronunciar o que no tienes en tu alacena, mejor no lo lleves.</li>
      </ul>
    `
  },
  {
    id: 'social',
    title: 'Vida Social y Alcohol',
    category: 'Social',
    icon: '🥂',
    content: `
      <p><strong>El Alcohol frena la quema de grasa.</strong> Si decides beber en una ocasión especial:</p>
      <ul class="list-disc pl-5 mt-2">
        <li><strong>Mejores opciones:</strong> Tequila, Mezcal, Whisky, Vodka (derechos o con agua mineral y limón). Vino tinto seco (1 copa).</li>
        <li><strong>Prohibidos:</strong> Cerveza (es pan líquido), cocteles dulces, refrescos como mezcladores.</li>
      </ul>
    `
  },
  {
    id: 'bonebroth',
    title: 'El Elixir: Caldo de Huesos',
    category: 'Nutrición',
    icon: '🥣',
    content: `
      <p>El mejor multivitamínico natural. Lleno de colágeno para tu piel, articulaciones e intestino.</p>
      <p>Hazlo hirviendo huesos (res, pollo, pescado) con agua, un chorrito de vinagre de manzana (para extraer minerales) y sal durante muchas horas (12-24h). Tómalo en ayunas o como base para tus sopas.</p>
    `
  }
];

// Se mantiene vacío por compatibilidad
export const toolsContent = [];