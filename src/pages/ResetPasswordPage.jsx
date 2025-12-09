// src/pages/ResetPasswordPage.jsx (v2.0 - Detecta Errores de URL)
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle, AlertTriangle, KeyRound } from 'lucide-react';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [viewState, setViewState] = useState('checking'); // 'checking', 'ready', 'error'

  useEffect(() => {
    // Analizar la URL al cargar
    const hash = window.location.hash;
    
    // CASO 1: Error en la URL (Link vencido o usado por Outlook)
    if (hash.includes('error=access_denied') || hash.includes('error_code=otp_expired')) {
      setViewState('error');
      setFeedback({ 
        type: 'error', 
        message: 'Este enlace ha caducado o ya fue utilizado. Por seguridad, los enlaces son de un solo uso.' 
      });
    } 
    // CASO 2: Todo bien (tenemos access_token)
    else if (hash.includes('access_token')) {
      setViewState('ready');
    }
    // CASO 3: Entró directo sin link
    else {
      setViewState('error');
      setFeedback({ type: 'error', message: 'Enlace inválido. Debes llegar aquí desde tu correo.' });
    }
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback({ type: '', message: '' });
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setFeedback({ type: 'success', message: '¡Contraseña actualizada! Redirigiendo...' });
      setTimeout(() => navigate('/auth'), 3000);
    } catch (err) {
      setFeedback({ type: 'error', message: 'No se pudo actualizar. Intenta solicitar un nuevo enlace.' });
    } finally {
      setLoading(false);
    }
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
        </div>

        {/* MENSAJES DE ESTADO */}
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

        {/* FORMULARIO (Solo si el link es válido) */}
        {viewState === 'ready' && (
          <form onSubmit={handleReset} className="space-y-4">
            <input
              type="password" required
              value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Escribe tu nueva contraseña"
              className="w-full px-4 py-3 border border-gray-700 rounded-xl bg-gray-900/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
              disabled={loading || feedback.type === 'success'}
            />
            <button
              type="submit"
              disabled={loading || feedback.type === 'success'}
              className="w-full py-3 font-semibold text-white bg-teal-600 rounded-xl shadow-lg hover:bg-teal-500 transition-all flex justify-center"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Guardar y Entrar'}
            </button>
          </form>
        )}

        {/* BOTÓN PARA REINTENTAR (Si hubo error) */}
        {viewState === 'error' && (
            <button
              onClick={() => navigate('/auth')}
              className="w-full py-3 font-semibold text-slate-300 bg-slate-800 rounded-xl hover:bg-slate-700 transition-all border border-slate-600"
            >
              Volver a solicitar enlace
            </button>
        )}
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;