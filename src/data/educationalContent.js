// src/data/educationalContent.js
// v5.5 - Contenido Mentalidad Expandido (Formato Artículo)

// 1. FILOSOFÍA (Ahora son Artículos Completos, no frases)
export const philosophyContent = [
  {
    id: 'manifesto',
    title: 'Tu Cuerpo es un Laboratorio, no una Calculadora',
    icon: '💎',
    subtitle: 'Por qué contar calorías ha fallado y qué hacer en su lugar.',
    content: `
      <p>Durante décadas nos han dicho que el peso es una simple ecuación de "Calorías que entran menos calorías que salen". Si esto fuera cierto, comer 100 calorías de azúcar tendría el mismo efecto que comer 100 calorías de brócoli. Sabemos que no es así.</p>
      
      <p><strong>El cambio de paradigma:</strong></p>
      <p>Tu cuerpo no es una cuenta de banco donde depositas monedas. Es un laboratorio químico complejo gobernado por hormonas. Cada vez que comes, envías un "código" a tu ADN:</p>
      <ul class="list-disc pl-5 my-4 space-y-2">
        <li>El azúcar envía el código: <em>"Almacena grasa y apaga la quema de energía".</em></li>
        <li>La proteína envía el código: <em>"Construye músculo y sacia el apetito".</em></li>
        <li>Las grasas saludables envían el código: <em>"Hay energía estable, no tengas ansiedad".</em></li>
      </ul>
      <p>En el Reinicio Metabólico, dejamos de obsesionarnos con la <em>cantidad</em> (calorías) y nos enfocamos obsesivamente en la <em>calidad</em> (información). Cuando corriges la señal química (bajando la insulina), el peso se corrige como consecuencia natural, no como una lucha matemática.</p>
    `
  },
  {
    id: 'sustainability',
    title: 'La Falacia de la Perfección: La Regla del 80/20',
    icon: '🌱',
    subtitle: 'La constancia siempre vence a la intensidad.',
    content: `
      <p>La razón #1 por la que la gente abandona es el pensamiento de "Todo o Nada". Comienzan el lunes al 100%, pero el miércoles comen una galleta y piensan: <em>"Ya lo eché a perder, mejor empiezo el otro lunes"</em>. Y así pasan los años.</p>
      <p><strong>El Reinicio no es una cárcel:</strong></p>
      <p>Si en una comida te sales del plan, no te castigues. No hagas 3 horas de cardio para "quemarlo". Tu cuerpo tiene la capacidad de manejalo si es la excepción y no la regla.</p>
      <p>Simplemente pregúntate: <em>"¿Qué desencadenó esto? ¿Fue estrés? ¿Fue falta de planeación?"</em>. Aprende del dato y asegúrate de que tu <strong>siguiente comida</strong> sea proteína y vegetales.</p>
      <p>Un estilo de vida saludable se construye con lo que haces el 80% del tiempo. Si eres constante en lo básico (agua, proteína, sueño), tienes margen para disfrutar la vida el otro 20% sin culpa. La culpa libera cortisol, y el cortisol te hace engordar. Suelta la culpa, retoma el control.</p>
    `
  },
  {
    id: 'listening',
    title: 'El Arte de Escuchar a tu Cuerpo (Biofeedback)',
    icon: '👂',
    subtitle: 'Cómo distinguir el hambre real de la ansiedad emocional.',
    content: `
      <p>Hemos olvidado cómo se siente el hambre real. Comemos por hora, por aburrimiento, por tristeza o por "sed". Recuperar la conexión con tus señales internas es tu superpoder más grande.</p>
      <h4 class="font-bold text-teal-400 mt-4">La Prueba del Bistec y el Brócoli:</h4>
      <p>Cuando sientas un "antojo" urgente, hazte esta pregunta: <em>"¿Me comería un plato de bistec con brócoli ahora mismo?"</em></p>
      <ul class="list-disc pl-5 my-4 space-y-2">
        <li><strong>Si la respuesta es SÍ:</strong> Es hambre real (fisiológica). Tu cuerpo pide nutrientes. Come.</li>
        <li><strong>Si la respuesta es NO (pero quiero una galleta):</strong> Es hambre emocional o sed. Tu cerebro pide dopamina, no comida.</li>
      </ul>
      <p>Si es emocional, la solución no está en el refrigerador. Bebe un vaso grande de agua con sal, sal a caminar 5 minutos o respira profundo. Aprender a pausar en ese momento es donde ocurre la verdadera transformación.</p>
    `
  }
];

// 2. GUÍAS DE SUPERVIVENCIA (Información Práctica)
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

// 3. CIENCIA Y REFERENCIAS
export const scienceReferences = [
  {
    id: 'ciencia-1',
    title: 'Fuentes Médicas y Científicas',
    category: 'Bibliografía',
    icon: '🧬',
    content: `
      <p>Nuestra metodología no es una opinión; es una síntesis de bioquímica aplicada. Nos basamos en el trabajo clínico de:</p>
      <ul class="list-disc pl-5 space-y-2 mt-3">
        <li><strong>Dr. Peter Attia (Stanford/NIH):</strong> Pionero en medicina de la longevidad y flexibilidad metabólica ("Outlive").</li>
        <li><strong>Dr. Jason Fung (Nefrólogo):</strong> Autoridad mundial en ayuno intermitente y reversión de diabetes tipo 2 ("The Obesity Code").</li>
        <li><strong>Virta Health:</strong> Ensayos clínicos sobre reversión de diabetes mediante restricción de carbohidratos.</li>
        <li><strong>Harvard T.H. Chan School:</strong> Principios de carga glucémica y salud hormonal.</li>
      </ul>
      <p class="mt-4 text-xs italic">Nota: Estas referencias respaldan los principios bioquímicos que utilizamos. Reinicio Metabólico es un programa independiente.</p>
    `
  },
  {
    id: 'ciencia-2',
    title: 'Lectura Recomendada',
    category: 'Profundizar',
    icon: '📚',
    content: `
      <p>Si quieres entender "qué pasa bajo el capó" de tu cuerpo, te recomendamos:</p>
      <ul class="list-disc pl-5 mt-2">
        <li><em>"Why We Get Sick"</em> - Dr. Benjamin Bikman (Insulina y enfermedades crónicas).</li>
        <li><em>"The Big Fat Surprise"</em> - Nina Teicholz (La verdad sobre las grasas saludables).</li>
        <li><em>"Cerebro de Pan"</em> - Dr. David Perlmutter (Impacto del gluten y azúcar en el cerebro).</li>
      </ul>
    `
  }
];

export const toolsContent = [];