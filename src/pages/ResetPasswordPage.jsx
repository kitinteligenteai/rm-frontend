// src/pages/ResetPasswordPage.jsx
// v5.0 - Final: Con Ojito y Validación de URL

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle, AlertTriangle, KeyRound, Eye, EyeOff } from 'lucide-react';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Estado para el ojito
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [viewState, setViewState] = useState('checking'); // 'checking', 'ready', 'error'

  useEffect(() => {
    const hash = window.location.hash;
    // Detección robusta de errores en la URL (Link vencido o usado)
    if (hash.includes('error=access_denied') || hash.includes('error_code=otp_expired')) {
      setViewState('error');
      setFeedback({ type: 'error', message: 'El enlace ha caducado. Solicita uno nuevo.' });
    } else if (hash.includes('access_token') || hash.includes('type=recovery')) {
      setViewState('ready');
    } else {
      // Si no hay hash, tal vez el usuario llegó directo. Lo mandamos a error.
      setViewState('error');
      setFeedback({ type: 'error', message: 'Enlace no válido.' });
    }
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
        setFeedback({ type: 'error', message: 'La contraseña debe tener al menos 6 caracteres.' });
        return;
    }

    setLoading(true);
    setFeedback({ type: '', message: '' });

    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) throw error;

      // ÉXITO REAL
      setFeedback({ type: 'success', message: '¡Contraseña guardada! Iniciando sesión...' });
      
      // Esperamos 2 segundos para que el usuario lea el éxito y redirigimos
      setTimeout(() => {
          navigate('/auth'); 
      }, 2000);

    } catch (err) {
      console.error("Reset Error:", err);
      setFeedback({ type: 'error', message: 'Hubo un problema. Intenta de nuevo.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestNewLink = () => {
      navigate('/auth'); // Mandar al login para que pida "Olvidé contraseña"
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 space-y-6"
      >
        <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-500/20 mb-4">
                <KeyRound className="w-6 h-6 text-indigo-400" />
            </div>
            <h2 className="text-3xl font-bold text-white">Nueva Contraseña</h2>
            {viewState === 'ready' && <p className="text-slate-400 text-sm mt-2">Crea una clave segura para tu cuenta.</p>}
        </div>

        <AnimatePresence>
          {feedback.message && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              className={`flex items-start p-4 rounded-xl border ${
                feedback.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-200' : 'bg-green-500/10 border-green-500/20 text-green-200'
              }`}
            >
              {feedback.type === 'error' ? <AlertTriangle className="w-5 h-5 mr-3 shrink-0" /> : <CheckCircle className="w-5 h-5 mr-3 shrink-0" />}
              <span className="text-sm">{feedback.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {viewState === 'ready' && (
          <form onSubmit={handleReset} className="space-y-6">
            <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Escribe tu nueva contraseña"
                  className="w-full px-4 py-3 border border-gray-700 rounded-xl bg-gray-900/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all pr-12"
                  disabled={loading || feedback.type === 'success'}
                />
                <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-white"
                >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>

            <button
              type="submit"
              disabled={loading || feedback.type === 'success'}
              className="w-full py-3.5 font-bold text-slate-900 bg-teal-500 rounded-xl shadow-lg hover:bg-teal-400 transition-all flex justify-center items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Guardar y Entrar'}
            </button>
          </form>
        )}

        {viewState === 'error' && (
            <div className="text-center">
                <button
                onClick={handleRequestNewLink}
                className="w-full py-3 font-semibold text-slate-300 bg-slate-800 rounded-xl hover:bg-slate-700 transition-all border border-slate-600"
                >
                Volver a solicitar enlace
                </button>
            </div>
        )}
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;