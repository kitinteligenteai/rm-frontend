// src/pages/Bitacora.jsx (v5.0 - Análisis Inteligente de Progreso)
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useUser } from '../context/UserContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, Scale, Ruler, Zap, Moon, Trash2, Edit2, Calendar, TrendingDown, Award } from 'lucide-react';

const EditModal = ({ log, onClose, onSave }) => {
  /* ... (Mismo código del modal de edición que ya tenías, no cambia) ... */
  // Si quieres que te pegue todo el modal de nuevo dímelo, pero es igual al anterior.
  // Por brevedad asumo que copias el modal anterior aquí.
  // ...
  // [INSERTA AQUI EL CODIGO DE EDITMODAL DE LA VERSION ANTERIOR]
    const [formData, setFormData] = useState({
    ...log,
    created_at: new Date(log.created_at).toISOString().split('T')[0]
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const fullDate = new Date(formData.created_at).toISOString();
    await onSave({ ...formData, created_at: fullDate });
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 max-w-md w-full">
        <h2 className="text-xl font-bold text-white mb-4">Editar Registro</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Fecha</label>
            <input type="date" name="created_at" value={formData.created_at} onChange={handleChange} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Peso (kg)</label>
                <input type="number" step="0.1" name="weight" value={formData.weight} onChange={handleChange} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white font-bold" />
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Cintura (cm)</label>
                <input type="number" step="0.1" name="waist" value={formData.waist} onChange={handleChange} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white font-bold" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white">Cancelar</button>
            <button type="submit" disabled={isSaving} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-500 font-bold">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function Bitacora() {
  const { user } = useUser();
  const [logs, setLogs] = useState([]);
  const [editingLog, setEditingLog] = useState(null);
  
  // Stats
  const [totalLost, setTotalLost] = useState(0);
  const [initialWeight, setInitialWeight] = useState(0);

  // Form states
  const [weight, setWeight] = useState('');
  const [waist, setWaist] = useState('');
  const [energyLevel, setEnergyLevel] = useState(3);
  const [sleepQuality, setSleepQuality] = useState(3);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchLogs = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('progress_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
    
    if (data && data.length > 0) {
      setLogs(data);
      const first = data[0].weight;
      const last = data[data.length - 1].weight;
      setInitialWeight(first);
      setTotalLost((first - last).toFixed(1));
    } else {
        setLogs([]);
        setTotalLost(0);
    }
  };

  useEffect(() => { fetchLogs(); }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.from('progress_logs').insert([{ 
      user_id: user.id, 
      weight: parseFloat(weight), 
      waist: parseFloat(waist), 
      energy_level: parseInt(energyLevel), 
      sleep_quality: parseInt(sleepQuality), 
      notes: notes 
    }]);
    
    if (!error) {
      setWeight(''); setWaist(''); setNotes(''); 
      fetchLogs(); 
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que quieres borrar este registro?")) return;
    await supabase.from('progress_logs').delete().match({ id });
    fetchLogs();
  };

  const handleUpdate = async (updatedLog) => {
    const { error } = await supabase.from('progress_logs').update({
        weight: parseFloat(updatedLog.weight),
        waist: parseFloat(updatedLog.waist),
        created_at: updatedLog.created_at
    }).match({ id: updatedLog.id });
    if (!error) fetchLogs();
  };

  const chartData = logs.map(log => ({
    name: new Date(log.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
    weight: log.weight,
  }));

  return (
    <div className="p-6 md:p-10 pb-24 animate-in fade-in">
      {editingLog && <EditModal log={editingLog} onClose={() => setEditingLog(null)} onSave={handleUpdate} />}

      <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
        <div>
           <h1 className="text-3xl md:text-4xl font-bold text-white">Bitácora de Progreso</h1>
           <p className="text-slate-400 mt-2">Tu historia de éxito en datos.</p>
        </div>
        
        {/* WIDGET DE PROGRESO INTELIGENTE */}
        {logs.length > 1 && (
            <div className={`px-6 py-3 rounded-2xl border flex items-center gap-3 ${totalLost > 0 ? 'bg-emerald-900/30 border-emerald-500/50' : 'bg-slate-800 border-slate-700'}`}>
                {totalLost > 0 ? <TrendingDown className="text-emerald-400 w-8 h-8" /> : <Scale className="text-slate-400 w-8 h-8" />}
                <div>
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Progreso Total</p>
                    <p className="text-2xl font-black text-white">{totalLost > 0 ? `-${totalLost} kg` : "En proceso"}</p>
                </div>
            </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* FORMULARIO */}
        <div className="lg:col-span-1 bg-slate-800/60 border border-slate-700 p-6 rounded-2xl shadow-xl h-fit">
            <h2 className="text-xl font-bold text-white mb-6">Nuevo Registro</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-slate-300 mb-1">Peso (kg)</label>
                    <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} required className="block w-full px-3 py-3 border border-slate-500 rounded-lg bg-white text-black font-extrabold text-lg text-center" placeholder="0.0" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-300 mb-1">Cintura (cm)</label>
                    <input type="number" step="0.1" value={waist} onChange={(e) => setWaist(e.target.value)} required className="block w-full px-3 py-3 border border-slate-500 rounded-lg bg-white text-black font-extrabold text-lg text-center" placeholder="0.0" />
                </div>
              </div>
              <div className="bg-slate-700/30 p-4 rounded-xl border border-slate-600">
                 <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-bold text-slate-200">Energía</label>
                    <span className="bg-teal-500 text-white text-xs font-bold px-2 py-1 rounded-full">{energyLevel}/5</span>
                 </div>
                 <input type="range" min="1" max="5" value={energyLevel} onChange={(e) => setEnergyLevel(e.target.value)} className="w-full h-2 bg-slate-600 rounded-lg cursor-pointer accent-teal-500" />
              </div>
              <div className="bg-slate-700/30 p-4 rounded-xl border border-slate-600">
                 <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-bold text-slate-200">Sueño</label>
                    <span className="bg-indigo-500 text-white text-xs font-bold px-2 py-1 rounded-full">{sleepQuality}/5</span>
                 </div>
                 <input type="range" min="1" max="5" value={sleepQuality} onChange={(e) => setSleepQuality(e.target.value)} className="w-full h-2 bg-slate-600 rounded-lg cursor-pointer accent-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-1">Notas</label>
                <textarea 
                  rows="3" value={notes} onChange={(e) => setNotes(e.target.value)} 
                  className="block w-full px-4 py-3 border border-slate-500 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white text-black font-medium placeholder-slate-500"
                  placeholder="¿Cómo te sentiste hoy?"
                ></textarea>
              </div>
              <button type="submit" disabled={submitting} className="w-full bg-teal-600 text-white font-bold py-3 rounded-xl hover:bg-teal-500 transition-all shadow-lg">Guardar Progreso</button>
            </form>
        </div>

        {/* GRÁFICAS */}
        <div className="lg:col-span-2 space-y-6">
          {logs.length > 0 ? (
            <div className="bg-slate-800/60 border border-slate-700 p-6 rounded-2xl h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis domain={['auto', 'auto']} stroke="#94a3b8" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} />
                  <Line type="monotone" dataKey="weight" stroke="#14b8a6" strokeWidth={4} dot={{r: 6, fill: "#14b8a6"}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="bg-slate-800/30 border border-dashed border-slate-600 p-10 rounded-2xl text-center">
              <Scale className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400">Registra tu peso para ver la gráfica.</p>
            </div>
          )}

          {/* LISTA HISTORIAL */}
          <div className="space-y-3">
            {[...logs].reverse().map(log => (
              <div key={log.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between items-center hover:border-slate-600 transition-colors group">
                <div>
                  <p className="text-teal-400 font-bold text-sm flex items-center gap-2">
                    <Calendar className="w-3 h-3"/> {new Date(log.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-white font-medium text-lg">{log.weight} kg <span className="text-slate-500 text-sm font-normal">/ {log.waist} cm</span></p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setEditingLog(log)} className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white" title="Editar"><Edit2 className="w-4 h-4"/></button>
                    <button onClick={() => handleDelete(log.id)} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white" title="Borrar"><Trash2 className="w-4 h-4"/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}