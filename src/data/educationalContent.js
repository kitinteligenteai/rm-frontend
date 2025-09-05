// src/data/educationalContent.js

export const philosophyContent = [
  {
    id: 'manifesto',
    title: 'No Contamos Calorías ni Pesamos Porciones',
    content: "Durante décadas, nos han dicho que la clave para controlar el peso es una simple resta: ‘calorías que entran menos calorías que salen’. Este modelo es incompleto y nos ha llevado a una relación frustrante con la comida, llena de hambre y restricciones.\n\nNuestro enfoque es diferente. Se basa en un principio fundamental de la biología humana: la calidad de los alimentos determina la respuesta de tu cuerpo.\n\nImagina dos comidas con las mismas calorías: un plato de pechuga de pollo con aguacate y brócoli, y un tazón de cereal azucarado. Su efecto en tu cuerpo es radicalmente distinto. El plato de comida real te proporciona nutrientes, te deja satisfecho por horas y mantiene tu energía estable. El tazón de cereal provoca una subida y caída brusca de energía, dejándote con hambre y antojos al poco tiempo.\n\nPor eso, nuestra filosofía es simple: come comida real y deliciosa hasta sentirte satisfecho. Al darle a tu cuerpo los nutrientes que realmente necesita, tus propias hormonas de la saciedad se activarán de forma natural, indicándote cuándo parar. Aprenderás a confiar en tus señales internas, liberándote de la tiranía de contar y pesar cada bocado.",
    icon: '🎯'
  },
  {
    id: 'insulin',
    title: 'Entendiendo la Insulina: El Regulador de tu Energía',
    content: "Pensemos en la insulina como el ‘director de orquesta’ de tu energía. Es una hormona esencial que responde a los alimentos que consumes, especialmente los carbohidratos y azúcares. Su trabajo principal es llevar la glucosa (azúcar) de la sangre a las células para que la usen como energía inmediata.\n\nEl desbalance ocurre con el exceso. Imagina que tus células son esponjas. Si las rocías con un poco de agua (una comida baja en carbohidratos), la absorben sin problema. Si abres una manguera de bomberos (una comida alta en azúcares), las esponjas se saturan rápidamente. La insulina, al ver este exceso, lo convierte y lo guarda en tu tejido graso como reserva.\n\nLo más importante es esto: mientras la insulina está alta, ocupada gestionando este torrente, la prioridad del cuerpo es almacenar, no usar la energía que ya está guardada. Al elegir alimentos que no provocan grandes picos de insulina (proteínas, grasas saludables, vegetales fibrosos), mantenemos al ‘director de orquesta’ tranquilo. Esto permite que el cuerpo acceda a sus reservas de grasa para usarlas como combustible.",
    icon: '⚡'
  },
  {
    id: 'fasting',
    title: 'Domina tu Ayuno: El "Modo de Limpieza" de tu Cuerpo',
    content: "El ayuno es simplemente el período de tiempo en el que no consumes alimentos. Todas las noches, al dormir, ya estás ayunando. Lo que proponemos es extender ese período de forma consciente para obtener enormes beneficios. Al ayunar por 12 horas o más, tu cuerpo cambia de ‘modo almacenamiento’ a ‘modo uso de energía’.\n\nUna Nota Sobre la Adaptación: Durante los primeros días, mientras tu cuerpo aprende a usar grasa como combustible principal, es posible que experimentes síntomas como dolor de cabeza o fatiga. Esto es temporal y se conoce como ‘gripe de adaptación’. Para minimizarlo, es crucial que sigas nuestras recomendaciones de hidratación y consumo de electrolitos.",
    icon: '🌙'
  },
  {
    id: 'muscle',
    title: 'Construye tu Salud: El Dúo Dinámico de Pesas y Proteína',
    content: "Para optimizar los resultados de este plan, recomendamos incorporar entrenamiento de fuerza (pesas, calistenia) de 2 a 4 veces por semana. El músculo es tu ‘horno’ metabólico: a más músculo, más energía quemas incluso en reposo.\n\nPara construir y mantener ese músculo, necesitas darle a tu cuerpo los ladrillos adecuados: la proteína. Nuestro objetivo es claro: queremos usar la grasa como fuente de energía, mientras protegemos tu masa muscular.\n\nRecuerda que tus músculos sostienen tus huesos y te permiten moverte. Una ingesta adecuada de proteína previene que pierdas músculo junto con la grasa. Por eso, no temas comer. Si una receta sugiere 3 huevos o un filete de 200g, es porque está diseñada para ayudarte a alcanzar tu meta proteica diaria y nutrir tus músculos.",
    icon: '💪'
  },
  {
    id: 'electrolytes',
    title: 'Los Tres Mosqueteros de tu Energía: Sodio, Potasio y Magnesio',
    content: "Al reducir los carbohidratos, tu cuerpo procesa los minerales de forma diferente. Mantener estos tres electrolitos en equilibrio es el secreto para sentirte increíble.\n\nSodio: No le temas a la sal de buena calidad (marina, Himalaya). Añádela a tus comidas. Un vaso de agua con media cucharadita de sal por la mañana puede hacer maravillas por tu energía.\n\nPotasio: Es el contrapeso del sodio. Lo encuentras en el aguacate, las espinacas, los champiñones y el salmón.\n\nMagnesio: Esencial para los músculos y el sueño. Se encuentra en almendras, semillas de calabaza y vegetales de hoja verde oscura. Considera un suplemento de citrato o glicinato de magnesio por la noche.",
    icon: '⚖️'
  },
  {
    id: 'sustainability',
    title: 'La Regla del 80/20 Inteligente: Progreso, no Perfección',
    content: "La perfección no es el objetivo; la consistencia sí lo es. La vida está llena de eventos, celebraciones y antojos. Forzarte a una perfección del 100% es una receta para el fracaso.\n\nNuestra estrategia es simple: si una comida o un día se sale del plan, no es un fracaso, es un dato. No hay culpa, solo aprendizaje. Observa cómo te sientes y, en la siguiente comida, retoma tu plan con normalidad. El verdadero éxito no se mide por nunca desviarse, sino por la rapidez con la que se vuelve al camino correcto.\n\nApunta a que el 80-90% de tus comidas sigan la filosofía, y permite que el 10-20% restante sea para disfrutar de la vida sin estrés.",
    icon: '🎯'
  }
];

export const toolsContent = [
  {
    id: 'protein-calculator',
    title: '¿Cuánta Proteína Necesitas?',
    type: 'calculator',
    description: 'Ingresa tu peso en kilogramos para obtener un rango diario recomendado.',
    content: "Este rango está diseñado para preservar la masa muscular durante la pérdida de grasa y promover la saciedad.\n\n**¿Cómo se calcula este rango?**\nSe basa en la literatura científica para optimizar la composición corporal:\n• **Vida sedentaria/ligera:** Tu peso (kg) x 1.4 a 1.6.\n• **Vida activa (con pesas):** Tu peso (kg) x 1.6 a 2.2.",
    icon: '🧮'
  },
  {
    id: 'protein-guide',
    title: 'Guía Rápida de Proteína (Valores Promedio)',
    type: 'reference',
    content: "Usa esta guía para darte una idea de tu ingesta, sin necesidad de pesar obsesivamente.\n\n• 1 Huevo grande: ~7 gramos\n• 100g de Pechuga de Pollo (cocida): ~30 gramos\n• 100g de Bistec de Res (cocido): ~29 gramos\n• 100g de Filete de Salmón (cocido): ~25 gramos\n• 1 lata de Atún en agua (drenado): ~28 gramos\n• 30g de Queso (manchego, cheddar): ~7 gramos",
    icon: '📊'
  },
  {
    id: 'social-guide',
    title: 'Guía de Supervivencia Social',
    type: 'guide',
    content: "**En Reuniones y Fiestas:**\nLa mayoría de las botanas son trampas de carbohidratos. Sé proactivo. Lleva tus propias botanas seguras: una mezcla de nueces, aceitunas, y latas de sardinas o mejillones en aceite de oliva.\n\n**En Parrilladas y Carnes Asadas:**\nEstás en tu elemento. Concéntrate en la carne, pollo, pescado y las ensaladas. Evita las salchichas rojas para asar, el pan y las tortillas. Llena tu plato con guacamole y verduras asadas.",
    icon: '🎉'
  },
  {
    id: 'alcohol-guide',
    title: 'Alcohol: La Guía de Reducción de Daños',
    type: 'guide',
    content: "La recomendación ideal es evitar el alcohol, ya que tu hígado detiene la quema de grasa para procesarlo. Si decides beber en una ocasión especial, elige con inteligencia para minimizar el impacto. Tus mejores opciones (1 copa, con estricta moderación) son:\n\n1. **Destilados Puros:** Tequila (blanco), Mezcal, Whiskey, mezclados únicamente con agua mineral.\n2. **Vino Tinto Seco.**\n\n**Las Peores Opciones (A Evitar):** Cerveza (“pan líquido”) y cualquier cóctel o licor dulce.",
    icon: '🍷'
  }
];
