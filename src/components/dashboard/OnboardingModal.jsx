// src/components/dashboard/OnboardingModal.jsx
import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function OnboardingModal({ user, onComplete }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Guardar en metadata de Supabase Auth
    const { error } = await supabase.auth.updateUser({
      data: { full_name: name }
    });

    if (!error) {
      onComplete(); // Recargar página o actualizar estado
      window.location.reload(); // Forzamos recarga para ver el cambio
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 p-8 rounded-2xl max-w-md w-full shadow-2xl text-center">
        <h2 className="text-2xl font-bold text-white mb-2">¡Bienvenido al Programa!</h2>
        <p className="text-slate-400 mb-6">Para personalizar tu experiencia, ¿cómo te gustaría que te llamemos?</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="text" 
            placeholder="Tu Nombre" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-4 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 text-center text-lg"
            autoFocus
            required
          />
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold py-3 rounded-xl transition-colors"
          >
            {loading ? 'Guardando...' : 'Comenzar mi Transformación 🚀'}
          </button>
        </form>
      </div>
    </div>
  );
}