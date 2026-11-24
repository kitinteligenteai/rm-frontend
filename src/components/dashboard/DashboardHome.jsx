import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { dayTasks, journey, absenceDays } from "../../data/journey";
import DanteSupport from "../dante/DanteSupport";
export default function DashboardHome({ user }) {
  const [rows, setRows] = useState([]);
  const [day, setDay] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loadFailed, setLoadFailed] = useState(false);
  useEffect(() => {
    let active = true;
    supabase
      .from("seguimiento_7dias")
      .select("*")
      .eq("user_id", user.id)
      .order("dia_numero")
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          setLoadFailed(true);
          setError(
            "No pudimos cargar tu progreso. Recarga antes de continuar.",
          );
        } else {
          setRows(data || []);
          setDay(journey(data || []).current);
        }
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user.id]);
  const state = journey(rows);
  const row = rows.find((r) => r.dia_numero === day);
  const tasks = dayTasks(day);
  const done = row?.tareas_completadas || [];
  const next = tasks.find((t) => !done.includes(t.id));
  async function toggle(id) {
    if (saving) return;
    setSaving(true);
    setError("");
    const completed = done.includes(id)
      ? done.filter((t) => t !== id)
      : [...done, id];
    const payload = {
      user_id: user.id,
      dia_numero: day,
      tareas_completadas: completed,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase
      .from("seguimiento_7dias")
      .upsert(payload, { onConflict: "user_id,dia_numero" });
    if (error) setError("No se guardó este cambio. Inténtalo de nuevo.");
    else
      setRows((prev) => [
        ...prev.filter((r) => r.dia_numero !== day),
        { ...row, ...payload },
      ]);
    setSaving(false);
  }
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-6 pb-16">
      <header>
        <p className="text-teal-300 text-sm font-semibold">
          Tu programa · A tu ritmo
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold mt-2">
          Una acción para hoy
        </h1>
        <p className="text-slate-400 mt-3">
          Tu avance depende de las acciones guardadas. Puedes regresar después
          de una pausa.
        </p>
      </header>
      {error && (
        <p role="alert" className="bg-red-950 text-red-200 rounded-xl p-4">
          {error}
        </p>
      )}
      {loading ? (
        <p role="status">Cargando tu avance…</p>
      ) : (
        <>
          <section className="rounded-2xl bg-gradient-to-br from-teal-950 to-slate-900 border border-teal-700 p-5 sm:p-8 space-y-5">
            <div className="flex flex-wrap justify-between gap-3 items-center">
              <h2 className="text-xl font-bold">
                Día {day} · Semana {Math.ceil(day / 7)}
              </h2>
              <label className="text-sm text-slate-300">
                Revisar día{" "}
                <select
                  aria-label="Revisar día"
                  className="ml-2 bg-slate-900 p-2 rounded-lg"
                  value={day}
                  onChange={(e) => setDay(Number(e.target.value))}
                >
                  {Array.from({ length: 28 }, (_, i) => (
                    <option key={i} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <p className="text-xl">
              {next
                ? next.label
                : "Acciones del día completadas. Puedes descansar o continuar cuando estés listo."}
            </p>
            <Link
              className="block text-center rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold px-5 py-4"
              to={next?.to || "/plataforma/planeador"}
            >
              {next ? "Continuar mi día" : "Organizar mi siguiente comida"}
            </Link>
            <div className="space-y-3">
              {tasks.map((t) => (
                <label
                  key={t.id}
                  className="flex gap-3 items-center bg-slate-950/50 rounded-xl p-4 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="w-5 h-5 accent-teal-500 shrink-0"
                    checked={done.includes(t.id)}
                    disabled={saving || loadFailed}
                    onChange={() => toggle(t.id)}
                  />
                  <span>{t.label}</span>
                </label>
              ))}
            </div>
            <p role="status" className="text-sm text-slate-300">
              {saving
                ? "Guardando…"
                : `${state.completed} de 28 días con sus tres acciones completadas.`}
            </p>
            <progress
              aria-label="Días completados"
              max="28"
              value={state.completed}
              className="w-full accent-teal-400"
            />
            {!next && day < 28 && (
              <button
                className="text-teal-200 underline p-2"
                onClick={() => setDay(day + 1)}
              >
                Revisar día {day + 1}
              </button>
            )}
          </section>
          <DanteSupport
            gap={absenceDays(rows)}
            current={state.current}
            completed={state.completed}
          />
        </>
      )}
      <p className="text-xs text-slate-400 leading-relaxed">
        Antes de comenzar: si tienes diabetes, usas SGLT2 (como dapagliflozina o
        empagliflozina), estás embarazada o tienes enfermedad renal o
        cardiovascular, consulta con tu equipo de salud. No inicies ayuno, dieta
        cetogénica ni suplementos de electrolitos por esta guía. No cambies
        medicamentos por tu cuenta.
      </p>
    </div>
  );
}
