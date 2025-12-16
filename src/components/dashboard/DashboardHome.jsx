// src/components/dashboard/DashboardHome.jsx
// v6.1 - Con botón para Editar Nombre

import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { 
  Calendar, Utensils, Dumbbell, Award, 
  TrendingUp, ArrowRight, Zap, Activity, Edit2 // <--- Agregamos Edit2
} from "lucide-react";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from "recharts";
import OnboardingModal from './OnboardingModal';
import ChefDanteWidget from '../dante/ChefDanteWidget';

// ... (StatCard, Achievement, QuickAction se quedan IGUAL) ...
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
  const [latestWeight, setLatestWeight] = useState(null);
  const [weightTrend, setWeightTrend] = useState([]);
  
  // Estado local para el nombre
  const [displayName, setDisplayName] = useState("Campeón");

  useEffect(() => {
    if (!user) return;

    // 1. Determinar nombre inicial
    const metaName = user.user_metadata?.full_name;
    const emailName = user.email?.split('@')[0];
    
    if (!metaName || metaName === "Miembro Fundador") {
      setShowOnboarding(true);
      setDisplayName(emailName || "Campeón");
    } else {
      setDisplayName(metaName);
    }

    // 2. Traer datos
    const fetchData = async () => {
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
    fetchData();

  }, [user]);

  const handleOnboardingComplete = (newName) => {
    setDisplayName(newName); 
    setShowOnboarding(false); 
  };

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500 pb-20">
      
      {showOnboarding && <OnboardingModal user={user} onComplete={handleOnboardingComplete} />}
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-3">
             <h1 className="text-3xl md:text-4xl font-bold text-white">
                Hola, {displayName} <span className="animate-wave inline-block">👋</span>
             </h1>
             {/* BOTÓN EDITAR NOMBRE */}
             <button 
                onClick={() => setShowOnboarding(true)}
                className="text-slate-500 hover:text-teal-400 transition-colors p-1 rounded-full hover:bg-slate-800"
                title="Cambiar mi nombre"
             >
                <Edit2 size={18} />
             </button>
          </div>
          <p className="text-slate-400 mt-2 max-w-xl">
            Bienvenido a tu panel de control. Aquí tienes el pulso de tu transformación.
          </p>
        </div>
        <div className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/20 flex items-center gap-2">
          <Zap size={16} className="text-yellow-300" />
          Fase 1: Desintoxicación
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Días Activos" value="Día 1" subtext="Inicio Fuerte" icon={Calendar} color="teal" />
        <StatCard title="Peso Actual" value={latestWeight ? `${latestWeight} kg` : "--"} subtext={latestWeight ? "Último registro" : "Sin datos"} icon={TrendingUp} color="indigo" />
        <StatCard title="Recetas" value="61" subtext="Disponibles" icon={Utensils} color="orange" />
        <StatCard title="Nivel" value="Inicial" subtext="Fundador" icon={Dumbbell} color="emerald" />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">¿Qué quieres hacer hoy?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickAction to="/plataforma/planeador" icon={Calendar} title="Planificar Menú" desc="Genera tu menú semanal automático o personalízalo." />
          <QuickAction to="/plataforma/gimnasio" icon={Dumbbell} title="Ir al Gimnasio" desc="Rutinas de 20 minutos para acelerar tu metabolismo." />
          <QuickAction to="/plataforma/bitacora" icon={BookHeart} title="Mi Bitácora" desc="Registra tu peso, medidas y sensaciones diarias." />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-800/40 border border-slate-700 p-6 rounded-2xl flex flex-col h-96">
          <div className="flex justify-between items-center mb-4 shrink-0">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity size={20} className="text-teal-400" />
              Tendencia de Peso
            </h3>
            <Link to="/plataforma/bitacora" className="text-xs text-teal-400 hover:underline">
              Ver detalle completo
            </Link>
          </div>
          
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
                <Activity size={32} className="mb-2 opacity-50" />
                <p>Aún no hay datos suficientes.</p>
                <Link to="/plataforma/bitacora" className="text-teal-400 mt-2 hover:underline font-bold">
                   + Registrar peso inicial
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-800/40 border border-slate-700 p-6 rounded-2xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Award size={20} className="text-yellow-400" />
              Tus Logros
            </h3>
            <div className="space-y-3">
              <Achievement title="Fundador" desc="Te uniste al programa." unlocked={true} />
              <Achievement title="Primer Paso" desc="Registraste tu peso." unlocked={latestWeight !== null} />
              <Achievement title="Chef en Casa" desc="Usa el planeador." unlocked={false} />
            </div>
          </div>
        </div>
      </div>
      
      <ChefDanteWidget />
    </div>
  );
}