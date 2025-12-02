// src/pages/Bitacora.jsx (v2.0 - Full Visual + High Contrast Form)
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useUser } from '../context/UserContext';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, Scale, Ruler, Zap, Moon, Trash2, Edit2 } from 'lucide-react';

// --- Componente para el Estado Vacío ---
const EmptyState = () => (
  <div className="text-center bg-slate-800/50 p-8 rounded-xl border-2 border-dashed border-slate-600">
    <h3 className="text-xl font-bold text-white mb-3">¡Tu transformación comienza hoy!</h3>
    <p className="text-slate-400 mt-2 mb-6 max-w-lg mx-auto">
      Lo que no se mide, no se mejora. Registra tu peso y medidas semanalmente para ver tu evolución.
    </p>
  </div>
);

// --- Componente: MODAL DE EDICIÓN ---
const EditModal = ({ log, onClose, onSave }) => {
  const [formData, setFormData] = useState(log);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(formData);
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 max-w-lg w-full">
        <h2 className="text-2xl font-bold text-white mb-6">Editar Registro</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300">Peso (kg)</label>
            <input type="number" step="0.1" name="weight" value={formData.weight} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white text-black rounded-lg font-bold" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300">Cintura (cm)</label>
            <input type="number" step="0.1" name="waist" value={formData.waist} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white text-black rounded-lg font-bold" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300">Notas</label>
            <textarea name="notes" rows="3" value={formData.notes} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white text-black rounded-lg"></textarea>
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-300 hover:text-white">Cancelar</button>
            <button type="submit" disabled={isSaving} className="px-6 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-500">
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// --- COMPONENTE PRINCIPAL ---
const Bitacora = () => {
  const { user } = useUser();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingLog, setEditingLog] = useState(null);

  // Estados del formulario
  const [weight, setWeight] = useState('');
  const [waist, setWaist] = useState('');
  const [energyLevel, setEnergyLevel] = useState(3);
  const [sleepQuality, setSleepQuality] = useState(3);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('progress_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) setLogs(data);
      } catch (error) {
        console.error("Error:", error);
        setError("No pudimos cargar tu historial.");
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from('progress_logs').insert([{ user_id: user.id, weight: parseFloat(weight), waist: parseFloat(waist), energy_level: parseInt(energyLevel), sleep_quality: parseInt(sleepQuality), notes: notes, }]);
      if (error) throw error;
      
      // Limpiar form
      setWeight(''); setWaist(''); setEnergyLevel(3); setSleepQuality(3); setNotes('');
      
      // Recargar lista
      const { data } = await supabase.from('progress_logs').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      setLogs(data);
    } catch (error) {
      alert("Error al guardar: " + error.message);
    } finally { 
      setSubmitting(false); 
    }
  };

  const handleDelete = async (logId) => {
    if (window.confirm('¿Borrar este registro?')) {
      try {
        const { error } = await supabase.from('progress_logs').delete().match({ id: logId });
        if (error) throw error;
        setLogs(logs.filter(log => log.id !== logId));
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const handleUpdate = async (updatedLog) => {
    try {
      const { id, created_at, user_id, ...fieldsToUpdate } = updatedLog;
      const { error } = await supabase.from('progress_logs').update(fieldsToUpdate).match({ id: id });
      if (error) throw error;
      setLogs(logs.map(log => log.id === id ? { ...log, ...fieldsToUpdate } : log));
    } catch (error) {
      alert(error.message);
    }
  };

  // Datos para gráfico (invertimos para que el más viejo esté a la izquierda)
  const chartData = [...logs].reverse().map(log => ({
    name: new Date(log.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
    weight: log.weight,
  }));

  return (
    <div className="container mx-auto p-4 md:p-8 bg-slate-950 min-h-full text-slate-100 pb-24 animate-in fade-in">
      {editingLog && <EditModal log={editingLog} onClose={() => setEditingLog(null)} onSave={handleUpdate} />}

      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-white">Bitácora de Progreso</h1>
        <p className="text-slate-400 mt-2">Registra tus victorias semanales.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- COLUMNA 1: FORMULARIO (High Contrast) --- */}
        <div className="lg:col-span-1">
          <div className="bg-slate-800/60 border border-slate-700 p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold text-white mb-6">Nuevo Registro</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="weight" className="block text-sm font-bold text-slate-300 mb-1">Peso Actual (kg)</label>
                <input 
                  type="number" step="0.1" id="weight" value={weight} onChange={(e) => setWeight(e.target.value)} required 
                  className="block w-full px-4 py-3 border border-slate-500 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white text-black font-extrabold text-lg placeholder-slate-400"
                  placeholder="Ej: 80.5"
                />
              </div>
              <div>
                <label htmlFor="waist" className="block text-sm font-bold text-slate-300 mb-1">Cintura (cm)</label>
                <input 
                  type="number" step="0.1" id="waist" value={waist} onChange={(e) => setWaist(e.target.value)} required 
                  className="block w-full px-4 py-3 border border-slate-500 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white text-black font-extrabold text-lg placeholder-slate-400"
                  placeholder="Ej: 90"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-300">Nivel de Energía (1-5)</label>
                <input type="range" min="1" max="5" value={energyLevel} onChange={(e) => setEnergyLevel(e.target.value)} className="w-full h-2 bg-slate-600 rounded-lg cursor-pointer accent-teal-500" />
                <div className="text-right text-sm font-bold text-teal-400">{energyLevel}</div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-300">Calidad del Sueño (1-5)</label>
                <input type="range" min="1" max="5" value={sleepQuality} onChange={(e) => setSleepQuality(e.target.value)} className="w-full h-2 bg-slate-600 rounded-lg cursor-pointer accent-teal-500" />
                <div className="text-right text-sm font-bold text-teal-400">{sleepQuality}</div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-1">Notas</label>
                <textarea 
                  rows="3" value={notes} onChange={(e) => setNotes(e.target.value)} 
                  className="block w-full px-4 py-3 border border-slate-500 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white text-black font-medium"
                  placeholder="¿Cómo te sentiste hoy?"
                ></textarea>
              </div>
              <button type="submit" disabled={submitting} className="w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-500 transition-all shadow-lg disabled:opacity-50">
                {submitting ? 'Guardando...' : 'Guardar Registro'}
              </button>
            </form>
          </div>
        </div>

        {/* --- COLUMNA 2: GRÁFICOS E HISTORIAL --- */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Gráfico */}
          {logs.length > 1 && (
            <div className="bg-slate-800/60 border border-slate-700 p-4 rounded-xl h-64">
              <h3 className="text-sm font-bold text-slate-400 mb-4">Tendencia de Peso</h3>
              <ResponsiveContainer width="100%" height="85%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis domain={['auto', 'auto']} stroke="#94a3b8" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} />
                  <Line type="monotone" dataKey="weight" stroke="#14b8a6" strokeWidth={3} dot={{r: 4}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Lista */}
          <div className="bg-slate-800/60 p-6 rounded-xl shadow-lg border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">Historial</h2>
            {loading && <p className="text-slate-400">Cargando...</p>}
            {!loading && logs.length === 0 && <EmptyState />}
            
            <div className="space-y-3">
              {logs.map(log => (
                <div key={log.id} className="bg-slate-900/50 border border-slate-700 p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <p className="text-sm text-teal-400 font-bold">{new Date(log.created_at).toLocaleDateString()}</p>
                    <div className="flex gap-4 mt-1 text-sm text-white">
                      <span><Scale className="inline w-4 h-4 mr-1"/> {log.weight} kg</span>
                      <span><Ruler className="inline w-4 h-4 mr-1"/> {log.waist} cm</span>
                    </div>
                    {log.notes && <p className="text-xs text-slate-500 mt-2 italic">"{log.notes}"</p>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingLog(log)} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded"><Edit2 className="w-4 h-4"/></button>
                    <button onClick={() => handleDelete(log.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded"><Trash2 className="w-4 h-4"/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bitacora;