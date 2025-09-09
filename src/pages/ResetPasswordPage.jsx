// CÓDIGO DEFINITIVO para: src/pages/ResetPasswordPage.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [isReady, setIsReady] = useState(false);

  // Este useEffect verifica si el componente está listo para recibir la nueva contraseña.
  // Supabase añade el token de acceso al URL como un hash (#).
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash.includes('access_token')) {
        setIsReady(true);
      }
    };
    
    // Comprobar el hash al cargar la página
    handleHashChange();

    // Escuchar cambios en el hash (para SPAs)
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();
    if (!isReady) {
        setFeedback({ type: 'error', message: 'Token inválido o expirado. Por favor, solicita un nuevo enlace.' });
        return;
    }
    setLoading(true);
    setFeedback({ type: '', message: '' });
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setFeedback({ type: 'success', message: '¡Contraseña actualizada con éxito! Serás redirigido al inicio de sesión.' });
      setTimeout(() => navigate('/auth'), 3000);
    } catch (err) {
      setFeedback({ type: 'error', message: 'No se pudo actualizar la contraseña. El enlace puede haber expirado.' });
    } finally {
      setLoading(false);
    }
  };

  if (!isReady && !window.location.hash) {
      // Muestra un estado de espera o un mensaje si se accede a la URL directamente sin un token
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
              <p>Verificando enlace...</p>
          </div>
      );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 space-y-6"
      >
        <div className="text-center">
            <h2 className="text-3xl font-bold text-white">Establecer Nueva Contraseña</h2>
            <p className="mt-2 text-sm text-gray-400">Elige una contraseña segura que no hayas usado antes.</p>
        </div>

        <AnimatePresence>
          {feedback.message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className={`flex items-start p-3 text-sm rounded-lg ${
                feedback.type === 'error' ? 'text-red-300 bg-red-500/10' : 'text-green-300 bg-green-500/10'
              }`}
            >
              {feedback.type === 'error' ? <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" /> : <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />}
              <span>{feedback.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleReset} className="space-y-4">
          <input
            type="password" required
            value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Nueva contraseña"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all duration-300"
            disabled={loading || feedback.type === 'success'}
          />
          <button
            type="submit"
            disabled={loading || feedback.type === 'success'}
            className="w-full py-3 font-semibold text-white bg-teal-600 rounded-xl shadow-lg hover:bg-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/50 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300 ease-in-out"
          >
            {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Actualizar Contraseña'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
