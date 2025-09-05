// Contenido COMPLETO, UNIFICADO y VERIFICADO para: rm-frontend/src/data/trainingProgram.js

export const trainingProgram = {
  weeks: [
    // ==================================================================
    // SEMANA 1: ACONDICIONAMIENTO FUNDAMENTAL
    // ==================================================================
    {
      week: 1,
      title: "Semana de Acondicionamiento Fundamental",
      days: [
        {
          day: 1,
          title: "Tren Superior y Core",
          routine: [
            {
              slot: "Empuje Horizontal",
              variants: {
                cuerpo: { name: "Lagartija Inclinada (en pared o mesa)", description: "Coloca las manos en una superficie elevada, más anchas que tus hombros. Mantén el cuerpo recto desde la cabeza hasta los talones. Baja el pecho hacia la superficie de forma controlada y empuja para volver al inicio.", videoId: "VIMEO_LINK_1_1_1" },
                mancuernas: { name: "Press de Suelo con Mancuernas", description: "Acuéstate en el suelo con las rodillas flexionadas. Sostén una mancuerna en cada mano a los lados de tu pecho, con los codos tocando el suelo. Empuja las mancuernas hacia arriba hasta que tus brazos estén extendidos. Baja lentamente.", videoId: "VIMEO_LINK_1_1_2" }
              }
            },
            {
              slot: "Tracción Horizontal",
              variants: {
                cuerpo: { name: "Remo con Toalla", description: "Siéntate en el suelo con las piernas extendidas. Pasa una toalla por la planta de tus pies. Sujeta los extremos de la toalla y, manteniendo la espalda recta, jala hacia tu abdomen, apretando los omóplatos.", videoId: "VIMEO_LINK_1_2_1" },
                mancuernas: { name: "Remo a una mano con Mancuerna (Remo Serrucho)", description: "Apoya una rodilla y una mano en una silla o banco. Con la espalda recta, sostén una mancuerna con el otro brazo extendido. Jala la mancuerna hacia tu cadera, manteniendo el codo pegado al cuerpo. Baja de forma controlada.", videoId: "VIMEO_LINK_1_2_2" }
              }
            },
            {
              slot: "Core (Anti-extensión)",
              variants: {
                cuerpo: { name: "Plancha Frontal", description: "Apoya los antebrazos y las puntas de los pies en el suelo. Mantén el cuerpo en una línea perfectamente recta, apretando el abdomen y los glúteos. Evita que tu cadera se caiga o se eleve demasiado.", videoId: "VIMEO_LINK_1_3_1" }
              }
            }
          ]
        },
        {
          day: 2,
          title: "Tren Inferior y Estabilidad",
          routine: [
            {
              slot: "Dominante de Rodilla",
              variants: {
                cuerpo: { name: "Sentadilla en Silla (Box Squat)", description: "Párate frente a una silla con los pies al ancho de los hombros. Empuja la cadera hacia atrás y baja de forma controlada hasta que tus glúteos toquen ligeramente la silla. Levántate sin impulsarte.", videoId: "VIMEO_LINK_1_4_1" },
                mancuernas: { name: "Sentadilla Copa (Goblet Squat)", description: "Sostén una mancuerna verticalmente contra tu pecho con ambas manos. Manteniendo la espalda recta, baja la cadera por debajo de tus rodillas. Empuja con los talones para volver a la posición inicial.", videoId: "VIMEO_LINK_1_4_2" }
              }
            },
            {
              slot: "Dominante de Cadera",
              variants: {
                cuerpo: { name: "Puente de Glúteos", description: "Acuéstate boca arriba con las rodillas flexionadas y los pies apoyados en el suelo. Eleva la cadera hacia el techo, apretando fuertemente los glúteos en la parte superior. Baja de forma controlada.", videoId: "VIMEO_LINK_1_5_1" }
              }
            }
          ]
        },
        {
          day: 3,
          title: "Full Body y Resistencia",
          routine: [
            { slot: "Empuje Horizontal", variants: { cuerpo: { name: "Lagartija Inclinada", description: "Repite el ejercicio del Día 1, intentando usar una superficie un poco más baja para aumentar la dificultad.", videoId: "VIMEO_LINK_1_1_1" } } },
            { slot: "Dominante de Rodilla", variants: { cuerpo: { name: "Sentadilla en Silla", description: "Repite el ejercicio del Día 2, enfocándote en una ejecución más lenta y controlada.", videoId: "VIMEO_LINK_1_4_1" } } },
            { slot: "Core (Anti-extensión)", variants: { cuerpo: { name: "Plancha Frontal", description: "Repite el ejercicio del Día 1, intenta mantener la posición por 5-10 segundos más que la vez anterior.", videoId: "VIMEO_LINK_1_3_1" } } }
          ]
        }
      ]
    },
    // ==================================================================
    // SEMANA 2: INTENSIFICACIÓN
    // ==================================================================
    {
      week: 2,
      title: "Semana de Intensificación",
      days: [
        {
          day: 1,
          title: "Enfoque: Tren Superior",
          routine: [
            {
              slot: "Empuje Vertical",
              variants: {
                cuerpo: { name: "Pike Push-up (Pica)", description: "Colócate en posición de 'V' invertida. Baja la parte superior de tu cabeza hacia el suelo, manteniendo las piernas rectas. Empuja para volver al inicio. Trabaja hombros y tríceps.", videoId: "VIMEO_LINK_2_1_1" },
                mancuernas: { name: "Press Militar Sentado", description: "Sentado en una silla con la espalda recta, sostén las mancuernas a la altura de los hombros. Empújalas hacia arriba hasta extender los brazos por completo. Baja controladamente.", videoId: "VIMEO_LINK_2_1_2" }
              }
            },
            {
              slot: "Tracción Horizontal",
              variants: {
                cuerpo: { name: "Remo con Toalla", description: "Misma ejecución que en la Semana 1, pero intenta mantener la contracción por 2 segundos en cada repetición.", videoId: "VIMEO_LINK_1_2_1" },
                mancuernas: { name: "Remo Serrucho", description: "Misma ejecución que en la Semana 1, pero intenta usar un poco más de peso o hacer más repeticiones.", videoId: "VIMEO_LINK_1_2_2" }
              }
            },
            {
              slot: "Accesorios de Brazo",
              variants: {
                mancuernas: { name: "Curl de Bíceps + Patada de Tríceps", description: "De pie, realiza un curl de bíceps. Luego, inclina el torso y realiza una patada de tríceps con el mismo brazo. Alterna brazos.", videoId: "VIMEO_LINK_2_2_2" }
              }
            }
          ]
        },
        {
          day: 2,
          title: "Enfoque: Tren Inferior",
          routine: [
            {
              slot: "Dominante de Rodilla (Unilateral)",
              variants: {
                cuerpo: { name: "Desplante Estático", description: "Da un paso largo hacia adelante. Baja la rodilla de atrás casi hasta tocar el suelo, manteniendo el torso erguido. Ambas piernas deben formar ángulos de 90 grados. Vuelve al inicio y cambia de pierna.", videoId: "VIMEO_LINK_2_3_1" },
                mancuernas: { name: "Desplante con Mancuernas", description: "Sostén una mancuerna en cada mano y realiza el desplante estático. El peso añadido aumentará la intensidad.", videoId: "VIMEO_LINK_2_3_2" }
              }
            },
            {
              slot: "Dominante de Cadera (Unilateral)",
              variants: {
                cuerpo: { name: "Puente de Glúteos a una pierna", description: "Realiza el puente de glúteos, pero con una pierna extendida en el aire. Concéntrate en no dejar caer la cadera del lado de la pierna elevada.", videoId: "VIMEO_LINK_2_4_1" }
              }
            }
          ]
        }
      ]
    },
    // ==================================================================
    // SEMANA 3: POTENCIA METABÓLICA
    // ==================================================================
    {
      week: 3,
      title: "Semana de Potencia Metabólica",
      days: [
        {
          day: 1,
          title: "Circuito Full Body",
          routine: [
            { slot: "Empuje", variants: { cuerpo: { name: "Lagartijas (en rodillas o completas)", description: "Intenta la versión más desafiante que puedas con buena forma. Mantén el core apretado.", videoId: "VIMEO_LINK_3_1_1" }, mancuernas: { name: "Press de Suelo con Mancuernas", description: "Aumenta el peso o las repeticiones respecto a la Semana 1.", videoId: "VIMEO_LINK_1_1_2" } } },
            { slot: "Tracción", variants: { mancuernas: { name: "Remo Renegado", description: "En posición de plancha con las manos sobre mancuernas, realiza un remo alternando cada brazo, sin rotar la cadera.", videoId: "VIMEO_LINK_3_2_2" } } },
            { slot: "Piernas", variants: { cuerpo: { name: "Sentadilla con Salto", description: "Realiza una sentadilla completa y explota en un salto vertical. Aterriza suavemente.", videoId: "VIMEO_LINK_3_3_1" }, mancuernas: { name: "Sentadilla Copa (Goblet Squat)", description: "Aumenta el peso o las repeticiones.", videoId: "VIMEO_LINK_1_4_2" } } },
            { slot: "Core", variants: { cuerpo: { name: "Escaladores (Mountain Climbers)", description: "En posición de plancha, lleva las rodillas al pecho de forma alterna y rápida.", videoId: "VIMEO_LINK_3_4_1" } } }
          ]
        }
      ]
    },
    // ==================================================================
    // SEMANA 4: RENDIMIENTO MÁXIMO
    // ==================================================================
    {
      week: 4,
      title: "Semana de Rendimiento Máximo",
      days: [
        {
          day: 1,
          title: "Reto de Resistencia",
          routine: [
            {
              slot: "Complejo de Ejercicios",
              variants: {
                cuerpo: { name: "El Burpee (versión sin salto)", description: "Desde una posición de pie, agáchate, coloca las manos en el suelo, camina con los pies hacia atrás a una plancha, camina de regreso y levántate. Es un ejercicio metabólico total.", videoId: "VIMEO_LINK_4_1_1" },
                mancuernas: { name: "Thruster con Mancuernas", description: "Sostén dos mancuernas en tus hombros. Realiza una sentadilla frontal y, al subir, usa el impulso para empujar las mancuernas sobre tu cabeza en un press militar. Un solo movimiento fluido.", videoId: "VIMEO_LINK_4_1_2" }
              }
            }
          ]
        }
      ]
    }
  ]
};
