// src/components/dashboard/DashboardHome.jsx (v2.1 - Links Corregidos)
import React from "react";
import { Link } from 'react-router-dom';
import { 
  Calendar, Utensils, Dumbbell, Award, 
  TrendingUp, ArrowRight, Zap 
} from "lucide-react";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from "recharts";
import OnboardingModal from './OnboardingModal';

// ... (El resto de los componentes StatCard, Achievement, etc se mantienen igual) ...
// Si quieres pégalos de la versión anterior, o usa este código completo:

const weightData = [
  { day: 'Lun', peso: 85.5 }, { day: 'Mar', peso: 85.4 }, 
  { day: 'Mié', peso: 85.2 }, { day: 'Jue', peso: 85.0 }, 
  { day: 'Vie', peso: 84.9 }, { day: 'Sáb', peso: 84.8 }, { day: 'Dom', peso: 84.5 }
];

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
  const [showOnboarding, setShowOnboarding] = React.useState(false);
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Campeón";

  React.useEffect(() => {
    if (user && !user.user_metadata?.full_name) {
      setShowOnboarding(true);
    }
  }, [user]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    window.location.reload();
  };

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
      {showOnboarding && <OnboardingModal user={user} onComplete={handleOnboardingComplete} />}
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Hola, {displayName} <span className="animate-wave inline-block">👋</span>
          </h1>
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
        <StatCard title="Peso Actual" value="--" subtext="Registrar en Bitácora" icon={TrendingUp} color="indigo" />
        <StatCard title="Recetas" value="61" subtext="Disponibles" icon={Utensils} color="orange" />
        <StatCard title="Entrenamientos" value="12" subtext="Nivel 1" icon={Dumbbell} color="emerald" />
      </div>

      {/* ACCESOS RÁPIDOS */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">¿Qué quieres hacer hoy?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickAction 
            to="/plataforma/planeador" 
            icon={Calendar} 
            title="Planificar Menú" 
            desc="Genera tu menú semanal automático o personalízalo."
          />
          {/* ✅ LINK CORREGIDO AQUI */}
          <QuickAction 
            to="/plataforma/gimnasio" 
            icon={Dumbbell} 
            title="Ir al Gimnasio" 
            desc="Rutinas de 20 minutos para acelerar tu metabolismo."
          />
          <QuickAction 
            to="/plataforma/bitacora" 
            icon={TrendingUp} 
            title="Mi Bitácora" 
            desc="Registra tu peso, medidas y sensaciones diarias."
          />
        </div>
      </div>
      
      {/* ... (El resto de la gamificación y gráficas igual que antes) ... */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-800/40 border border-slate-700 p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp size={20} className="text-teal-400" />
              Tendencia de Peso (Demo)
            </h3>
            <Link to="/plataforma/bitacora" className="text-xs text-teal-400 hover:underline">
              Ver detalle completo
            </Link>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weightData}>
                <defs>
                  <linearGradient id="colorPeso" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} axisLine={false} tickLine={false} domain={['dataMin - 1', 'dataMax + 1']} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }} />
                <Area type="monotone" dataKey="peso" stroke="#14b8a6" strokeWidth={3} fillOpacity={1} fill="url(#colorPeso)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-800/40 border border-slate-700 p-6 rounded-2xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Award size={20} className="text-yellow-400" />
              Tus Logros
            </h3>
            <div className="space-y-3">
              <Achievement title="Fundador" desc="Te uniste al programa piloto." unlocked={true} />
              <Achievement title="Primeros Pasos" desc="Completaste tu registro." unlocked={true} />
              <Achievement title="Chef en Casa" desc="Cocina 5 recetas del plan." unlocked={false} />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}