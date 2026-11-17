export const TASK_IDS = ["plan", "move", "reflect"];
const themes = [
  "Organiza tu siguiente comida",
  "Hazlo sencillo",
  "Prepara una opción práctica",
  "Come con atención",
  "Practica fuera de casa",
  "Ajusta un día difícil",
  "Revisa lo que sí funcionó",
];
export function dayTasks(day) {
  return [
    { id: "plan", label: themes[(day - 1) % 7], to: "/plataforma/planeador" },
    {
      id: "move",
      label: "Elige movimiento cómodo o descanso si lo necesitas",
      to: "/plataforma/gimnasio",
    },
    {
      id: "reflect",
      label: "Anota un aprendizaje en tu bitácora",
      to: "/plataforma/bitacora",
    },
  ];
}
export function journey(rows = []) {
  const complete = rows
    .filter((r) =>
      TASK_IDS.every((id) => (r.tareas_completadas || []).includes(id)),
    )
    .map((r) => r.dia_numero);
  return {
    completed: complete.length,
    current:
      Array.from({ length: 28 }, (_, i) => i + 1).find(
        (d) => !complete.includes(d),
      ) || 28,
  };
}
export function absenceDays(rows = [], now = Date.now()) {
  const latest = Math.max(
    0,
    ...rows.map((r) => Date.parse(r.updated_at || r.created_at) || 0),
  );
  return latest ? Math.max(0, Math.floor((now - latest) / 86400000)) : null;
}
