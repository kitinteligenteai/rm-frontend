// src/pages/Bitacora.jsx (v3.0 - Diseño Premium con Gráficas)
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useUser } from '../context/UserContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, Scale, Ruler, Zap, Moon, Trash2, Edit2, TrendingUp } from 'lucide-react';

// --- COMPONENTE PRINCIPAL ---
const Bitacora = () => {
  const { user } = useUser();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados del formulario
  const [weight, setWeight] = useState('');
  const [waist, setWaist] = useState('');
  const [energyLevel, setEnergyLevel] = useState(3);
  const [sleepQuality, setSleepQuality] = useState(3);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('progress_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true }); // Ordenar por fecha para la gráfica

      if (data) setLogs(data);
      setLoading(false);
    };
    fetchLogs();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    const { error } = await supabase.from('progress_logs').insert([{ 
      user_id: user.id, 
      weight: parseFloat(weight), 
      waist: parseFloat(waist), 
      energy_level: parseInt(energyLevel), 
      sleep_quality: parseInt(sleepQuality), 
      notes: notes 
    }]);

    if (!error) {
      window.location.reload(); // Recarga simple para ver el nuevo dato
    }
  };

  // Datos para gráfico
  const chartData = logs.map(log => ({
    name: new Date(log.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
    weight: log.weight,
  }));

  return (
    <div className="p-6 md:p-10 pb-24 animate-in fade-in">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-white">Bitácora de Progreso</h1>
        <p className="text-slate-400 mt-2">Tu historia de éxito en datos.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA 1: NUEVO REGISTRO */}
        <div className="lg:col-span-1">
          <div className="bg-slate-800/60 border border-slate-700 p-6 rounded-2xl shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-teal-400" /> Nuevo Registro
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-1">Peso (kg)</label>
                <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} required className="w-full px-4 py-3 bg-white text-black font-bold text-lg rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/50" placeholder="0.0" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-1">Cintura (cm)</label>
                <input type="number" step="0.1" value={waist} onChange={(e) => setWaist(e.target.value)} required className="w-full px-4 py-3 bg-white text-black font-bold text-lg rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/50" placeholder="0.0" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-300">Energía (1-5): <span className="text-teal-400">{energyLevel}</span></label>
                <input type="range" min="1" max="5" value={energyLevel} onChange={(e) => setEnergyLevel(e.target.value)} className="w-full h-2 bg-slate-600 rounded-lg cursor-pointer accent-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-300">Sueño (1-5): <span className="text-teal-400">{sleepQuality}</span></label>
                <input type="range" min="1" max="5" value={sleepQuality} onChange={(e) => setSleepQuality(e.target.value)} className="w-full h-2 bg-slate-600 rounded-lg cursor-pointer accent-teal-500" />
              </div>
              <button type="submit" className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg transform hover:scale-[1.02]">Guardar Progreso</button>
            </form>
          </div>
        </div>

        {/* COLUMNA 2: GRÁFICAS E HISTORIAL */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* GRÁFICA VISUAL (Si hay datos) */}
          {logs.length > 0 ? (
            <div className="bg-slate-800/60 border border-slate-700 p-6 rounded-2xl h-80 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-teal-400" /> Tendencia de Peso
              </h3>
              <ResponsiveContainer width="100%" height="85%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis domain={['dataMin - 2', 'dataMax + 2']} stroke="#94a3b8" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                  <Line type="monotone" dataKey="weight" stroke="#14b8a6" strokeWidth={4} dot={{r: 6, fill: "#14b8a6"}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="bg-slate-800/30 border border-dashed border-slate-600 p-10 rounded-2xl text-center">
              <Scale className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400">Aún no hay registros. Guarda tu primer peso para ver la magia.</p>
            </div>
          )}

          {/* LISTA DE REGISTROS */}
          <div className="space-y-3">
            {logs.slice().reverse().map(log => (
              <div key={log.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
                <div>
                  <p className="text-teal-400 font-bold text-sm">{new Date(log.created_at).toLocaleDateString()}</p>
                  <p className="text-white font-medium">{log.weight} kg / {log.waist} cm</p>
                </div>
                <div className="flex gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Zap size={14} /> {log.energy_level}/5</span>
                  <span className="flex items-center gap-1"><Moon size={14} /> {log.sleep_quality}/5</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Bitacora;