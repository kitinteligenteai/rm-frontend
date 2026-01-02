import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { User, ArrowRight, Loader2 } from 'lucide-react';

export default function OnboardingModal({ user, onComplete }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      // 1. Guardar en Supabase Auth (Metadata)
      const { error } = await supabase.auth.updateUser({
        data: { full_name: name }
      });

      if (error) throw error;

      // 2. Ejecutar callback para actualizar UI sin recargar
      onComplete(name); 

    } catch (error) {
      console.error('Error al guardar nombre:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md p-8 rounded-3xl shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">¡Bienvenido!</h2>
          <p className="text-slate-400">Para personalizar tu experiencia, ¿cómo te gustaría que te llamemos?</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu Nombre"
              className="w-full bg-slate-800 border border-slate-700 text-white pl-12 pr-4 py-4 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all placeholder:text-slate-600"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-900/20"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                Comenzar mi Transformación <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}