import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "../context/UserContext";
// CORRECCIÓN: Agregado 'BookHeart' a la lista de imports
import {
  Save,
  Trash2,
  Edit2,
  TrendingDown,
  Activity,
  Scale,
  Ruler,
  Zap,
  Moon,
  Calendar,
  ArrowDownRight,
  BookHeart,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Bitacora() {
  const { user } = useUser();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    weight: "",
    waist: "",
    energy_level: 3,
    sleep_quality: 3,
    notes: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchLogs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("progress_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch {
      setError("No pudimos cargar tu bitácora. Recarga para reintentar.");
    } finally {
      setLoading(false);
    }
  }, [user.id]);
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleSave = async () => {
    if (saving) return;
    const weight = Number(formData.weight);
    const waist = Number(formData.waist);
    if (
      !Number.isFinite(weight) ||
      weight <= 0 ||
      weight > 500 ||
      !Number.isFinite(waist) ||
      waist < 0 ||
      waist > 300
    ) {
      setError(
        "Introduce un peso válido y una cintura positiva si deseas registrarla.",
      );
      return;
    }
    setSaving(true);
    setError("");

    try {
      const payload = {
        user_id: user.id,
        weight: parseFloat(formData.weight),
        waist: parseFloat(formData.waist) || null,
        energy_level: formData.energy_level,
        sleep_quality: formData.sleep_quality,
        notes: formData.notes,
        ...(!editingId ? { created_at: new Date().toISOString() } : {}),
      };

      if (editingId) {
        const { error } = await supabase
          .from("progress_logs")
          .update(payload)
          .eq("id", editingId)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("progress_logs").insert(payload);
        if (error) throw error;
      }

      setFormData({
        weight: "",
        waist: "",
        energy_level: 3,
        sleep_quality: 3,
        notes: "",
      });
      setEditingId(null);
      fetchLogs();
      alert("¡Progreso registrado con éxito!");
    } catch (error) {
      console.error("Error guardando:", error);
      setError(
        "No se guardó el registro. Conservamos tus datos para que reintentes.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (log) => {
    setFormData({
      weight: log.weight,
      waist: log.waist || "",
      energy_level: log.energy_level || 3,
      sleep_quality: log.sleep_quality || 3,
      notes: log.notes || "",
    });
    setEditingId(log.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de borrar este registro?")) return;
    const { error } = await supabase
      .from("progress_logs")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) {
      setError("No se pudo borrar. Intenta de nuevo.");
      return;
    }
    fetchLogs();
  };

  const chartData = [...logs].reverse().map((log) => ({
    date: new Date(log.created_at).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    }),
    weight: log.weight,
  }));

  const totalLost =
    logs.length > 1
      ? (logs[0].weight - logs[logs.length - 1].weight).toFixed(1)
      : 0;

  return (
    <div className="p-6 md:p-10 min-h-screen bg-slate-950 pb-24 animate-in fade-in duration-500">
      {error && (
        <p role="alert" className="p-4 bg-red-950 text-red-200 rounded-xl mb-5">
          {error}
        </p>
      )}
      {/* HEADER & KPI */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <BookHeart className="text-teal-400" /> Bitácora de Progreso
          </h1>
          <p className="text-slate-400">
            Lo que no se mide, no se puede mejorar.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-700 px-6 py-4 rounded-2xl flex items-center gap-4 shadow-lg">
          <div
            className={`p-3 rounded-full ${totalLost <= 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-700 text-slate-400"}`}
          >
            {totalLost <= 0 ? (
              <TrendingDown size={24} />
            ) : (
              <Activity size={24} />
            )}
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
              Progreso Total
            </p>
            <p
              className={`text-2xl font-black ${totalLost <= 0 ? "text-white" : "text-slate-300"}`}
            >
              {totalLost > 0 ? "+" : ""}
              {totalLost} kg
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* COLUMNA IZQ: FORMULARIO */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/80 border border-slate-700 p-6 rounded-2xl shadow-xl">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Edit2 size={18} className="text-indigo-400" />
              {editingId ? "Editar Registro" : "Nuevo Registro"}
            </h3>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2 uppercase flex items-center gap-1">
                    <Scale size={14} /> Peso (kg)
                  </label>
                  <input
                    type="number"
                    aria-label="Peso (kg)"
                    min="1"
                    max="500"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) =>
                      setFormData({ ...formData, weight: e.target.value })
                    }
                    placeholder="0.0"
                    className="w-full bg-slate-800 border border-slate-600 text-white p-3 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-center font-mono text-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2 uppercase flex items-center gap-1">
                    <Ruler size={14} /> Cintura (cm)
                  </label>
                  <input
                    type="number"
                    aria-label="Cintura (cm)"
                    min="1"
                    max="300"
                    step="0.1"
                    value={formData.waist}
                    onChange={(e) =>
                      setFormData({ ...formData, waist: e.target.value })
                    }
                    placeholder="0.0"
                    className="w-full bg-slate-800 border border-slate-600 text-white p-3 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-center font-mono text-lg"
                  />
                </div>
              </div>

              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                      <Zap size={14} className="text-yellow-400" /> Energía
                    </label>
                    <span className="text-xs text-yellow-400 font-bold">
                      {
                        ["Baja", "Regular", "Buena", "Alta", "¡A tope!"][
                          formData.energy_level - 1
                        ]
                      }
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={formData.energy_level}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        energy_level: parseInt(e.target.value),
                      })
                    }
                    className="w-full accent-yellow-400 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                      <Moon size={14} className="text-indigo-400" /> Sueño
                    </label>
                    <span className="text-xs text-indigo-400 font-bold">
                      {
                        ["Pésimo", "Malo", "Regular", "Bueno", "Profundo"][
                          formData.sleep_quality - 1
                        ]
                      }
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={formData.sleep_quality}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sleep_quality: parseInt(e.target.value),
                      })
                    }
                    className="w-full accent-indigo-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">
                  Notas del día
                </label>
                <textarea
                  aria-label="Notas del día"
                  rows="3"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="¿Cómo te sentiste hoy?"
                  className="w-full bg-slate-800 border border-slate-600 text-white p-3 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm resize-none"
                />
              </div>

              <button
                onClick={handleSave}
                disabled={saving || loading}
                className="w-full py-4 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow-lg shadow-teal-900/20 flex items-center justify-center gap-2 transition-all"
              >
                <Save size={18} />{" "}
                {editingId ? "Actualizar Registro" : "Guardar Progreso"}
              </button>
            </div>
          </div>
        </div>

        {/* COLUMNA DER: GRÁFICA E HISTORIAL */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl shadow-lg h-80 flex flex-col">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="text-teal-400" size={20} /> Tendencia de Peso
            </h3>
            <div className="flex-1 w-full min-h-0">
              {chartData.length > 1 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient
                        id="colorWeight"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#14b8a6"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#14b8a6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#334155"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      stroke="#64748b"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      domain={["auto", "auto"]}
                      stroke="#64748b"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#334155",
                        color: "#f1f5f9",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="weight"
                      stroke="#14b8a6"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorWeight)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
                  <p>Necesitamos al menos 2 registros para graficar.</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest px-2">
              Historial Reciente
            </h3>
            {logs.length === 0 && (
              <p className="text-slate-500 px-2">No hay registros aún.</p>
            )}

            {logs.map((log) => (
              <div
                key={log.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-600 p-4 rounded-xl flex justify-between items-center transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-slate-800 p-3 rounded-lg text-slate-400 font-mono text-xs text-center min-w-[60px]">
                    <span className="block font-bold text-sm text-white">
                      {new Date(log.created_at).getDate()}
                    </span>
                    {new Date(log.created_at).toLocaleDateString("es-ES", {
                      month: "short",
                    })}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-white font-bold text-lg">
                        {log.weight} kg
                      </span>
                      {log.waist && (
                        <span className="text-slate-500 text-sm border-l border-slate-700 pl-3">
                          {log.waist} cm cintura
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2 mt-1">
                      <span className="text-[10px] bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Zap size={10} /> {log.energy_level}/5
                      </span>
                      <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Moon size={10} /> {log.sleep_quality}/5
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 opacity-100 transition-opacity">
                  <button
                    aria-label="Editar registro"
                    onClick={() => handleEdit(log)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    aria-label="Borrar registro"
                    onClick={() => handleDelete(log.id)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
