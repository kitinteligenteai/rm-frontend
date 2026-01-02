import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { 
  Calendar, Utensils, Dumbbell, Award, 
  TrendingUp, ArrowRight, Activity, BookHeart,
  LifeBuoy, CheckCircle, Circle, Droplets, Flame, AlertTriangle, Zap, Map, Sun
} from "lucide-react";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from "recharts";
import OnboardingModal from './OnboardingModal';
import ChefDanteWidget from '../dante/ChefDanteWidget';
import SOSCenter from './SOSCenter';

// --- TEXTOS GENÉRICOS PROFESIONALES (Sin "hambre" ni "limpieza") ---
const PROTOCOLO_BASE = {
  fase: "Fase de Adaptación",
  titulo: "Protocolo Diario",
  tareas: [
    "Hidratación correcta (Agua + Electrolitos)",
    "Consumo de Proteína en cada comida",
    "Gestión de carbohidratos según el plan"
  ]
};

const StatCard = ({ title, value, subtext, icon: Icon, color = "teal" }) => (
  <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden">
    <div className={`absolute top-0 right-0 p-3 opacity-10 text-${color}-400`}>
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

const Achievement = ({ title, desc, unlocked }) => (
  <div className={`flex items-center gap-4 p-3 rounded-xl border ${unlocked ? 'bg-slate-800/60 border-teal-500/30' : 'bg-slate-900 border-slate-800 opacity-50'}`}>
    <div className={`p-2 rounded-full ${unlocked ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20' : 'bg-slate-700 text-slate-500'}`}>
      {unlocked ? <Award size={20} /> : <Award size={20} />}
    </div>
    <div>
      <h4 className={`font-bold text-sm ${unlocked ? 'text-white' : 'text-slate-500'}`}>{title}</h4>
      <p className="text-xs text-slate-400">{desc}</p>
    </div>
  </div>
);

const QuickAction = ({ icon: Icon, title, desc, to }) => (
  <Link to={to} className="group flex items-start gap-4 p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800 hover:border-teal-500/30 transition-all">
    <div className="p-3 rounded-lg bg-teal-500/10 text-teal-400 group-hover:bg-teal-500 group-hover:text-white transition-colors">
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <h4 className="text-white font-semibold group-hover:text-teal-400 transition-colors">{title}</h4>
      <p className="text-sm text-slate-400 leading-snug">{desc}</p>
    </div>
  </Link>
);

export default function DashboardHome({ user }) {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [localName, setLocalName] = useState(""); 
  const [showSOS, setShowSOS] = useState(false);
  
  const [latestWeight, setLatestWeight] = useState(70);
  const [weightTrend, setWeightTrend] = useState([]);
  
  const [diaActivo, setDiaActivo] = useState(1);
  const [trackerData, setTrackerData] = useState({ agua_vasos: 0, tareas_completadas: [] });
  
  // Nombre: Prioridad Local -> Metadata -> Email
  const displayName = localName || user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Campeón";
  
  // Cálculo Hidratación (35ml x Kg)
  const dailyMl = latestWeight * 35;
  const targetGlasses = Math.ceil(dailyMl / 250);
  const liters = (dailyMl / 1000).toFixed(1);
  const percentHydration = Math.min(100, Math.round((trackerData.agua_vasos / targetGlasses) * 100));

  const diasVisuales = Array.from({ length: 30 }, (_, i) => i + 1);

  useEffect(() => {
    // --- FIX BUG REFRESH ---
    // Solo mostramos el modal si YA tenemos usuario cargado y NO tiene nombre en metadata
    if (user && !user.user_metadata?.full_name && !localName) {
      setShowOnboarding(true);
    }

    if (user) {
      fetchWeightData();
      fetchTrackerData(diaActivo);
    }
  }, [user, diaActivo, localName]);

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

  const fetchTrackerData = async (dia) => {
    const { data } = await supabase
      .from('seguimiento_7dias')
      .select('*')
      .eq('user_id', user.id)
      .eq('dia_numero', dia)
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
        dia_numero: diaActivo,
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
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500 pb-40">
      
      {showOnboarding && <OnboardingModal user={user} onComplete={handleOnboardingComplete} />}
      {showSOS && <SOSCenter onClose={() => setShowSOS(false)} />}
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Hola, {displayName} <span className="animate-wave inline-block">👋</span>
          </h1>
          <p className="text-slate-400 mt-2 flex items-center gap-2">
            <Activity size={16} className="text-teal-400" />
            Panel de Control • Día {diaActivo}
          </p>
        </div>
        
        <button 
          onClick={() => setShowSOS(true)}
          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/50 px-5 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-red-900/20 animate-pulse hover:animate-none"
        >
          <AlertTriangle size={18} />
          SOS: Antojos / Crisis
        </button>
      </div>

      {/* DASHBOARD CENTRAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Tareas (Neutrales) */}
          <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5 text-white">
                <Flame size={120} />
             </div>
             <div className="relative z-10">
                <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                  <Activity className="text-teal-400" /> {PROTOCOLO_BASE.titulo}
                </h3>
                <p className="text-slate-400 text-sm mb-6">Tus innegociables de hoy:</p>
                <div className="space-y-3">
                  {PROTOCOLO_BASE.tareas.map((tarea, idx) => {
                    const isDone = (trackerData.tareas_completadas || []).includes(tarea);
                    return (
                      <div 
                        key={idx} 
                        onClick={() => toggleTarea(tarea)}
                        className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                          isDone 
                            ? "bg-teal-500/10 border-teal-500/40" 
                            : "bg-slate-950/50 border-slate-700 hover:border-slate-600"
                        }`}
                      >
                        <div className={`${isDone ? "text-teal-400" : "text-slate-600"}`}>
                          {isDone ? <CheckCircle className="fill-current" /> : <Circle />}
                        </div>
                        <span className={`flex-1 font-medium ${isDone ? "text-teal-100 line-through decoration-teal-500/50" : "text-slate-300"}`}>
                          {tarea}
                        </span>
                      </div>
                    );
                  })}
                </div>
             </div>
          </div>

          {/* HIDRATACIÓN PREMIUM (Barra de Progreso) */}
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10 w-full">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        <Droplets className="text-blue-400" /> Hidratación
                    </h3>
                    <span className="text-blue-300 font-bold text-sm">{liters}L Meta</span>
                </div>

                {/* Barra de Progreso Visual */}
                <div className="w-full bg-slate-800 h-6 rounded-full overflow-hidden mb-2 relative">
                    <div 
                        className="bg-blue-500 h-full transition-all duration-500 ease-out" 
                        style={{ width: `${percentHydration}%` }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-md">
                        {percentHydration}%
                    </div>
                </div>
                
                <div className="flex justify-between text-slate-500 text-xs mb-6">
                    <span>0L</span>
                    <span>{trackerData.agua_vasos} de {targetGlasses} vasos</span>
                </div>

                <div className="flex gap-3 w-full mb-4">
                    <button 
                        onClick={() => updateTracker({ agua_vasos: Math.max(0, trackerData.agua_vasos - 1) })}
                        className="w-12 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors border border-slate-700"
                    >-</button>
                    <button 
                        onClick={() => updateTracker({ agua_vasos: trackerData.agua_vasos + 1 })}
                        className="flex-1 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-900/30 transition-colors"
                    >+ Registrar Vaso</button>
                </div>

                {/* Nota de Electrolitos (Elegante) */}
                <div className="bg-blue-900/20 border border-blue-800/30 p-3 rounded-xl flex items-start gap-3">
                    <Zap className="text-blue-400 w-4 h-4 mt-0.5 shrink-0" />
                    <p className="text-blue-200/80 text-[11px] leading-snug">
                        Recuerda: El agua sin minerales no hidrata igual. Añade una pizca de sal de mar o limón si sientes sed constante.
                    </p>
                </div>
            </div>
          </div>
      </div>

      {/* HERRAMIENTAS Y ACCESOS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickAction to="/plataforma/planeador" icon={Calendar} title="Planeador" desc="Tu menú semanal." />
          <QuickAction to="/plataforma/gimnasio" icon={Dumbbell} title="Gimnasio" desc="Rutinas digitales." />
          <QuickAction to="/plataforma/bitacora" icon={BookHeart} title="Bitácora" desc="Registra medidas." />
      </div>

      {/* ESTADÍSTICAS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-800/40 border border-slate-700 p-6 rounded-2xl flex flex-col h-80">
            <h3 className="text-lg font-bold text-white mb-4">Tu Evolución</h3>
            <div className="flex-1 w-full min-h-0 relative">
                {weightTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weightTrend}>
                    <defs><linearGradient id="colorPeso" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/><stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="day" stroke="#64748b" fontSize={12} axisLine={false} tickLine={false} />
                    <YAxis domain={['auto', 'auto']} stroke="#64748b" fontSize={12} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }} />
                    <Area type="monotone" dataKey="peso" stroke="#14b8a6" strokeWidth={3} fillOpacity={1} fill="url(#colorPeso)" />
                    </AreaChart>
                </ResponsiveContainer>
                ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 text-sm border-2 border-dashed border-slate-700 rounded-xl">
                    <p>Registra tu peso en la Bitácora.</p>
                </div>
                )}
            </div>
        </div>
        
        <div className="space-y-4">
            <div className="bg-slate-800/40 border border-slate-700 p-6 rounded-2xl">
                <h3 className="text-lg font-bold text-white mb-4"><Award size={20} className="inline mr-2 text-yellow-400" /> Logros</h3>
                <div className="space-y-3">
                  <Achievement title="Fundador" desc="Te uniste al programa." unlocked={true} />
                  <Achievement title="Primer Paso" desc="Registraste tu peso." unlocked={latestWeight !== null} />
                </div>
            </div>
        </div>
      </div>
      
      {/* Selector de Días (Discreto al final) */}
      <div className="pt-8 border-t border-slate-800 opacity-50 hover:opacity-100 transition-opacity">
        <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">Historial</p>
        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
          {diasVisuales.map((d) => (
            <button
              key={d}
              onClick={() => setDiaActivo(d)}
              className={`flex-shrink-0 w-10 h-10 rounded-lg flex flex-col items-center justify-center transition-all border ${
                diaActivo === d
                  ? "bg-teal-600/20 border-teal-500/50 text-teal-400"
                  : "bg-slate-900 border-slate-800 text-slate-600 hover:bg-slate-800"
              }`}
            >
              <span className="text-sm font-bold">{d}</span>
            </button>
          ))}
        </div>
      </div>

      <ChefDanteWidget />
    </div>
  );
}