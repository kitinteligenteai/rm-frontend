// src/data/danteContent.js
// Base de conocimiento del Chef Dante (v3.0 - Expandida)

export const danteMessages = {
  // Categorías de mensajes
  morning: [
    { message: "¡Buenos días! Empieza tu día con un vaso de agua grande y una pizca de sal de mar para despertar tus suprarrenales.", action: null },
    { message: "¿Hoy te toca ayuno? Recuerda que el hambre viene en olas. Bebe café negro o té y la ola pasará.", action: null },
    { message: "Tu primera comida define tu energía del día. Prioriza la proteína, no los carbohidratos.", action: "/plataforma/planeador" },
    { message: "La mañana es el mejor momento para moverte. Incluso 10 minutos de caminata activan tu metabolismo.", action: "/plataforma/gimnasio" }
  ],
  evening: [
    { message: "Cenar ligero ayuda a dormir profundo. Intenta cenar al menos 2 horas antes de irte a la cama.", action: "/plataforma/planeador" },
    { message: "Si tienes antojo nocturno, suele ser sed o aburrimiento. Prueba un té de canela o manzanilla.", action: null },
    { message: "Prepara tu éxito de mañana. ¿Ya revisaste qué vas a desayunar?", action: "/plataforma/planeador" },
    { message: "El sueño repara tus hormonas. Apaga pantallas 30 minutos antes de dormir para bajar el cortisol.", action: "/plataforma/bitacora" }
  ],
  nutrition: [
    { message: "Recuerda: No contamos calorías, contamos nutrientes. Come hasta quedar satisfecho, no lleno.", action: "/plataforma/biblioteca" },
    { message: "¿Vas a comer carbohidratos hoy? Usa el truco del vinagre: 1 cda de vinagre de manzana en agua antes de comer.", action: null },
    { message: "La proteína es la reina. Asegúrate de incluir una porción del tamaño de tu palma en cada comida.", action: "/plataforma/recetas" },
    { message: "Las grasas buenas (aguacate, aceite de oliva) son tus amigas. Te dan saciedad y energía estable.", action: "/plataforma/biblioteca" },
    { message: "Evita los aceites vegetales de semilla (canola, soya). Son inflamación líquida.", action: null }
  ],
  hydration: [
    { message: "A veces el hambre es solo sed disfrazada. Bebe un vaso de agua antes de decidir comer.", action: null },
    { message: "¿Dolor de cabeza? Podría ser falta de sodio. Un poco de agua mineral con limón y sal hace maravillas.", action: null },
    { message: "El café es genial, pero no rompas el ayuno con leche o azúcar. Mantenlo negro.", action: null }
  ],
  motivation: [
    { message: "La perfección es enemiga del progreso. Si fallaste en una comida, retoma en la siguiente.", action: null },
    { message: "No estás a dieta, estás entrenando a tu metabolismo. Paciencia y constancia.", action: "/plataforma/bitacora" },
    { message: "Lo que no se mide, no se mejora. ¿Ya registraste tu peso esta semana?", action: "/plataforma/bitacora" },
    { message: "Tu cuerpo es un laboratorio, no una cuenta bancaria. Dale buena química.", action: "/plataforma/biblioteca" }
  ]
};