import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useUser } from '../context/UserContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, Scale, Ruler, Zap, Moon, Trash2, Edit2, Calendar } from 'lucide-react';

const EditModal = ({ log, onClose, onSave }) => {
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
    if (data) setLogs(data);
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

      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-white">Bitácora de Progreso</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-slate-800/60 border border-slate-700 p-6 rounded-2xl shadow-xl h-fit">
            <h2 className="text-xl font-bold text-white mb-6">Nuevo Registro</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-1">Peso (kg)</label>
                <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} required className="block w-full px-4 py-3 border border-slate-500 rounded-lg bg-white text-black font-extrabold text-lg" placeholder="0.0" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-1">Cintura (cm)</label>
                <input type="number" step="0.1" value={waist} onChange={(e) => setWaist(e.target.value)} required className="block w-full px-4 py-3 border border-slate-500 rounded-lg bg-white text-black font-extrabold text-lg" placeholder="0.0" />
              </div>
              <div>
                 <label className="block text-sm font-bold text-slate-300">Energía (1-5)</label>
                 <input type="range" min="1" max="5" value={energyLevel} onChange={(e) => setEnergyLevel(e.target.value)} className="w-full h-2 bg-slate-600 rounded-lg accent-teal-500" />
              </div>
              <div>
                 <label className="block text-sm font-bold text-slate-300">Sueño (1-5)</label>
                 <input type="range" min="1" max="5" value={sleepQuality} onChange={(e) => setSleepQuality(e.target.value)} className="w-full h-2 bg-slate-600 rounded-lg accent-teal-500" />
              </div>
              <button type="submit" disabled={submitting} className="w-full bg-teal-600 text-white font-bold py-3 rounded-xl hover:bg-teal-500 transition-all">Guardar Progreso</button>
            </form>
        </div>

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

          <div className="space-y-3">
            {[...logs].reverse().map(log => (
              <div key={log.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between items-center hover:border-slate-600 transition-colors group">
                <div>
                  <p className="text-teal-400 font-bold text-sm flex items-center gap-2">
                    <Calendar className="w-3 h-3"/> {new Date(log.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-white font-medium text-lg">{log.weight} kg <span className="text-slate-500 text-sm font-normal">/ {log.waist} cm</span></p>
                </div>
                <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditingLog(log)} className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white" title="Editar">
                        <Edit2 className="w-4 h-4"/>
                    </button>
                    <button onClick={() => handleDelete(log.id)} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white" title="Borrar">
                        <Trash2 className="w-4 h-4"/>
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