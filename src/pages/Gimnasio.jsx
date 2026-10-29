import { useState } from "react";
import { trainingProgram, exerciseLibrary } from "../data/trainingProgram";
import { useProgramState } from "../hooks/useProgramState";
import { SaveStatus } from "../components/common/SaveStatus";
import ExerciseTimer from "../components/gimnasio/ExerciseTimer";
function Illustration({ exercise }) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <p className="p-4 text-sm text-slate-400 border border-slate-700 rounded-xl">
      Ilustración no disponible. Sigue las instrucciones o elige la alternativa.
    </p>
  ) : (
    <img
      loading="lazy"
      src={exercise.imageUrl}
      alt={`Ilustración de ${exercise.name}`}
      onError={() => setFailed(true)}
      className="w-full h-52 object-contain bg-slate-100 rounded-xl"
    />
  );
}
export default function Gimnasio() {
  const [progress, setProgress, status, retry] = useProgramState("gym", {});
  const [week, setWeek] = useState(1);
  const [day, setDay] = useState(1);
  const [round, setRound] = useState(1);
  const [timerPhase, setTimerPhase] = useState({});
  const routine = trainingProgram.weeks[week - 1].days[day - 1];
  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8 space-y-6 pb-16">
      <header>
        <h1 className="text-3xl font-bold">Gimnasio digital</h1>
        <p className="text-slate-300 mt-3">
          15–20 minutos a tu ritmo. Sin equipo obligatorio y sin saltos en las
          rutinas base.
        </p>
      </header>
      <div className="p-5 bg-slate-900 border border-slate-700 rounded-2xl space-y-3">
        <p>
          Calienta 3 minutos con marcha suave y movilidad cómoda. Haz dos
          vueltas de cuatro ejercicios: hasta 30 segundos de movimiento y 45
          segundos de descanso por ejercicio. Termina con 2 minutos suaves.
          Puedes hacer una sola vuelta al empezar.
        </p>
        <p className="text-sm text-amber-200">
          Entrena en días separados, dejando al menos un día de recuperación
          entre sesiones de fuerza. Repite una semana si lo necesitas; el
          calendario no obliga a aumentar dificultad.
        </p>
        <p className="text-xs text-slate-400">
          Detén la sesión si aparece dolor, mareo, dolor de pecho o falta de
          aire inusual. Dolor de pecho, desmayo o dificultad respiratoria
          importante requieren atención urgente. Si tienes enfermedad
          cardiovascular, renal, diabetes, embarazo o limitaciones articulares,
          consulta antes de empezar.
        </p>
      </div>
      <div className="flex flex-wrap gap-4">
        <label>
          Semana{" "}
          <select
            aria-label="Semana"
            className="bg-slate-800 rounded-lg p-3"
            value={week}
            onChange={(e) => {
              setWeek(+e.target.value);
              setRound(1);
            }}
          >
            {trainingProgram.weeks.map((w) => (
              <option key={w.week} value={w.week}>
                {w.week}
              </option>
            ))}
          </select>
        </label>
        <label>
          Sesión{" "}
          <select
            aria-label="Sesión"
            className="bg-slate-800 rounded-lg p-3"
            value={day}
            onChange={(e) => {
              setDay(+e.target.value);
              setRound(1);
            }}
          >
            {[1, 2, 3].map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </label>
        <label>
          Vuelta{" "}
          <select
            aria-label="Vuelta"
            className="bg-slate-800 rounded-lg p-3"
            value={round}
            onChange={(e) => setRound(+e.target.value)}
          >
            {[1, 2].map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </label>
      </div>
      <SaveStatus status={status} retry={retry} />
      <h2 className="text-xl font-bold">
        {trainingProgram.weeks[week - 1].title} · {routine.title}
      </h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {routine.routine.map((slot) => {
          const e = slot.variants.cuerpo;
          const key = `${week}-${day}-${round}-${e.id}`;
          const rest = timerPhase[key] === "rest";
          return (
            <article
              key={key}
              className="bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-4"
            >
              <Illustration exercise={e} />
              <h3 className="text-xl font-bold">{e.name}</h3>
              <p className="text-slate-300 text-sm">{e.description}</p>
              <p className="text-teal-200 text-sm">
                {e.repetitions}; termina antes de perder técnica. Descansa 45–60
                segundos o más si lo necesitas.
              </p>
              <p className="text-slate-400 text-sm">
                <strong>Menor impacto:</strong> {e.alternative}
              </p>
              <p className="text-sm font-semibold">
                {rest
                  ? "Descanso · 45 segundos"
                  : "Movimiento · hasta 30 segundos"}
              </p>
              <ExerciseTimer
                key={`${key}-${rest}`}
                duration={rest ? 45 : 30}
                onComplete={() => {
                  if (!rest) setTimerPhase((p) => ({ ...p, [key]: "rest" }));
                }}
              />
              {rest && (
                <button
                  className="underline text-teal-300"
                  onClick={() =>
                    setTimerPhase((p) => ({ ...p, [key]: "work" }))
                  }
                >
                  Volver al movimiento
                </button>
              )}
              <label className="flex items-center gap-3 py-3">
                <input
                  className="w-5 h-5 accent-teal-500"
                  type="checkbox"
                  disabled={["loading","unavailable"].includes(status)}
                  checked={!!progress[key]}
                  onChange={() =>
                    setProgress((prev) => ({ ...prev, [key]: !prev[key] }))
                  }
                />
                Marcar esta serie como realizada
              </label>
            </article>
          );
        })}
      </div>
      <p className="text-sm text-slate-400">
        Puedes usar tus mancuernas en un plan indicado para ti. Esta versión
        utiliza las demostraciones de peso corporal disponibles; no anuncia
        videos ni variantes con equipo que aún no existen.
      </p>
      <details className="bg-slate-900 rounded-2xl p-5">
        <summary className="cursor-pointer font-bold p-2">
          Ver las 12 ilustraciones y variantes opcionales
        </summary>
        <p className="text-sm text-slate-400 mt-3">
          Las variantes avanzadas no son un requisito del programa. Las imágenes
          son ilustrativas y no sustituyen una revisión de técnica.
        </p>
        <div className="grid sm:grid-cols-2 gap-5 mt-4">
          {exerciseLibrary.map((e) => (
            <article
              key={e.id}
              className="space-y-3 border border-slate-700 p-4 rounded-xl"
            >
              <Illustration exercise={e} />
              <h3 className="font-bold">
                {e.name}
                {e.advanced ? " · Opcional avanzada" : ""}
              </h3>
              <p className="text-sm">{e.description}</p>
              <p className="text-sm text-teal-200">
                Alternativa: {e.alternative}
              </p>
            </article>
          ))}
        </div>
      </details>
    </div>
  );
}
