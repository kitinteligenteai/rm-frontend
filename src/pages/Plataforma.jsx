// src/pages/Plataforma.jsx (v3.0 - Integración Total de Módulos)
import React from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext'; 
import { 
  LayoutDashboard, BookOpen, Dumbbell, LogOut, 
  Utensils, Calendar, BookHeart, PlayCircle 
} from 'lucide-react';

/* --- IMPORTACIÓN DE MÓDULOS REALES --- */
import Planeador from './Planeador';
import BovedaRecetas from './BovedaRecetas'; // Asegúrate que el nombre del archivo coincida
import Gimnasio from './Gimnasio';
import Bitacora from './Bitacora';
import Biblioteca from './Biblioteca';

/* --- COMPONENTES VISUALES INTERNOS --- */

const StatCard = ({ title, value, subtext, color = "teal" }) => (
  <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-2xl">
    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
    <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
    <p className={`text-xs text-${color}-400`}>{subtext}</p>
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

const DashboardHome = ({ user }) => (
  <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
    {/* Header del Dashboard */}
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-white">Hola, {user?.email?.split('@')[0]} 👋</h1>
        <p className="text-slate-400 mt-1">Bienvenido al Día 1 de tu Reinicio Metabólico.</p>
      </div>
      <div className="flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 px-4 py-2 rounded-full text-teal-400 text-sm font-medium">
        <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
        Fase 1: Desintoxicación
      </div>
    </div>

    {/* Stats Row */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard title="Progreso" value="0%" subtext="Completado del plan" />
      <StatCard title="Estado" value="Activo" subtext="Suscripción Premium" color="emerald" />
      <StatCard title="Recetas" value="60+" subtext="Disponibles hoy" color="indigo" />
      <StatCard title="Rutina" value="Descanso" subtext="Toca mañana" color="slate" />
    </div>

    {/* Accesos Rápidos */}
    <div>
      <h3 className="text-lg font-semibold text-white mb-4">¿Qué quieres hacer hoy?</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <QuickAction 
          to="/plataforma/planeador" 
          icon={Calendar} 
          title="Planificar Menú" 
          desc="Genera tu menú semanal automático o personalízalo."
        />
        <QuickAction 
          to="/plataforma/entrenamientos" 
          icon={Dumbbell} 
          title="Ir al Gimnasio" 
          desc="Rutinas de 20 minutos para acelerar tu metabolismo."
        />
        <QuickAction 
          to="/plataforma/bitacora" 
          icon={BookHeart} 
          title="Mi Bitácora" 
          desc="Registra tu peso, medidas y sensaciones diarias."
        />
      </div>
    </div>

    {/* Banner Educativo */}
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 to-slate-900 p-8 border border-white/10">
      <div className="relative z-10 max-w-xl">
        <h3 className="text-2xl font-bold text-white mb-2">Comienza por lo básico</h3>
        <p className="text-indigo-200 mb-6">
          Antes de empezar, lee la "Guía de Inicio Rápido" para entender los 3 pilares del sistema.
        </p>
        <Link 
          to="/plataforma/biblioteca" 
          className="bg-white text-indigo-900 font-bold py-2 px-5 rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-2 w-fit"
        >
          <BookOpen className="w-5 h-5" /> Leer Guía de Inicio
        </Link>
      </div>
      <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-indigo-500/20 to-transparent pointer-events-none"></div>
    </div>
  </div>
);

/* --- LAYOUT PRINCIPAL --- */

export default function Plataforma() {
  const { user, signOut } = useUser();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/auth";
  };

  const NavItem = ({ to, icon: Icon, label }) => {
    const isActive = location.pathname.includes(to);
    return (
      <Link 
        to={to} 
        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
          isActive 
            ? "bg-teal-500/10 text-teal-400 border border-teal-500/20" 
            : "text-slate-400 hover:bg-slate-800 hover:text-white"
        }`}
      >
        <Icon className={`w-5 h-5 ${isActive ? "text-teal-400" : "text-slate-500"}`} />
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 flex text-slate-100 font-sans">
      {/* SIDEBAR (Desktop) */}
      <aside className="w-72 bg-slate-900 border-r border-slate-800 hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-emerald-600 rounded-lg"></div>
            <span className="text-xl font-bold text-white tracking-tight">Reinicio M.</span>
          </div>
          
          <nav className="space-y-1">
            <NavItem to="/plataforma/panel-de-control" icon={LayoutDashboard} label="Panel de Control" />
            <div className="pt-4 pb-2">
              <p className="px-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Herramientas</p>
            </div>
            <NavItem to="/plataforma/planeador" icon={Calendar} label="Planeador Semanal" />
            <NavItem to="/plataforma/recetas" icon={Utensils} label="Bóveda de Recetas" />
            <NavItem to="/plataforma/entrenamientos" icon={Dumbbell} label="Gimnasio Digital" />
            <NavItem to="/plataforma/bitacora" icon={BookHeart} label="Bitácora" />
            <NavItem to="/plataforma/biblioteca" icon={BookOpen} label="Biblioteca" />
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4 p-2 bg-slate-800/50 rounded-lg">
            <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white">
              {user?.email?.[0].toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-white truncate max-w-[120px]">{user?.email}</p>
              <p className="text-[10px] text-teal-400">Plan Premium</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
          >
            <LogOut className="w-4 h-4" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 min-w-0 bg-slate-950 overflow-y-auto">
        {/* Mobile Header */}
        <header className="md:hidden h-16 border-b border-slate-800 flex items-center justify-between px-4 bg-slate-900 sticky top-0 z-20">
          <span className="font-bold text-white">Reinicio Metabólico</span>
          <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-white">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        {/* Rutas Internas del Dashboard */}
        <Routes>
          <Route path="panel-de-control" element={<DashboardHome user={user} />} />
          
          {/* ✅ MÓDULOS ACTIVOS */}
          <Route path="planeador" element={<Planeador />} />
          <Route path="recetas" element={<BovedaRecetas />} />
          <Route path="entrenamientos" element={<Gimnasio />} />
          <Route path="bitacora" element={<Bitacora />} />
          <Route path="biblioteca" element={<Biblioteca />} />
          
          {/* Default */}
          <Route path="*" element={<Navigate to="panel-de-control" replace />} />
        </Routes>
      </main>
    </div>
  );
}