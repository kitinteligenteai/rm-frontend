// Stable movement IDs are independent of week, equipment and display name.
const assetBase = import.meta.env?.VITE_GYM_ASSET_BASE_URL || "/media/gym/";
const image = (file) => assetBase.replace(/\/$/, "") + "/" + file + ".webp";
function movement(id, name, file, description, alternative, options = {}) {
  return {
    id,
    name,
    imageUrl: image(file),
    file,
    description,
    alternative,
    modality: "cuerpo",
    difficulty: "Inicial",
    repetitions: "6–10 repeticiones cómodas",
    workSeconds: 30,
    restSeconds: 45,
    warning:
      "Respira sin contener el aire. Detente antes de perder la técnica.",
    ...options,
  };
}
export const exerciseLibrary = [
  movement(
    "wall",
    "Lagartija de pared",
    "wall-v2",
    "Manos a la altura del pecho sobre una pared firme. Cuerpo alineado; acerca el pecho flexionando los codos en diagonal y empuja mientras exhalas.",
    "Acércate a la pared y reduce el recorrido.",
  ),
  movement(
    "plank",
    "Plancha frontal",
    "rm002_plancha_frontal",
    "Antebrazos bajo hombros. Apoya rodillas o puntas de los pies, mantén espalda neutra y respira sin hundir la cintura.",
    "Apoya antebrazos en la pared y da un paso atrás.",
    {
      repetitions: "10–20 segundos",
      workSeconds: 20,
      difficulty: "Intermedia",
      advanced: true,
    },
  ),
  movement(
    "deadbug",
    "Dead bug",
    "rm003_dead_bug",
    "Boca arriba. Mueve lentamente un brazo y la pierna contraria sin arquear la zona lumbar. Alterna lados.",
    "Pies apoyados; desliza un talón por vez.",
    { repetitions: "3–5 por lado" },
  ),
  movement(
    "chair",
    "Sentadilla en silla",
    "rm004_sentadilla_en_silla",
    "Silla estable contra la pared. Lleva cadera atrás, toca suavemente el asiento y levántate con control. Rodillas siguen la dirección de los pies; mantén el pie completo apoyado.",
    "Silla más alta, ayuda de manos y recorrido corto sin dolor.",
  ),
  movement(
    "bridge",
    "Puente de glúteos",
    "rm005_puente_de_gluteos",
    "Boca arriba, rodillas flexionadas y pies apoyados. Eleva cadera al exhalar sin arquear la espalda; baja con control.",
    "Eleva menos la cadera o contrae suavemente sin elevarla.",
  ),
  movement(
    "bird",
    "Bird dog",
    "rm006_bird_dog",
    "En cuatro apoyos, extiende brazo y pierna opuestos lentamente sin girar la cadera ni arquear la espalda.",
    "Mueve solo un brazo o una pierna, con apoyo acolchado.",
    { repetitions: "3–5 por lado" },
  ),
  movement(
    "lunge",
    "Desplante estático",
    "rm007_desplante_estatico",
    "Junto a un apoyo firme, coloca un pie delante del otro. Flexiona poco ambas rodillas y vuelve con control; termina un lado y cambia.",
    "Sentadilla en silla. No es necesario acercar la rodilla al suelo.",
    {
      easierId: "chair",
      repetitions: "3–5 por lado",
      workSeconds: 45,
      difficulty: "Intermedia",
    },
  ),
  movement(
    "singlebridge",
    "Puente a una pierna",
    "rm008_puente_de_gluteos_a_una_pierna",
    "Solo si el puente bilateral es cómodo: eleva un pie y sube la cadera sin inclinarla. Cambia de lado.",
    "Puente con ambos pies apoyados.",
    {
      easierId: "bridge",
      advanced: true,
      difficulty: "Intermedia",
      repetitions: "3–5 por lado",
    },
  ),
  movement(
    "pushup",
    "Lagartija tradicional",
    "rm009_lagartija_tradicional",
    "Manos bajo hombros, tronco alineado y codos en diagonal. Baja y empuja sin dolor ni hundir la cintura.",
    "Lagartija de pared.",
    { easierId: "wall", advanced: true, difficulty: "Avanzada" },
  ),
  movement(
    "jump",
    "Sentadilla con salto",
    "rm010_sentadilla_con_salto",
    "Opción de impacto fuera del programa base. Requiere tolerar sentadillas y aterrizar con control, sin dolor.",
    "Sentadilla en silla sin salto.",
    {
      easierId: "chair",
      advanced: true,
      difficulty: "Avanzada",
      warning:
        "No se propone a principiantes. Evita saltos con dolor articular, limitación de equilibrio o de suelo pélvico.",
    },
  ),
  movement(
    "prone",
    "Elevación prona suave",
    "rm011_elevacion_prona",
    "Boca abajo, mirada al suelo. Eleva ligeramente el pecho, sin forzar cuello ni zona lumbar; respira y baja despacio.",
    "De pie, junta suavemente los omóplatos sin arquear la espalda.",
    { repetitions: "6 elevaciones pequeñas" },
  ),
  movement(
    "march",
    "Marcha en sitio",
    "march-v2",
    "Cerca de un apoyo, alterna pasos suaves, sin saltos. Mantén un ritmo que permita hablar con comodidad.",
    "Marcha sentada en una silla estable.",
    {
      repetitions: "30 segundos",
      warning:
        "Usa apoyo si el equilibrio lo requiere. No eleves las rodillas más de lo cómodo.",
    },
  ),
  movement(
    "db-floor",
    "Press de suelo",
    "db-floor",
    "Boca arriba con rodillas flexionadas. Baja las mancuernas hasta apoyar suavemente los brazos en el suelo, codos en diagonal. Exhala al empujar; muñecas rectas y hombros apoyados.",
    "Mancuernas más ligeras o lagartija de pared.",
    { modality: "mancuernas", easierId: "wall" },
  ),
  movement(
    "db-row",
    "Remo con apoyo",
    "db-row",
    "Apoya una mano en una superficie firme y deja ambos pies en el suelo. Inclina el tronco desde la cadera, espalda neutra. Lleva la mancuerna hacia la cadera sin girarte; completa ambos lados.",
    "Menos peso, menor inclinación y recorrido cómodo.",
    {
      modality: "mancuernas",
      repetitions: "4–6 por lado",
      workSeconds: 45,
      warning:
        "Usa banco o apoyo firme que no vuelque ni se deslice; nunca una silla con ruedas.",
    },
  ),
  movement(
    "db-goblet",
    "Sentadilla copa",
    "db-goblet",
    "Sostén una mancuerna cerca del pecho con ambas manos. Lleva la cadera atrás y flexiona las rodillas siguiendo los pies; sube al exhalar. No fuerces profundidad.",
    "Sentadilla en silla sin peso.",
    { modality: "mancuernas", easierId: "chair" },
  ),
  movement(
    "db-press",
    "Press militar sentado",
    "db-press",
    "En silla estable, pies apoyados. Desde la altura de los hombros, empuja mancuernas ligeras sobre la cabeza sin arquear la espalda; baja despacio.",
    "Menos peso y rango cómodo; si molesta elevar brazos, cambia por press de suelo.",
    {
      modality: "mancuernas",
      easierId: "db-floor",
      difficulty: "Intermedia",
      warning:
        "No continúes si aparece dolor de hombro. Evita contener el aire o empujar con la zona lumbar.",
    },
  ),
  movement(
    "db-curl",
    "Curl de bíceps",
    "db-curl",
    "De pie con rodillas suaves, brazos a los lados y palmas al frente. Flexiona los codos sin balancear el tronco; baja con control.",
    "Una mancuerna ligera por vez, o el mismo gesto sin carga.",
    { modality: "mancuernas" },
  ),
  movement(
    "db-triceps",
    "Patada de tríceps con apoyo",
    "db-triceps",
    "Una mano sobre apoyo firme, espalda neutra. Con el otro brazo junto al torso y codo flexionado, extiende el antebrazo hacia atrás sin mover el hombro. Repite al otro lado.",
    "Menor peso o sin peso; reduce el recorrido sin dolor.",
    {
      modality: "mancuernas",
      repetitions: "4–6 por lado",
      workSeconds: 45,
      difficulty: "Intermedia",
    },
  ),
  movement(
    "db-lunge",
    "Desplante con mancuerna y apoyo",
    "db-lunge",
    "Sujeta un apoyo firme con una mano y una mancuerna ligera con la otra. Pies separados adelante y atrás. Flexiona poco ambas rodillas sin perder equilibrio; cambia de lado.",
    "Desplante sin carga con apoyo, o sentadilla en silla.",
    {
      modality: "mancuernas",
      easierId: "lunge",
      repetitions: "3–5 por lado",
      workSeconds: 45,
      difficulty: "Intermedia",
      warning:
        "La estabilidad va antes que la carga. Retira la mancuerna si necesitas ambas manos para apoyarte.",
    },
  ),
  movement(
    "db-rdl",
    "Peso muerto rumano",
    "db-rdl",
    "De pie con mancuernas ligeras junto a muslos y rodillas suaves. Lleva cadera atrás; las pesas bajan cerca de las piernas solo hasta donde mantengas espalda neutra. Vuelve a erguirte al exhalar.",
    "Practica la bisagra sin peso, o cambia por puente de glúteos.",
    {
      modality: "mancuernas",
      easierId: "bridge",
      warning:
        "No busques tocar el suelo. Detente ante dolor lumbar y reduce recorrido o elige la alternativa.",
    },
  ),
];
export const exercisesById = Object.fromEntries(
  exerciseLibrary.map((e) => [e.id, e]),
);
export const modalities = {
  cuerpo: "Sin equipo",
  mancuernas: "Con mancuernas",
};
const plans = [
  {
    title: "Familiarización y técnica",
    focus:
      "Conoce los movimientos y elige una carga ligera. Deja al menos 3 repeticiones posibles sin hacer; puedes comenzar con una vuelta.",
    reps: "6–8 repeticiones",
    work: 30,
    cuerpo: [
      ["chair", "wall", "bridge", "march"],
      ["chair", "deadbug", "bird", "wall"],
      ["chair", "bridge", "wall", "bird"],
    ],
    mancuernas: [
      ["db-goblet", "db-floor", "db-row", "march"],
      ["db-rdl", "db-row", "db-floor", "deadbug"],
      ["db-goblet", "db-floor", "db-row", "db-curl"],
    ],
  },
  {
    title: "Consolidación y control",
    focus:
      "Repite la carga cómoda. Baja con control; prueba un movimiento nuevo solo si su alternativa ya se siente estable.",
    reps: "6–8 repeticiones controladas",
    work: 30,
    cuerpo: [
      ["chair", "wall", "bird", "march"],
      ["lunge", "bridge", "deadbug", "wall"],
      ["chair", "bridge", "prone", "deadbug"],
    ],
    mancuernas: [
      ["db-goblet", "db-row", "db-press", "march"],
      ["db-rdl", "db-floor", "db-row", "db-triceps"],
      ["db-goblet", "db-floor", "db-curl", "bird"],
    ],
  },
  {
    title: "Un paso gradual, si estás listo",
    focus:
      "Si terminaste dos sesiones con técnica cómoda, añade 1–2 repeticiones dentro del rango. Mantén el peso; repetir la semana anterior también es avanzar.",
    reps: "8–10, o conserva 6–8",
    work: 40,
    cuerpo: [
      ["chair", "wall", "lunge", "bird"],
      ["bridge", "wall", "deadbug", "march"],
      ["chair", "bird", "prone", "wall"],
    ],
    mancuernas: [
      ["db-goblet", "db-row", "db-floor", "db-lunge"],
      ["db-rdl", "db-row", "db-press", "deadbug"],
      ["db-goblet", "db-floor", "db-curl", "db-triceps"],
    ],
  },
  {
    title: "Consolidación y autonomía",
    focus:
      "Elige lo que puedes sostener. Conserva el volumen que toleras; solo considera una carga mínima mayor cuando el rango alto sea cómodo en dos sesiones. No subas peso y repeticiones a la vez.",
    reps: "6–10 a tu ritmo",
    work: 40,
    cuerpo: [
      ["chair", "wall", "lunge", "deadbug"],
      ["bridge", "bird", "wall", "march"],
      ["chair", "bridge", "wall", "bird"],
    ],
    mancuernas: [
      ["db-goblet", "db-floor", "db-row", "march"],
      ["db-rdl", "db-press", "db-row", "deadbug"],
      ["db-goblet", "db-lunge", "db-floor", "db-curl"],
    ],
  },
];
export const trainingProgram = {
  weeks: plans.map((p, i) => ({
    week: i + 1,
    title: p.title,
    focus: p.focus,
    repetitions: p.reps,
    days: [1, 2, 3].map((day, d) => ({
      day,
      title: ["Cuerpo completo A", "Cuerpo completo B", "Cuerpo completo C"][d],
      routines: Object.fromEntries(
        Object.keys(modalities).map((mode) => [
          mode,
          p[mode][d].map((id) => ({
            ...exercisesById[id],
            workSeconds: ["march", "plank"].includes(id)
              ? exercisesById[id].workSeconds
              : Math.max(exercisesById[id].workSeconds, p.work),
            prescription: /por lado|segundos|pequeñas/.test(
              exercisesById[id].repetitions,
            )
              ? exercisesById[id].repetitions
              : p.reps,
          })),
        ]),
      ),
    })),
  })),
};
export function getRoutine(week, day, mode) {
  return (
    trainingProgram.weeks[week - 1]?.days[day - 1]?.routines[mode] ||
    trainingProgram.weeks[0].days[0].routines.cuerpo
  );
}
