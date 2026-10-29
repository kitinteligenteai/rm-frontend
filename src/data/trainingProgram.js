const base =
  "https://mgjzlohapnepvrqlxmpo.supabase.co/storage/v1/object/public/gimnasio/";
const exercise = (
  id,
  name,
  file,
  instructions,
  alternative,
  advanced = false,
) => ({
  id,
  name,
  imageUrl: base + file + ".png",
  description: instructions,
  alternative,
  advanced,
  repetitions:
    id === "plank"
      ? "10–20 segundos"
      : id === "march"
        ? "30 segundos"
        : "6–10 repeticiones cómodas",
  restSeconds: 45,
  workSeconds: 30,
});
export const exerciseLibrary = [
  exercise(
    "wall",
    "Lagartija de pared",
    "rm001_lagartija_de_pared",
    "Apoya manos a la altura del pecho en una pared firme. Mantén el cuerpo alineado, flexiona codos sin dolor y empuja mientras exhalas.",
    "Acércate a la pared y reduce el recorrido.",
  ),
  exercise(
    "plank",
    "Plancha frontal",
    "rm002_plancha_frontal",
    "Apoya antebrazos y rodillas o puntas de los pies. Mantén espalda neutra, respira y detén antes de perder postura.",
    "Plancha de pie con antebrazos en la pared; no aguantes la respiración.",
  ),
  exercise(
    "deadbug",
    "Dead bug",
    "rm003_dead_bug",
    "Boca arriba, abdomen suave pero firme. Mueve un brazo y la pierna contraria lentamente sin arquear la zona lumbar.",
    "Mantén pies apoyados y desliza un talón por vez.",
  ),
  exercise(
    "chair",
    "Sentadilla en silla",
    "rm004_sentadilla_en_silla",
    "Usa una silla estable contra la pared. Lleva cadera atrás, toca el asiento y levántate con control; rodillas siguen la dirección de los pies.",
    "Silla más alta, apoyo de manos y recorrido sin dolor.",
  ),
  exercise(
    "bridge",
    "Puente de glúteos",
    "rm005_puente_de_gluteos",
    "Boca arriba con rodillas flexionadas. Empuja con los pies y eleva cadera sin arquear la espalda. Exhala al subir.",
    "Eleva menos la cadera o realiza contracciones suaves sin elevarla.",
  ),
  exercise(
    "bird",
    "Bird dog",
    "rm006_bird_dog",
    "En cuatro apoyos, mantén espalda neutra. Extiende brazo y pierna opuestos sin girar la cadera. Alterna lentamente.",
    "Mueve solo un brazo o una pierna; usa apoyo acolchado.",
  ),
  exercise(
    "lunge",
    "Desplante estático",
    "rm007_desplante_estatico",
    "Con apoyo de una pared, separa los pies adelante y atrás. Flexiona poco ambas rodillas y vuelve con control.",
    "Repite la sentadilla en silla. No es obligatorio bajar hasta el suelo.",
    true,
  ),
  exercise(
    "singlebridge",
    "Puente a una pierna",
    "rm008_puente_de_gluteos_a_una_pierna",
    "Solo si el puente con ambos pies resulta cómodo: eleva una pierna y sube la cadera sin inclinarla.",
    "Puente con ambos pies apoyados.",
    true,
  ),
  exercise(
    "pushup",
    "Lagartija tradicional",
    "rm009_lagartija_tradicional",
    "Solo con técnica cómoda: manos bajo hombros, tronco alineado y codos en diagonal; baja sin dolor.",
    "Lagartija de pared o con rodillas apoyadas.",
    true,
  ),
  exercise(
    "jump",
    "Sentadilla con salto",
    "rm010_sentadilla_con_salto",
    "Variante de impacto opcional, fuera de las rutinas iniciales. Requiere tolerar sentadillas y aterrizar con control sin dolor.",
    "Sentadilla en silla sin salto. Evita impacto si hay dolor articular o limitación de equilibrio.",
    true,
  ),
  exercise(
    "prone",
    "Elevación prona suave",
    "rm011_elevacion_prona",
    "Boca abajo, mirada al suelo. Eleva ligeramente el pecho sin forzar cuello ni zona lumbar. Mantén una respiración cómoda.",
    "De pie, junta suavemente los omóplatos sin arquear la espalda.",
  ),
  exercise(
    "march",
    "Marcha en sitio",
    "rm012_marcha_en_sitio",
    "De pie cerca de un apoyo, alterna pasos suaves sin saltos. Mantén un ritmo que permita hablar con comodidad. La imagen repite una postura: alterna ambas piernas siguiendo estas instrucciones.",
    "Marcha sentada en silla estable.",
  ),
];
const byId = Object.fromEntries(exerciseLibrary.map((e) => [e.id, e]));
const routines = [
  ["wall", "chair", "bridge", "march"],
  ["deadbug", "wall", "chair", "bird"],
  ["chair", "bridge", "prone", "march"],
];
export const trainingProgram = {
  weeks: Array.from({ length: 4 }, (_, i) => ({
    week: i + 1,
    title: [
      "Empieza con comodidad",
      "Repite y conoce tu ritmo",
      "Consolida la técnica",
      "Elige lo que puedes sostener",
    ][i],
    days: routines.map((ids, d) => ({
      day: d + 1,
      title: [
        "Movimiento de cuerpo completo",
        "Control y estabilidad",
        "Fuerza suave",
      ][d],
      routine: ids.map((id) => ({
        slot: byId[id].name,
        variants: { cuerpo: byId[id], mancuernas: byId[id] },
      })),
    })),
  })),
};
// The existing illustrations cover body-weight movements. No invented dumbbell demonstration.
// Equipment selection never creates missing cards; weights are optional, not a progression requirement.
