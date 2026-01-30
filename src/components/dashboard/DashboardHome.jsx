// src/components/dashboard/DashboardHome.jsx
// v22.0 - Ajuste Clínico: Fases de 14 días para mayor adherencia

import React, { useState, useEffect, useMemo } from "react";
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { 
  Calendar, Utensils, Dumbbell, Award, 
  TrendingUp, ArrowRight, Activity, BookHeart,
  LifeBuoy, CheckCircle, Circle, Droplets, Flame, AlertTriangle, Zap, Target, Lock, Map, Star, Unlock
} from "lucide-react";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from "recharts";
import OnboardingModal from './OnboardingModal';
import ChefDanteWidget from '../dante/ChefDanteWidget';
import SOSCenter from './SOSCenter';
import WeeklyCheckin from './WeeklyCheckin'; 

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

const WelcomeMission = () => (
  <div className="col-span-1 lg:col-span-3 bg-gradient-to-r from-indigo-950 to-slate-900 border border-indigo-500/30 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
    <div className="absolute top-0 right-0 p-10 opacity-5 text-white">
      <Zap size={250} />
    </div>
    <div className="relative z-10 max-w-3xl">
      <h2 className="text-3xl font-bold text-white mb-2">Bienvenido al Nivel Pro 🚀</h2>
      <p className="text-indigo-200 mb-6 text-lg leading-relaxed">
        Ya conoces la teoría. Ahora vamos a <span className="font-bold text-white">automatizar tu éxito</span>. 
        Esta plataforma ajusta las porciones, menús y rutinas a TUS datos reales.
      </p>
      <p className="text-sm text-slate-400 uppercase tracking-widest font-bold mb-4">Configuración del Sistema:</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/plataforma/bitacora" className="flex flex-col p-4 bg-slate-800/80 hover:bg-indigo-900/50 border border-indigo-500/30 rounded-xl transition-all group">
          <div className="flex items-center justify-between mb-3">
             <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold">1</div>
             <Activity size={20} className="text-indigo-400" />
          </div>
          <h4 className="text-white font-bold mb-1">Calibra tu Metabolismo</h4>
          <p className="text-slate-400 text-xs">Registra tu peso para que el sistema calcule tu hidratación exacta.</p>
        </Link>
        <Link to="/plataforma/planeador" className="flex flex-col p-4 bg-slate-800/80 hover:bg-teal-900/50 border border-slate-700 hover:border-teal-500/30 rounded-xl transition-all group">
          <div className="flex items-center justify-between mb-3">
             <div className="w-8 h-8 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center font-bold">2</div>
             <Calendar size={20} className="text-teal-400" />
          </div>
          <h4 className="text-white font-bold mb-1">Automatiza tu Menú</h4>
          <p className="text-slate-400 text-xs">Genera uno nuevo cada semana según tus gustos.</p>
        </Link>
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex flex-col p-4 bg-slate-800/80 hover:bg-red-900/50 border border-slate-700 hover:border-red-500/30 rounded-xl transition-all text-left">
          <div className="flex items-center justify-between mb-3">
             <div className="w-8 h-8 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center font-bold">3</div>
             <LifeBuoy size={20} className="text-red-400" />
          </div>
          <h4 className="text-white font-bold mb-1">Ubica tu "Escudo"</h4>
          <p className="text-slate-400 text-xs">Arriba a la derecha tienes el botón SOS. Úsalo si sientes ansiedad.</p>
        </button>
      </div>
    </div>
  </div>
);

export default function DashboardHome({ user }) {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [localName, setLocalName] = useState(""); 
  const [showSOS, setShowSOS] = useState(false);
  const [showCheckin, setShowCheckin] = useState(false);
  
  const [latestWeight, setLatestWeight] = useState(null);
  const [weightTrend, setWeightTrend] = useState([]);
  const [trackerData, setTrackerData] = useState({ agua_vasos: 0, tareas_completadas: [] });
  
  const cleanName = localName || user?.user_metadata?.full_name;
  const displayName = (cleanName && cleanName.trim() !== "") ? cleanName : "Campeón";
  
  // --- CÁLCULO DE DÍAS REALES ---
  const daysSinceJoin = useMemo(() => {
    if (!user?.created_at) return 1;
    const created = new Date(user.created_at);
    const today = new Date();
    const diffTime = Math.abs(today - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays || 1;
  }, [user]);

  const [diaActivo, setDiaActivo] = useState(daysSinceJoin);

  // --- PROTOCOLO AJUSTADO (14 DÍAS) ---
  const protocoloDia = useMemo(() => {
    if (diaActivo <= 7) {
      return { 
        titulo: "Desintoxicación", 
        subtitulo: "Semana 1: Limpieza profunda", 
        tareas: ["Agua + Sal al despertar", "Cero azúcar/harinas", "Cena 3h antes de dormir"] 
      };
    } else if (diaActivo <= 14) {
      return { 
        titulo: "Adaptación", 
        subtitulo: "Semana 2: Enseñando al cuerpo a usar grasa", 
        tareas: ["Cumplir meta de agua", "Grasas saludables en cada comida", "Movimiento suave 20 min"] 
      };
    } else if (diaActivo <= 28) {
      return { 
        titulo: "Autocontrol", 
        subtitulo: "Semanas 3-4: Consolidación", 
        tareas: ["Ayuno 12-14h", "Prioridad Proteína", "Gestión de estrés"] 
      };
    } else {
        return { 
            titulo: "Maestría Metabólica", 
            subtitulo: "Estilo de Vida", 
            tareas: ["Ayuno Intuitivo", "Ciclo de Carbohidratos", "Entrenamiento de Fuerza"] 
        };
    }
  }, [diaActivo]);

  // --- FASES DEL SISTEMA (AJUSTADO A 14/28 DÍAS) ---
  const fasesSistema = [
    { 
      id: 1, 
      nombre: "Fase 1: Inmersión", 
      dias: "Días 1-14", 
      status: "active", 
      objetivo: "Desinflamación y adaptación a grasas." 
    },
    { 
      id: 2, 
      nombre: "Fase 2: Consolidación", 
      dias: "Días 15-28", 
      status: daysSinceJoin >= 15 ? "active" : "locked", 
      objetivo: "Ayuno intermitente y flexibilidad.", 
      teaser: "Desbloquea: Protocolos de Ayuno" 
    },
    { 
      id: 3, 
      nombre: "Fase 3: Maestría", 
      dias: "Día 29+", 
      status: daysSinceJoin >= 29 ? "active" : "locked", 
      objetivo: "Aceleración AMPK y longevidad.", 
      teaser: "Desbloquea: Secretos de mantenimiento" 
    }
  ];

  // Cálculo Hidratación
  const calculationWeight = latestWeight || 70;
  const dailyMl = calculationWeight * 35;
  const targetGlasses = Math.ceil(dailyMl / 250);
  const liters = (dailyMl / 1000).toFixed(1);
  const percentHydration = Math.min(100, Math.round((trackerData.agua_vasos / targetGlasses) * 100));

  // Score Diario
  const hydrationScore = Math.min(40, (trackerData.agua_vasos / targetGlasses) * 40);
  const taskScore = (trackerData.tareas_completadas?.length || 0) * 20;
  const dailyScore = Math.round(hydrationScore + taskScore);

  useEffect(() => {
    if (user && !user.user_metadata?.full_name && !localName) {
      setShowOnboarding(true);
    }
    if (user) {
      fetchWeightData();
      fetchTrackerData();
    }
  }, [user, localName, diaActivo]); 

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
    } else {
      setLatestWeight(null); 
    }
  };

  const fetchTrackerData = async () => {
    const { data } = await supabase
      .from('seguimiento_7dias')
      .select('*')
      .eq('user_id', user.id)
      .eq('dia_numero', diaActivo)
      .maybeSingle(); 

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
    <div className="p-6 md:p-10 space-y-10 animate-in fade-in duration-500 pb-40">
      
      {showOnboarding && <OnboardingModal user={user} onComplete={handleOnboardingComplete} />}
      {showSOS && <SOSCenter onClose={() => setShowSOS(false)} />}
      {showCheckin && <WeeklyCheckin user={user} onClose={() => setShowCheckin(false)} />}
      
      {/* HEADER + MÉTRICAS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Hola, {displayName} <span className="animate-wave inline-block">👋</span>
          </h1>
          <div className="flex items-center gap-4 mt-2">
             <div className="flex items-center gap-1 text-orange-400 font-bold bg-orange-400/10 px-3 py-1 rounded-full text-sm">
                <Flame size={16} className="fill-orange-400" />
                <span>Día {daysSinceJoin}</span>
             </div>
             <div className="flex items-center gap-1 text-teal-400 font-bold bg-teal-400/10 px-3 py-1 rounded-full text-sm">
                <Star size={16} className={dailyScore >= 80 ? "fill-teal-400" : ""} />
                <span>Puntaje Hoy: {dailyScore}/100</span>
             </div>
          </div>
        </div>
        
        <button 
          onClick={() => setShowSOS(true)}
          className="w-full md:w-auto bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/50 px-6 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-900/20"
        >
          <AlertTriangle size={18} />
          SOS: Antojos / Crisis
        </button>
      </div>

      {/* RUTA DE EVOLUCIÓN (MAPA CON CANDADOS REALES) */}
      <div className="overflow-x-auto pb-4 scrollbar-hide">
        <div className="flex gap-4 min-w-max">
           {fasesSistema.map((fase) => (
             <div 
                key={fase.id} 
                className={`relative w-80 p-5 rounded-2xl border transition-all ${
                    fase.status === 'active' 
                    ? 'bg-gradient-to-br from-indigo-900/80 to-slate-900 border-indigo-500/50 shadow-lg shadow-indigo-900/20' 
                    : 'bg-slate-900/50 border-slate-800 opacity-60'
                }`}
             >
                {fase.status === 'locked' ? (
                    <div className="absolute top-3 right-3 text-slate-500"><Lock size={16} /></div>
                ) : (
                    <div className="absolute top-3 right-3 text-indigo-400"><Unlock size={16} /></div>
                )}
                
                <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${fase.status === 'active' ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                        {fase.dias}
                    </span>
                    {fase.status === 'active' && <span className="text-[10px] text-indigo-300 font-bold animate-pulse">● ACTIVO</span>}
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{fase.nombre}</h3>
                <p className="text-xs text-slate-400 mb-3">{fase.objetivo}</p>
                
                {fase.status === 'locked' && (
                    <div className="mt-2 p-2 bg-slate-950/50 rounded border border-slate-800 flex items-center gap-2 text-xs text-slate-400">
                        <Lock size={12} /> {fase.teaser}
                    </div>
                )}
             </div>
           ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {latestWeight === null ? (
            <WelcomeMission />
          ) : (
            <>
              {/* Tareas del Día (Dinámicas según Fase) */}
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden">
                <div className="relative z-10">
                    <div className="mb-6">
                        <h3 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                        <Target className="text-teal-400" /> {protocoloDia.titulo}
                        </h3>
                        <p className="text-slate-400 text-sm">{protocoloDia.subtitulo}</p>
                    </div>
                    
                    <div className="space-y-4">
                      {protocoloDia.tareas.map((tarea, idx) => {
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
                            {isDone && <span className="text-xs font-bold text-teal-500 animate-in fade-in">+20 pts</span>}
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
                            <p className="text-slate-400 text-xs mt-1">Calculada para tus {latestWeight}kg</p>
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

                    <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden mb-6">
                        <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${percentHydration}%` }}></div>
                    </div>

                    <div className="flex gap-3 w-full">
                        <button onClick={() => updateTracker({ agua_vasos: Math.max(0, trackerData.agua_vasos - 1) })} className="w-14 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold border border-slate-700">-</button>
                        <button onClick={() => updateTracker({ agua_vasos: trackerData.agua_vasos + 1 })} className="flex-1 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-900/30">+ Registrar Vaso</button>
                    </div>
                </div>
              </div>
            </>
          )}
      </div>

      {/* ACCESOS DIRECTOS */}
      <div>
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Zap className="text-yellow-400" /> Herramientas de Poder
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickAction to="/plataforma/planeador" icon={Calendar} title="Planeador" desc="Tu menú semanal." buttonText="Ver Menú" />
          <QuickAction to="/plataforma/gimnasio" icon={Dumbbell} title="Gimnasio" desc="Rutinas digitales." buttonText="Entrenar" />
          
          <button 
            onClick={() => setShowCheckin(true)}
            className="group flex flex-col justify-between p-5 rounded-2xl bg-indigo-900/20 border border-indigo-500/30 hover:bg-indigo-900/40 hover:border-indigo-400 transition-all h-full text-left"
          >
            <div className="flex items-start gap-4 mb-4">
                <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                  <ClipboardCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-lg group-hover:text-indigo-300 transition-colors">Consulta Semanal</h4>
                  <p className="text-sm text-slate-400 leading-snug mt-1">Dante analizará tu progreso.</p>
                </div>
            </div>
            <div className="flex items-center text-xs font-bold text-indigo-400 uppercase tracking-wider group-hover:underline">
                Iniciar Consulta <ArrowRight size={14} className="ml-1" />
            </div>
          </button>

          <QuickAction to="/plataforma/bitacora" icon={BookHeart} title="Bitácora" desc="Registra medidas." buttonText="Registrar" />
        </div>
      </div>

      {/* GRÁFICA EVOLUCIÓN */}
      {latestWeight !== null && (
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
                <p>Registra tu primer peso para ver la magia.</p>
            </div>
            )}
        </div>
      </div>
      )}
      
      <ChefDanteWidget />
    </div>
  );
}