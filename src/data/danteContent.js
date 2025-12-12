// src/data/danteContent.js
// Base de conocimiento del Chef Dante (v4.0 - AI Coach Proactivo)

export const danteMessages = {
  // 1. Mensajes por Hora del Día
  morning: [
    { message: "¡Buenos días! Un vaso de agua con sal ahora activará tu energía.", action: null },
    { message: "Tu primera comida define tu día. Prioriza proteína.", action: "/plataforma/recetas" },
    { message: "La mañana es perfecta para moverte. ¿Ya viste tu rutina?", action: "/plataforma/gimnasio" }
  ],
  evening: [
    { message: "Cenar ligero ayuda a dormir profundo. Intenta cenar 2 horas antes de dormir.", action: "/plataforma/recetas" },
    { message: "Si tienes antojo nocturno, suele ser sed o aburrimiento. Prueba un té.", action: null },
    { message: "Prepara tu éxito de mañana revisando tu plan.", action: "/plataforma/planeador" }
  ],
  
  // 2. Mensajes Educativos (Random)
  nutrition: [
    { message: "No contamos calorías, contamos nutrientes. Come hasta saciarte.", action: "/plataforma/biblioteca" },
    { message: "El vinagre de manzana antes de comer reduce el pico de insulina.", action: null },
    { message: "Las grasas buenas son energía limpia. Aguacate, aceite de oliva, nueces.", action: null }
  ],
  hydration: [
    { message: "¿Dolor de cabeza? A menudo es falta de sodio. Toma suero casero.", action: null },
    { message: "A veces el hambre es sed. Bebe agua antes de decidir comer.", action: null }
  ],
  motivation: [
    { message: "La constancia vence a la intensidad. Sigue adelante.", action: null },
    { message: "Tu cuerpo es un laboratorio, no una cuenta de banco. Dale calidad.", action: null }
  ],

  // 3. MENSAJES PROACTIVOS (Contextuales)
  // Estos se activan por lógica, no por azar
  proactive: [
    { id: 'welcome', message: "¡Bienvenido! Tu transformación empieza hoy. Explora tu planeador.", action: "/plataforma/planeador" },
    { id: 'log_weight', message: "Veo que no has registrado tu peso. Lo que se mide, se mejora.", action: "/plataforma/bitacora" },
    { id: 'streak_danger', message: "Llevas 3 días sin entrar. ¡No rompas la cadena!", action: "/plataforma/panel-de-control" },
    { id: 'planner_check', message: "Tu éxito depende de la anticipación. ¿Ya tienes tu lista de súper?", action: "/plataforma/planeador" }
  ]
};