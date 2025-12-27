// src/components/dashboard/DashboardHome.jsx
// v8.0 - Fusión: Dashboard v7 + Tracker Interactivo de 7 Días

import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { 
  Calendar, Utensils, Dumbbell, Award, 
  TrendingUp, ArrowRight, Activity, BookHeart,
  LifeBuoy, CheckCircle, Circle, Droplets, Flame
} from "lucide-react";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from "recharts";
import OnboardingModal from './OnboardingModal';
import ChefDanteWidget from '../dante/ChefDanteWidget';
import SOSCenter from './SOSCenter';

// --- CONFIGURACIÓN DEL PLAN DE 7 DÍAS (Manual Maestro) ---
const PLAN_7_DIAS = [
  { dia: 1, fase: "Desintoxicación", titulo: "Adiós Inflamación", tareas: ["Vaso de agua con limón al despertar", "Eliminar azúcar y harinas blancas", "Cena ligera antes de las 8 PM"] },
  { dia: 2, fase: "Desintoxicación", titulo: "Hidratación Profunda", tareas: ["Beber 3 litros de agua hoy", "Añadir pizca de sal marina al agua", "Caminata de 15 min post-comida"] },
  { dia: 3, fase: "Desintoxicación", titulo: "Descanso Digestivo", tareas: ["Ayuno nocturno de 12 horas", "Infusión relajante antes de dormir", "Dormir antes de las 10:30 PM"] },
  { dia: 4, fase: "Reactivación", titulo: "Densidad Nutricional", tareas: ["Desayuno alto en proteínas", "Cero aceites vegetales hoy", "Consumir aguacate o aceite de oliva"] },
  { dia: 5, fase: "Reactivación", titulo: "Movimiento Estratégico", tareas: ["Rutina de fuerza (20 min)", "Ducha de contraste frío/calor", "Comer hasta la saciedad, no reventar"] },
  { dia: 6, fase: "Optimización", titulo: "Flexibilidad Metabólica", tareas: ["Ayuno de 14 horas (opcional)", "Primera comida baja en carbohidratos", "5 minutos de respiración consciente"] },
  { dia: 7, fase: "Optimización", titulo: "Celebración", tareas: ["Planificar menú de la próxima semana", "Comida libre consciente", "Agradecer a tu cuerpo"] },
];

// --- COMPONENTES VISUALES ---

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

// --- COMPONENTE PRINCIPAL ---

export default function DashboardHome({ user }) {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSOS, setShowSOS] = useState(false);
  
  // Datos de Peso (Existente)
  const [latestWeight, setLatestWeight] = useState(null);
  const [weightTrend, setWeightTrend] = useState([]);

  // Datos del Tracker de 7 Días (Nuevo)
  const [diaActivo, setDiaActivo] = useState(1);
  const [trackerData, setTrackerData] = useState({ agua_vasos: 0, tareas_completadas: [] });
  const [loadingTracker, setLoadingTracker] = useState(false);
  
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Campeón";
  const infoDia = PLAN_7_DIAS.find(d => d.dia === diaActivo);

  useEffect(() => {
    // 1. Validar nombre (Onboarding)
    const currentName = user?.user_metadata?.full_name;
    if (!currentName || currentName === "Miembro Fundador") {
      setShowOnboarding(true);
    }

    if (user) {
      fetchWeightData();
      fetchTrackerData(diaActivo);
    }
  }, [user, diaActivo]);

  // --- LOGICA DE PESO (Tu código original) ---
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

  // --- LOGICA DEL TRACKER (Nueva funcionalidad) ---
  const fetchTrackerData = async (dia) => {
    setLoadingTracker(true);
    const { data } = await supabase
      .from('seguimiento_7dias')
      .select('*')
      .eq('user_id', user.id)
      .eq('dia_numero', dia)
      .single();

    if (data) {
      setTrackerData(data);
    } else {
      setTrackerData({ agua_vasos: 0, tareas_completadas: [] });
    }
    setLoadingTracker(false);
  };

  const updateTracker = async (updates) => {
    // Actualización optimista (UI instantánea)
    setTrackerData(prev => ({ ...prev, ...updates }));

    // Guardar en DB
    const { error } = await supabase
      .from('seguimiento_7dias')
      .upsert({
        user_id: user.id,
        dia_numero: diaActivo,
        ...updates,
        updated_at: new Date()
      }, { onConflict: 'user_id, dia_numero' });

    if (error) console.error("Error guardando tracker:", error);
  };

  const toggleTarea = (tarea) => {
    const actuales = trackerData.tareas_completadas || [];
    const nuevaLista = actuales.includes(tarea)
      ? actuales.filter(t => t !== tarea)
      : [...actuales, tarea];
    updateTracker({ tareas_completadas: nuevaLista });
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    window.location.reload();
  };

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500 pb-24">
      
      {/* MODALES */}
      {showOnboarding && <OnboardingModal user={user} onComplete={handleOnboardingComplete} />}
      {showSOS && <SOSCenter onClose={() => setShowSOS(false)} />}
      
      {/* HEADER + BOTÓN SOS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Hola, {displayName} <span className="animate-wave inline-block">👋</span>
          </h1>
          <p className="text-slate-400 mt-2">
            Día {diaActivo} del Reinicio: <span className="text-teal-400 font-bold">{infoDia.fase}</span>
          </p>
        </div>
        
        <button 
          onClick={() => setShowSOS(true)}
          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/50 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-red-900/20"
        >
          <LifeBuoy size={18} />
          SOS
        </button>
      </div>

      {/* --- SECCIÓN NUEVA: TRACKER DE 7 DÍAS --- */}
      <div className="space-y-6">
        {/* Selector de Días */}
        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
          {PLAN_7_DIAS.map((d) => (
            <button
              key={d.dia}
              onClick={() => setDiaActivo(d.dia)}
              className={`flex-shrink-0 w-16 h-20 rounded-xl flex flex-col items-center justify-center transition-all border ${
                diaActivo === d.dia
                  ? "bg-teal-600 border-teal-500 text-white shadow-lg scale-105"
                  : "bg-slate-800 border-slate-700 text-slate-500 hover:bg-slate-750"
              }`}
            >
              <span className="text-xs font-bold uppercase mb-1">DÍA</span>
              <span className="text-2xl font-black">{d.dia}</span>
            </button>
          ))}
        </div>

        {/* Panel Interactivo del Día */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna Izquierda: Tareas */}
          <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5 text-white">
                <Flame size={120} />
             </div>
             
             <div className="relative z-10">
                <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                  <Activity className="text-teal-400" /> 
                  {infoDia.titulo}
                </h3>
                <p className="text-slate-400 text-sm mb-6">Objetivos críticos para hoy:</p>
                
                <div className="space-y-3">
                  {infoDia.tareas.map((tarea, idx) => {
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

          {/* Columna Derecha: Hidratación */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 flex flex-col justify-center items-center text-center">
            <div className="bg-blue-500/10 p-4 rounded-full mb-4">
              <Droplets className="text-blue-400 w-10 h-10" />
            </div>
            <h3 className="text-white font-bold text-lg">Hidratación</h3>
            <p className="text-slate-400 text-xs mb-4">Meta diaria: 8 vasos</p>
            
            <div className="text-4xl font-black text-white mb-6">
              {trackerData.agua_vasos}<span className="text-lg text-slate-500 font-medium">/8</span>
            </div>

            <div className="flex gap-3 w-full">
              <button 
                onClick={() => updateTracker({ agua_vasos: Math.max(0, trackerData.agua_vasos - 1) })}
                className="flex-1 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold transition-colors"
              >-</button>
              <button 
                onClick={() => updateTracker({ agua_vasos: trackerData.agua_vasos + 1 })}
                className="flex-[2] py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-900/30 transition-colors"
              >+ Beber Vaso</button>
            </div>
          </div>
        </div>
      </div>
      {/* --- FIN SECCIÓN TRACKER --- */}


      {/* STATS GENERALES (Tu diseño original) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <StatCard title="Peso Inicial" value={latestWeight ? `${latestWeight} kg` : "--"} subtext="Tu punto de partida" icon={TrendingUp} color="indigo" />
        <StatCard title="Fase Actual" value={infoDia.fase} subtext={`Día ${diaActivo}`} icon={Activity} color="teal" />
        <StatCard title="Recetas" value="61" subtext="Disponibles" icon={Utensils} color="orange" />
        <StatCard title="Nivel" value="Iniciado" subtext="Fundador" icon={Award} color="emerald" />
      </div>

      {/* ACCESOS RÁPIDOS */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Herramientas Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickAction to="/plataforma/planeador" icon={Calendar} title="Planificar Menú" desc="Genera tu menú semanal automático." />
          <QuickAction to="/plataforma/gimnasio" icon={Dumbbell} title="Gimnasio Digital" desc="Rutinas de 20 minutos en video." />
          <QuickAction to="/plataforma/bitacora" icon={BookHeart} title="Bitácora" desc="Registra tus cambios y medidas." />
        </div>
      </div>
      
      {/* GRÁFICA DE PESO (Tu diseño original) */}
      <div className="bg-slate-800/40 border border-slate-700 p-6 rounded-2xl flex flex-col h-80">
        <h3 className="text-lg font-bold text-white mb-4">Tu Evolución</h3>
        <div className="flex-1 w-full min-h-0 relative">
          {weightTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weightTrend}>
                <defs>
                  <linearGradient id="colorPeso" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} axisLine={false} tickLine={false} />
                <YAxis domain={['auto', 'auto']} stroke="#64748b" fontSize={12} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }} />
                <Area type="monotone" dataKey="peso" stroke="#14b8a6" strokeWidth={3} fillOpacity={1} fill="url(#colorPeso)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 text-sm border-2 border-dashed border-slate-700 rounded-xl">
              <p>Registra tu peso en la Bitácora para ver tu gráfica.</p>
            </div>
          )}
        </div>
      </div>
      
      <ChefDanteWidget />
    </div>
  );
}