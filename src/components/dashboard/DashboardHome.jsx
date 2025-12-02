// src/components/dashboard/DashboardHome.jsx (Actualizado)
import React, { useState } from "react";
import { Link } from 'react-router-dom';
import { Calendar, Utensils, Dumbbell, Award, TrendingUp, Zap } from "lucide-react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import OnboardingModal from './OnboardingModal'; // <--- IMPORTAR

// ... (StatCard, Achievement se quedan igual) ...
// COPIA LAS MISMAS FUNCIONES StatCard y Achievement DE ANTES AQUÍ

export default function DashboardHome({ user }) {
  const [showOnboarding, setShowOnboarding] = useState(!user?.user_metadata?.full_name);
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0];

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
      {showOnboarding && <OnboardingModal user={user} onComplete={() => setShowOnboarding(false)} />}
      
      {/* ... RESTO DEL CÓDIGO IGUAL QUE ANTES ... */}
      {/* ... Solo asegúrate de que todo el HTML del dashboard esté aquí ... */}
    </div>
  );
}