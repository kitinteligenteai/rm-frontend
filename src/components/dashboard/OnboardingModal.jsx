// src/components/dashboard/OnboardingModal.jsx
// v2.0 - Fix: Sin recarga de página para evitar bucles

import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Loader2 } from 'lucide-react';

export default function OnboardingModal({ user, onComplete }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setLoading(true);
    
    try {
      // 1. Guardar en metadata de Supabase Auth
      const { error } = await supabase.auth.updateUser({
        data: { full_name: name }
      });

      if (error) throw error;

      // 2. ÉXITO: No recargamos. Solo avisamos al padre que terminamos.
      // El UserContext detectará el cambio automáticamente.
      onComplete(); 

    } catch (err) {
      console.error("Error al guardar nombre:", err);
      alert("Hubo un pequeño error al guardar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 p-8 rounded-2xl max-w-md w-full shadow-2xl text-center relative">
        
        <h2 className="text-2xl font-bold text-white mb-2">¡Bienvenido al Programa!</h2>
        <p className="text-slate-400 mb-6">Para personalizar tu experiencia, ¿cómo te gustaría que te llamemos?</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input 
              type="text" 
              placeholder="Tu Nombre" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-4 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 text-center text-lg font-medium"
              autoFocus
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-900 font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Comenzar mi Transformación 🚀'}
          </button>
        </form>

      </div>
    </div>
  );
}