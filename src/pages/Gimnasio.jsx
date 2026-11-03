import { useEffect, useRef, useState } from "react";
import {
  trainingProgram,
  exerciseLibrary,
  exercisesById,
  modalities,
  getRoutine,
} from "../data/trainingProgram";
import {
  defaultSelection,
  normalizeGym,
  validSelection,
  seriesKey,
  sessionKey,
  validCursor,
  startCursor,
  nextCursor,
  estimatedMinutes,
} from "../lib/gymJourney";
import { useProgramState } from "../hooks/useProgramState";
import { SaveStatus } from "../components/common/SaveStatus";
import ExerciseTimer from "../components/gimnasio/ExerciseTimer";
function IllustrationDialog({ exercise, onClose }) {
  const dialog = useRef(null);
  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);
  return (
    <dialog
      ref={dialog}
      onCancel={onClose}
      aria-label={`Ilustración ampliada: ${exercise.name}`}
      className="fixed inset-0 z-50 m-auto w-[calc(100%-2rem)] max-w-5xl max-h-[95dvh] overflow-auto bg-slate-950 text-white border border-slate-600 rounded-2xl shadow-2xl p-4 backdrop:bg-black/75"
    >
      <button
        autoFocus
        onClick={onClose}
        className="float-right px-4 py-3 rounded-lg bg-slate-700"
      >
        Cerrar imagen
      </button>
      <h2 className="text-lg font-bold p-3">{exercise.name}</h2>
      <img
        src={exercise.imageUrl}
        alt={`Postura ampliada de ${exercise.name}`}
        className="w-full"
      />
      <p className="p-3 text-sm">{exercise.description}</p>
    </dialog>
  );
}
function Illustration({ exercise, large = false }) {
  const [failed, setFailed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  return (
    <div>
      {failed ? (
        <p role="alert" className="p-4 rounded-xl bg-slate-800 text-sm">
          No cargó la ilustración de {exercise.name}. Lee las instrucciones o
          elige una alternativa.
        </p>
      ) : (
        <button
          className="block w-full rounded-xl overflow-hidden focus-visible:ring-2 focus-visible:ring-teal-300"
          onClick={() => setExpanded(true)}
          aria-label={`Ampliar ilustración de ${exercise.name}`}
        >
          <img
            loading={large ? "eager" : "lazy"}
            src={exercise.imageUrl}
            alt={`Ilustración de ${exercise.name}`}
            onError={() => setFailed(true)}
            className={`w-full object-contain bg-white ${large ? "max-h-80" : "h-44"}`}
          />
          <span className="block py-2 text-xs text-slate-300 bg-slate-800">
            Toca para ver la postura con detalle
          </span>
        </button>
      )}
      {expanded && (
        <IllustrationDialog
          exercise={exercise}
          onClose={() => setExpanded(false)}
        />
      )}
    </div>
  );
}
const button =
  "px-4 py-3 rounded-xl bg-slate-800 border border-slate-600 text-sm font-semibold disabled:opacity-50";
export default function Gimnasio() {
  const [stored, setStored, status, retry, resolve] = useProgramState(
    "gym",
    {},
  );
  const [draft, setDraft] = useState(null);
  const gym = normalizeGym(stored);
  const selection = validSelection(draft || gym.selection || defaultSelection);
  const { mode, week, day, rounds } = selection;
  const routine = getRoutine(week, day, mode);
  const plan = trainingProgram.weeks[week - 1];
  const cursor = validCursor(gym.cursor, selection) ? gym.cursor : null;
  const disabled = ["loading", "unavailable", "conflict"].includes(status);
  const finished = Object.keys(gym.sessions).length;
  const marked = routine.reduce(
    (sum, _, i) =>
      sum +
      Array.from({ length: rounds }, (_, r) =>
        gym.marks[seriesKey(selection, r + 1, i)] ? 1 : 0,
      ).reduce((a, b) => a + b, 0),
    0,
  );
  function update(fn) {
    setStored((previous) => fn(normalizeGym(previous)));
  }
  function choose(patch) {
    const next = validSelection({ ...selection, ...patch });
    setDraft(next);
    update((previous) => ({ ...previous, selection: next }));
  }
  function setCursor(next) {
    update((previous) => ({ ...previous, selection, cursor: next }));
  }
  function advance() {
    if (!cursor) return;
    update((previous) => ({
      ...previous,
      selection,
      marks:
        cursor.phase === "work"
          ? {
              ...previous.marks,
              [seriesKey(selection, cursor.round, cursor.index)]: {
                at: new Date().toISOString(),
                movement: current.id,
              },
            }
          : previous.marks,
      cursor: nextCursor(cursor, selection),
      sessions:
        cursor.phase === "cooldown"
          ? {
              ...previous.sessions,
              [sessionKey(selection)]: {
                at: new Date().toISOString(),
                selection,
              },
            }
          : previous.sessions,
    }));
  }
  const base = cursor ? routine[cursor.index] : null;
  const alternativeKey = base && `${sessionKey(selection)}:${base.id}`;
  const current =
    base &&
    (gym.alternatives[alternativeKey] && base.easierId
      ? {
          ...exercisesById[base.easierId],
          prescription: exercisesById[base.easierId].repetitions,
        }
      : base);
  const phase = cursor?.phase;
  const duration =
    phase === "warmup"
      ? 180
      : phase === "cooldown"
        ? 120
        : phase === "rest"
          ? base?.restSeconds
          : current?.workSeconds;
  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8 space-y-6 pb-16">
      <header>
        <p className="text-teal-300 text-sm font-semibold mb-2">
          TU ESPACIO DE MOVIMIENTO
        </p>
        <h1 className="text-3xl font-bold">Gimnasio digital</h1>
        <p className="text-slate-300 mt-3">
          Cuatro semanas, dos formas de entrenar. Tú eliges cuándo avanzar.
        </p>
      </header>
      <SaveStatus status={status} retry={retry} resolve={resolve} />
      <section
        aria-label="Preparar sesión"
        className="bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-5"
      >
        <fieldset disabled={disabled}>
          <legend className="font-semibold mb-3">
            ¿Cómo quieres entrenar?
          </legend>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(modalities).map(([id, label]) => (
              <button
                key={id}
                onClick={() => choose({ mode: id })}
                aria-pressed={mode === id}
                className={`${button} ${mode === id ? "bg-teal-950 border-teal-400 text-teal-200" : ""}`}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            ["Semana", week, "week", [1, 2, 3, 4]],
            ["Sesión", day, "day", [1, 2, 3]],
            ["Vueltas", rounds, "rounds", [1, 2]],
          ].map(([label, value, key, values]) => (
            <label key={key} className="text-sm">
              {label}
              <select
                disabled={disabled}
                aria-label={label}
                className="block bg-slate-800 rounded-lg p-3 mt-1 w-full"
                value={value}
                onChange={(e) => choose({ [key]: +e.target.value })}
              >
                {values.map((v) => (
                  <option key={v} value={v}>
                    {v}
                    {key === "rounds" && v === 1 ? " · inicio suave" : ""}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
        <div>
          <h2 className="text-xl font-bold">
            Semana {week} · {plan.title}
          </h2>
          <p className="text-slate-300 text-sm mt-2">{plan.focus}</p>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-slate-300">
          <span>
            {estimatedMinutes(selection)} min aprox. con calentamiento
          </span>
          <span>
            {marked}/{routine.length * rounds} series registradas
          </span>
          <span>{finished} sesiones registradas</span>
        </div>
        {mode === "mancuernas" && (
          <p className="text-sm text-teal-200">
            Usa mancuernas ligeras que puedas controlar sin contener el aire.
            Ten un apoyo firme a mano. No hace falta entrenar al fallo.
          </p>
        )}
        <p className="text-sm text-slate-400">
          Dos o tres sesiones semanales en días separados. Repite semana o
          sesión cuando quieras; volver después de una ausencia no borra tu
          avance.
        </p>
        {!cursor && (
          <button
            disabled={disabled}
            className="rounded-xl bg-teal-300 text-slate-950 font-bold px-5 py-4 w-full sm:w-auto disabled:opacity-50"
            onClick={() => setCursor(startCursor(selection))}
          >
            Preparar sesión guiada
          </button>
        )}
        {gym.cursor && !cursor && (
          <p className="text-sm text-amber-200">
            Tienes una sesión guardada en otra selección. Cambiar la selección
            conserva sus series; comenzar una nueva reemplaza el punto de
            continuación.
          </p>
        )}
      </section>
      {cursor && (
        <section
          aria-label="Sesión guiada"
          className="bg-slate-900 border border-teal-700 rounded-2xl p-5 sm:p-7 space-y-5"
        >
          <div className="flex flex-wrap justify-between gap-3">
            <p className="text-sm text-teal-300">
              Sesión {day} · {modalities[mode]} · Vuelta {cursor.round}/{rounds}
            </p>
            <button
              disabled={disabled}
              className="text-sm underline text-slate-300 p-1"
              onClick={() => setCursor(null)}
            >
              Salir de la guía
            </button>
          </div>
          <h2 className="text-2xl font-bold">
            {phase === "warmup"
              ? "Prepara el cuerpo"
              : phase === "cooldown"
                ? "Baja el ritmo"
                : phase === "rest"
                  ? "Recupera el aire"
                  : current.name}
          </h2>
          {["work", "rest"].includes(phase) ? (
            <>
              <p className="text-sm text-slate-400">
                Movimiento {cursor.index + 1} de {routine.length}
                {phase === "rest" ? ` · terminaste ${current.name}` : ""}
              </p>
              {phase === "work" && (
                <>
                  <Illustration key={current.id} exercise={current} large />
                  <p className="text-slate-200">{current.description}</p>
                  <p className="text-teal-200 font-semibold">
                    {current.prescription} · máximo {current.workSeconds} s, sin
                    apresurarte
                  </p>
                  <p className="text-sm text-slate-300">
                    Menor dificultad: {current.alternative}
                  </p>
                  {base.easierId && (
                    <button
                      disabled={disabled}
                      aria-pressed={!!gym.alternatives[alternativeKey]}
                      className={button}
                      onClick={() =>
                        update((p) => ({
                          ...p,
                          alternatives: {
                            ...p.alternatives,
                            [alternativeKey]: !p.alternatives[alternativeKey],
                          },
                        }))
                      }
                    >
                      {gym.alternatives[alternativeKey]
                        ? "Volver al movimiento propuesto"
                        : "Usar alternativa más sencilla"}
                    </button>
                  )}
                  <p className="text-xs text-amber-200">{current.warning}</p>
                </>
              )}
              {phase === "rest" && (
                <p className="text-slate-300">
                  Descansa 45–60 segundos o más si lo necesitas. El siguiente
                  movimiento espera tu confirmación.
                </p>
              )}
            </>
          ) : (
            <p className="text-slate-300">
              {phase === "warmup"
                ? "Marcha suave y movilidad cómoda de hombros, caderas y tobillos durante unos 3 minutos. Prepara tu espacio y apoyo."
                : "Camina lentamente o marcha suave durante 2 minutos. Recupera una respiración cómoda; no fuerces estiramientos."}
            </p>
          )}
          <p className="text-sm text-slate-400">
            El reloj vuelve en pausa al retomar. Registrar una serie depende de
            lo que tú hayas hecho.
          </p>
          <ExerciseTimer
            key={`${sessionKey(selection)}:${cursor.round}:${cursor.index}:${phase}:${current?.id}`}
            duration={duration}
            initialRemaining={cursor.remaining}
            onCheckpoint={(remaining) =>
              update((p) => ({ ...p, cursor: { ...cursor, remaining } }))
            }
          />
          <button
            disabled={disabled}
            className="rounded-xl bg-teal-300 text-slate-950 font-bold px-4 py-4 w-full disabled:opacity-50"
            onClick={advance}
          >
            {phase === "warmup"
              ? "Ya calenté, comenzar"
              : phase === "work"
                ? "Registrar serie y descansar"
                : phase === "rest"
                  ? "Continuar al siguiente paso"
                  : "Finalizar y guardar sesión"}
          </button>
        </section>
      )}
      <section aria-label="Movimientos de esta sesión">
        <h2 className="text-xl font-bold mb-4">Tu sesión, de un vistazo</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {routine.map((e, i) => (
            <article
              key={e.id}
              className="bg-slate-900 border border-slate-700 rounded-2xl p-4 space-y-3"
            >
              <Illustration key={e.id} exercise={e} />
              <h3 className="text-lg font-bold">
                {i + 1}. {e.name}
              </h3>
              <p className="text-sm text-slate-300">
                {e.prescription} · {rounds} {rounds === 1 ? "serie" : "series"}{" "}
                · descanso 45–60 s
              </p>
              <details>
                <summary className="text-teal-200 py-2 cursor-pointer">
                  Técnica y alternativa
                </summary>
                <p className="text-sm mt-2">{e.description}</p>
                <p className="text-sm mt-2 text-slate-300">
                  Menor dificultad: {e.alternative}
                </p>
                <p className="text-xs mt-2 text-amber-200">{e.warning}</p>
              </details>
              {Array.from({ length: rounds }, (_, r) => (
                <label key={r} className="flex gap-3 items-center py-2 text-sm">
                  <input
                    disabled={disabled}
                    type="checkbox"
                    className="w-5 h-5 accent-teal-400"
                    checked={!!gym.marks[seriesKey(selection, r + 1, i)]}
                    onChange={() =>
                      update((p) => ({
                        ...p,
                        marks: {
                          ...p.marks,
                          [seriesKey(selection, r + 1, i)]: p.marks[
                            seriesKey(selection, r + 1, i)
                          ]
                            ? false
                            : { at: new Date().toISOString(), movement: e.id },
                        },
                      }))
                    }
                  />
                  Serie {r + 1} realizada · {e.name}
                </label>
              ))}
            </article>
          ))}
        </div>
      </section>
      <details className="bg-slate-900 rounded-2xl p-5 border border-slate-700">
        <summary className="cursor-pointer font-bold py-2">
          Biblioteca de 20 movimientos y variantes
        </summary>
        <p className="text-sm text-slate-400 mt-3">
          Las opciones avanzadas están fuera de las rutinas iniciales. Las
          ilustraciones muestran posiciones; no son videos ni sustituyen una
          revisión de técnica.
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          {exerciseLibrary.map((e) => (
            <article
              key={e.id}
              className="border border-slate-700 p-4 rounded-xl space-y-3"
            >
              <Illustration exercise={e} />
              <h3 className="font-bold">{e.name}</h3>
              <p className="text-xs text-teal-200">
                {modalities[e.modality]} · {e.difficulty}
                {e.advanced ? " · fuera del plan base" : ""}
              </p>
              <p className="text-sm">{e.description}</p>
              <p className="text-sm text-slate-300">
                Alternativa: {e.alternative}
              </p>
            </article>
          ))}
        </div>
      </details>
      <aside className="text-xs text-slate-400 border-t border-slate-700 pt-5">
        <p>
          Detén el ejercicio ante dolor, mareo o falta de aire inusual. Dolor de
          pecho, desmayo o dificultad respiratoria importante requieren atención
          urgente. Si tienes una condición cardiovascular, renal, diabetes,
          embarazo o limitaciones articulares, solicita orientación profesional
          antes de empezar. Programa general para adultos; no es rehabilitación
          ni prescripción individual.
        </p>
      </aside>
    </div>
  );
}
