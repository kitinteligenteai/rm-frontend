// src/data/danteContent.js
// Base de conocimiento del Chef Dante (v4.0 - AI Coach Proactivo)

export const danteMessages = {
  // 1. Mensajes por Hora del Día
  morning: [
    { message: "¡Buenos días! Un vaso de agua con sal ahora activará tu energía.", action: null },
    { message: "¿Ya rompiste el ayuno? Tu primera comida define tu día. Prioriza proteína.", action: "/plataforma/recetas" },
    { message: "La mañana es perfecta para moverte. ¿Ya viste tu rutina de hoy?", action: "/plataforma/gimnasio" }
  ],
  evening: [
    { message: "Cenar ligero ayuda a dormir profundo. Intenta cenar 2 horas antes de dormir.", action: "/plataforma/recetas" },
    { message: "Si tienes antojo nocturno, suele ser sed o aburrimiento. Prueba un té de canela.", action: null },
    { message: "Prepara tu éxito de mañana revisando tu plan en el Planeador.", action: "/plataforma/planeador" }
  ],
  
  // 2. Mensajes Educativos (Random)
  nutrition: [
    { message: "No contamos calorías, contamos nutrientes. Come hasta saciarte, no hasta llenarte.", action: "/plataforma/biblioteca" },
    { message: "El vinagre de manzana antes de comer reduce el pico de insulina.", action: null },
    { message: "Las grasas buenas son energía limpia. Aguacate, aceite de oliva, nueces. ¡Úsalas!", action: null }
  ],
  hydration: [
    { message: "¿Dolor de cabeza? A menudo es falta de sodio. Toma un suero casero.", action: null },
    { message: "A veces el hambre es sed disfrazada. Bebe un vaso de agua antes de decidir comer.", action: null }
  ],
  motivation: [
    { message: "La constancia vence a la intensidad. Sigue adelante, lo estás haciendo bien.", action: null },
    { message: "Tu cuerpo es un laboratorio, no una cuenta de banco. Dale calidad.", action: null }
  ],

  // 3. MENSAJES PROACTIVOS (Contextuales - Se activan por lógica)
  proactive: [
    { id: 'welcome', message: "¡Bienvenido! Tu transformación empieza hoy. Explora tu planeador para organizar tu semana.", action: "/plataforma/planeador" },
    { id: 'log_weight', message: "Veo que no has registrado tu peso recientemente. Lo que se mide, se mejora.", action: "/plataforma/bitacora" },
    { id: 'streak_danger', message: "Llevas unos días sin entrar. ¡No rompas la cadena! Retoma hoy.", action: "/plataforma/panel-de-control" },
    { id: 'planner_check', message: "Tu éxito depende de la anticipación. ¿Ya tienes tu lista de súper lista?", action: "/plataforma/planeador" }
  ]
};