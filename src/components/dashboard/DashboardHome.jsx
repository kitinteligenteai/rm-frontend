import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { 
  Calendar, Utensils, Dumbbell, Award, 
  TrendingUp, ArrowRight, Activity, BookHeart,
  LifeBuoy, CheckCircle, Circle, Droplets, Flame, AlertTriangle, Zap, Sun, Target
} from "lucide-react";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from "recharts";
import OnboardingModal from './OnboardingModal';
import ChefDanteWidget from '../dante/ChefDanteWidget';
import SOSCenter from './SOSCenter';

// --- ENFOQUE DE FASES (NO DÍAS) ---
const PROTOCOLO_ACTUAL = {
  titulo: "Fase de Limpieza",
  subtitulo: "Objetivos de hoy para sanar:",
  tareas: [
    "Hidratación con minerales (Agua + Sal)",
    "Nutrición densa (Prioriza Proteína)",
    "Descanso metabólico (Ayuno 12h nocturno)"
  ]
};

const StatCard = ({ title, value, subtext, icon: Icon, color = "teal" }) => (
  <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden group hover:border-slate-600 transition-all">
    <div className={`absolute top-0 right-0 p-3 opacity-10 text-${color}-400 group-hover:scale-110 transition-transform`}>
      {Icon && <Icon size={60} />}
    </div>
    <div>
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
      <h3 className="text-2xl md:text-3xl font-bold text-white">{value}</h3>
    </div>
    <div className="mt-4 flex items-center gap-2 text-xs">
      <span className={`bg-${color}-500/20 text-${color}-300 px-2 py-0.5 rounded-full font-medium`}>
        {subtext}
      </span>
    </div>
  </div>
);

const QuickAction = ({ icon: Icon, title, desc, to, buttonText }) => (
  <Link to={to} className="group flex flex-col justify-between p-5 rounded-2xl bg-slate-800/40 border border-slate-700 hover:bg-slate-800 hover:border-teal-500/30 transition-all h-full">
    <div className="flex items-start gap-4 mb-4">
        <div className="p-3 rounded-xl bg-teal-500/10 text-teal-400 group-hover:bg-teal-500 group-hover:text-white transition-colors">
        <Icon className="w-6 h-6" />
        </div>
        <div>
        <h4 className="text-white font-bold text-lg group-hover:text-teal-400 transition-colors">{title}</h4>
        <p className="text-sm text-slate-400 leading-snug mt-1">{desc}</p>
        </div>
    </div>
    <div className="flex items-center text-xs font-bold text-teal-500 uppercase tracking-wider group-hover:underline">
        {buttonText} <ArrowRight size={14} className="ml-1" />
    </div>
  </Link>
);

export default function DashboardHome({ user }) {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [localName, setLocalName] = useState(""); 
  const [showSOS, setShowSOS] = useState(false);
  
  const [latestWeight, setLatestWeight] = useState(70);
  const [weightTrend, setWeightTrend] = useState([]);
  const [trackerData, setTrackerData] = useState({ agua_vasos: 0, tareas_completadas: [] });
  
  const displayName = localName || user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Campeón";
  
  // Cálculo Hidratación
  const dailyMl = latestWeight * 35;
  const targetGlasses = Math.ceil(dailyMl / 250);
  const liters = (dailyMl / 1000).toFixed(1);
  const percentHydration = Math.min(100, Math.round((trackerData.agua_vasos / targetGlasses) * 100));

  useEffect(() => {
    if (user && !user.user_metadata?.full_name && !localName) {
      setShowOnboarding(true);
    }
    if (user) {
      fetchWeightData();
      fetchTrackerData();
    }
  }, [user, localName]);

  const handleOnboardingComplete = (newName) => {
    setLocalName(newName);
    setShowOnboarding(false);
  };

  const fetchWeightData = async () => {
    const { data, error } = await supabase
      .from('progress_logs')
      .select('weight, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(7);

    if (!error && data && data.length > 0) {
      setLatestWeight(data[0].weight); 
      const graphData = [...data].reverse().map(log => ({
        day: new Date(log.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
        peso: log.weight
      }));
      setWeightTrend(graphData);
    }
  };

  const fetchTrackerData = async () => {
    // Usamos día 1 como "Hoy" genérico para mantenerlo simple y eterno
    const { data } = await supabase
      .from('seguimiento_7dias')
      .select('*')
      .eq('user_id', user.id)
      .eq('dia_numero', 1) 
      .single();

    if (data) setTrackerData(data);
    else setTrackerData({ agua_vasos: 0, tareas_completadas: [] });
  };

  const updateTracker = async (updates) => {
    setTrackerData(prev => ({ ...prev, ...updates }));
    await supabase
      .from('seguimiento_7dias')
      .upsert({
        user_id: user.id,
        dia_numero: 1, 
        ...updates,
        updated_at: new Date()
      }, { onConflict: 'user_id, dia_numero' });
  };

  const toggleTarea = (tarea) => {
    const actuales = trackerData.tareas_completadas || [];
    const nuevaLista = actuales.includes(tarea)
      ? actuales.filter(t => t !== tarea)
      : [...actuales, tarea];
    updateTracker({ tareas_completadas: nuevaLista });
  };

  return (
    <div className="p-6 md:p-10 space-y-10 animate-in fade-in duration-500 pb-40">
      
      {showOnboarding && <OnboardingModal user={user} onComplete={handleOnboardingComplete} />}
      {showSOS && <SOSCenter onClose={() => setShowSOS(false)} />}
      
      {/* HEADER + BOTÓN SOS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Hola, {displayName} <span className="animate-wave inline-block">👋</span>
          </h1>
          <p className="text-slate-400 mt-1 flex items-center gap-2 text-lg">
             Estás en <span className="text-teal-400 font-bold">Modo Reinicio</span>
          </p>
        </div>
        
        <button 
          onClick={() => setShowSOS(true)}
          className="w-full md:w-auto bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/50 px-6 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-900/20"
        >
          <AlertTriangle size={18} />
          SOS: Antojos / Crisis
        </button>
      </div>

      {/* SECCIÓN PRINCIPAL: OBJETIVOS E HIDRATACIÓN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Tareas del Día */}
          <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-3xl p-8 shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-6 opacity-5 text-white">
                <Target size={140} />
             </div>
             <div className="relative z-10">
                <div className="mb-6">
                    <h3 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                    <Activity className="text-teal-400" /> {PROTOCOLO_ACTUAL.titulo}
                    </h3>
                    <p className="text-slate-400 text-sm">{PROTOCOLO_ACTUAL.subtitulo}</p>
                </div>
                
                <div className="space-y-4">
                  {PROTOCOLO_ACTUAL.tareas.map((tarea, idx) => {
                    const isDone = (trackerData.tareas_completadas || []).includes(tarea);
                    return (
                      <div 
                        key={idx} 
                        onClick={() => toggleTarea(tarea)}
                        className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                          isDone 
                            ? "bg-teal-500/10 border-teal-500/40" 
                            : "bg-slate-950/40 border-slate-700/50 hover:border-slate-600"
                        }`}
                      >
                        <div className={`transition-transform ${isDone ? "text-teal-400 scale-110" : "text-slate-600"}`}>
                          {isDone ? <CheckCircle className="fill-current" size={24} /> : <Circle size={24} />}
                        </div>
                        <span className={`flex-1 font-medium text-lg ${isDone ? "text-teal-100 line-through decoration-teal-500/50" : "text-slate-200"}`}>
                          {tarea}
                        </span>
                      </div>
                    );
                  })}
                </div>
             </div>
          </div>

          {/* HIDRATACIÓN PREMIUM */}
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10 w-full h-full flex flex-col">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-white font-bold text-lg flex items-center gap-2">
                            <Droplets className="text-blue-400" /> Hidratación
                        </h3>
                        <p className="text-slate-400 text-xs mt-1">Calculada para tu peso</p>
                    </div>
                    <div className="text-right">
                        <span className="text-blue-300 font-bold text-2xl">{liters}L</span>
                    </div>
                </div>

                <div className="flex-1 flex flex-col justify-center items-center my-4">
                    <div className="text-6xl font-black text-white mb-2 tracking-tighter">
                        {trackerData.agua_vasos}
                        <span className="text-2xl text-slate-600 font-medium">/{targetGlasses}</span>
                    </div>
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Vasos Registrados</p>
                </div>

                {/* Barra */}
                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden mb-6">
                    <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${percentHydration}%` }}></div>
                </div>

                <div className="flex gap-3 w-full">
                    <button 
                        onClick={() => updateTracker({ agua_vasos: Math.max(0, trackerData.agua_vasos - 1) })}
                        className="w-14 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors border border-slate-700"
                    >-</button>
                    <button 
                        onClick={() => updateTracker({ agua_vasos: trackerData.agua_vasos + 1 })}
                        className="flex-1 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-900/30 transition-colors"
                    >+ Registrar Vaso</button>
                </div>
            </div>
          </div>
      </div>

      {/* ACCESOS DIRECTOS (Corregidos) */}
      <div>
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Zap className="text-yellow-400" /> Herramientas de Poder
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickAction 
            to="/plataforma/planeador" 
            icon={Calendar} 
            title="Planeador Semanal" 
            desc="Genera tu menú inteligente y lista de compras." 
            buttonText="Ver mi Menú"
          />
          <QuickAction 
            to="/plataforma/gimnasio" 
            icon={Dumbbell} 
            title="Entrenamiento" 
            desc="Rutinas de fuerza y cardio adaptadas a ti." 
            buttonText="Ir a Entrenar" // <-- Corregido: Ya no dice "Ver video"
          />
          <QuickAction 
            to="/plataforma/bitacora" 
            icon={BookHeart} 
            title="Bitácora de Progreso" 
            desc="Registra tu peso, medidas y victorias." 
            buttonText="Registrar Hoy"
          />
        </div>
      </div>

      {/* GRÁFICA EVOLUCIÓN */}
      <div className="bg-slate-800/40 border border-slate-700 p-8 rounded-3xl flex flex-col h-96 relative overflow-hidden">
        <div className="flex justify-between items-center mb-6 z-10">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="text-teal-400" /> Tu Transformación
            </h3>
            <span className="text-sm text-slate-400 bg-slate-800 px-3 py-1 rounded-full">Últimos 7 registros</span>
        </div>

        <div className="flex-1 w-full min-h-0 relative z-10">
            {weightTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weightTrend}>
                <defs><linearGradient id="colorPeso" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/><stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} axisLine={false} tickLine={false} />
                <YAxis domain={['auto', 'auto']} stroke="#64748b" fontSize={12} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="peso" stroke="#14b8a6" strokeWidth={3} fillOpacity={1} fill="url(#colorPeso)" />
                </AreaChart>
            </ResponsiveContainer>
            ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 text-base border-2 border-dashed border-slate-700 rounded-2xl bg-slate-900/50">
                <Activity size={40} className="mb-3 opacity-50" />
                <p>Aún no tenemos datos suficientes.</p>
                <Link to="/plataforma/bitacora" className="text-teal-400 mt-2 hover:underline font-bold">
                   + Registrar peso inicial
                </Link>
            </div>
            )}
        </div>
      </div>
      
      <ChefDanteWidget />
    </div>
  );
}