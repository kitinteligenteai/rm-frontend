import { useState } from "react";
import { Link } from "react-router-dom";
const HELP = {
  desayuno: {
    title: "No sé qué desayunar",
    text: "Empieza por lo disponible: huevo o yogur natural, fruta y avena o pan integral son opciones sencillas. Adapta porciones y alimentos a tu hambre, tolerancia y necesidades. Guarda una opción en el planeador para reducir decisiones mañana.",
    to: "/plataforma/planeador",
    label: "Organizar mi desayuno",
  },
  hoy: {
    title: "¿Qué hago hoy?",
    text: "Elige una sola tarea de tu día actual: organiza tu siguiente comida, haz movimiento cómodo o registra un aprendizaje. Si regresaste después de una pausa, continúa desde lo guardado; no hace falta compensar los días que no entraste.",
    to: "/plataforma/planeador",
    label: "Resolver mi siguiente comida",
  },
  antojos: {
    title: "Tengo antojo",
    text: "Haz una pausa para reconocer qué necesitas. Si tienes hambre, prepara una comida o colación suficiente. Puedes incluir algo que disfrutes en una porción que te resulte cómoda; no necesitas compensarlo con ayuno ni ejercicio.",
    to: "/plataforma/recetas",
    label: "Buscar una opción",
  },
  fuera: {
    title: "Voy a comer fuera",
    text: "Revisa el menú y elige una comida que incluya verduras, una fuente de proteína y una porción de cereal, legumbre o tubérculo según tus necesidades. Pide aderezos aparte si te ayuda. Una comida social cabe en tu semana.",
    to: "/plataforma/social",
    label: "Ver guía social",
  },
  dificil: {
    title: "Hoy es un día difícil",
    text: "Reduce el plan a una sola acción: organiza tu siguiente comida o prepara algo sencillo. Descansar también cuenta. Retoma en la próxima oportunidad sin castigarte ni borrar tus avances.",
    to: "/plataforma/planeador",
    label: "Resolver mi siguiente comida",
  },
};
export default function DanteSupport({ gap, current, completed }) {
  const [topic, setTopic] = useState(null);
  const selected = HELP[topic];
  return (
    <section
      aria-label="Acompañamiento Dante"
      className="bg-slate-900 border border-slate-700 rounded-2xl p-5 sm:p-7 space-y-4"
    >
      <div>
        <h2 className="text-xl font-bold text-white">
          Dante · Tu apoyo práctico
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Guía de orientación con opciones preparadas. No es un chat de IA ni
          atención médica.
        </p>
      </div>
      <p className="text-slate-200">
        {gap >= 3
          ? `Tu último avance guardado fue hace ${gap} días. Conservas ${completed} días completados. Retoma en el día ${current}, a tu ritmo.`
          : completed
            ? `Ya completaste ${completed} días. Sigue con una acción del día ${current}.`
            : "Comienza con una acción pequeña. Solo contaremos lo que tú registres."}
      </p>
      {gap >= 3 && (
        <p className="text-sm text-teal-200">
          {gap >= 14
            ? "Después de dos semanas o más, repite una sesión sencilla y revisa lo que necesitas para tu próxima comida. Puedes retomar la primera semana del gimnasio."
            : gap >= 7
              ? "Vuelve con una sola acción y una sesión de movimiento que ya conozcas. Conserva tu ritmo anterior antes de aumentar dificultad."
              : "Elige la tarea más fácil del día guardado. No hay días perdidos que debas recuperar de golpe."}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {Object.entries(HELP).map(([id, h]) => (
          <button
            key={id}
            aria-pressed={topic === id}
            onClick={() => setTopic(id)}
            className="rounded-xl border border-slate-600 px-3 py-3 text-sm text-teal-200 hover:bg-slate-800"
          >
            {h.title}
          </button>
        ))}
      </div>
      {selected && (
        <div
          className="rounded-xl bg-slate-950 p-4 space-y-3"
          aria-live="polite"
        >
          <p>{selected.text}</p>
          <Link className="text-teal-300 underline" to={selected.to}>
            {selected.label}
          </Link>
        </div>
      )}
    </section>
  );
}
