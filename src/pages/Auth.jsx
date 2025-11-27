// RUTA: src/pages/Auth.jsx
// Versión v2.2 - High Contrast Inputs

import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext.jsx'; 
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowLeft, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

// ✅ MEJORA: Input con fondo blanco absoluto y texto negro sólido
const AuthInput = ({ id, type, value, onChange, placeholder, icon: Icon, disabled }) => (
  <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
      <Icon className="w-5 h-5 text-gray-500" />
    </div>
    <input
      id={id} 
      type={type} 
      required
      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl bg-white text-black placeholder-gray-500 font-medium focus:outline-none focus:ring-4 focus:ring-teal-500/30 focus:border-teal-500 transition-all duration-200 disabled:opacity-60 disabled:bg-gray-200"
      value={value} 
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
    />
  </div>
);

const AuthPage = () => {
  const { signIn, signUp, user } = useUser();
  const navigate = useNavigate();

  const [mode, setMode] = useState('login'); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    if (user) navigate('/plataforma/panel-de-control', { replace: true });
  }, [user, navigate]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback({ type: '', message: '' });

    try {
      if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/reset` });
        if (error) throw error;
        setFeedback({ type: 'success', message: '¡Revisa tu correo! Te enviamos un enlace para restablecer tu contraseña.' });
      } else {
        const { data, error } = mode === 'login' ? await signIn({ email, password }) : await signUp({ email, password });
        if (error) throw error;
        if (mode === 'signup' && data.user) {
          setFeedback({ type: 'success', message: '¡Cuenta creada! Revisa tu correo para la verificación final.' });
          setTimeout(() => navigate('/plataforma/panel-de-control', { replace: true }), 3000);
        }
      }
    } catch (err) {
      const errorMessages = {
        'Invalid login credentials': 'Email o contraseña incorrectos.',
        'User already registered': 'Este email ya está registrado.',
        'Email not confirmed': 'Tu email aún no ha sido verificado.'
      };
      const message = errorMessages[err.message] || 'Ha ocurrido un error inesperado. Inténtalo de nuevo.';
      setFeedback({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setEmail('');
    setPassword('');
    setFeedback({ type: '', message: '' });
  };

  const isFormDisabled = loading || feedback.type === 'success';

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
  };

  const feedbackVariants = {
    hidden: { opacity: 0, height: 0, y: -10 },
    visible: { opacity: 1, height: 'auto', y: 0 },
    exit: { opacity: 0, height: 0, y: -10, transition: { duration: 0.2 } }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4 font-sans">
      <motion.div
        key={mode}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 space-y-6"
      >
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white tracking-tight">
            {mode === 'login' && 'Bienvenido'}
            {mode === 'signup' && 'Crea tu Cuenta'}
            {mode === 'reset' && 'Recupera tu Acceso'}
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            {mode === 'login' && 'Inicia sesión para continuar.'}
            {mode === 'signup' && 'Unos pocos datos y estarás dentro.'}
            {mode === 'reset' && 'Ingresa tu email para recibir el enlace.'}
          </p>
        </div>
        
        <AnimatePresence>
          {feedback.message && (
            <motion.div
              variants={feedbackVariants}
              initial="hidden" animate="visible" exit="exit"
              className={`flex items-start p-3 text-sm rounded-lg ${
                feedback.type === 'error' ? 'text-red-300 bg-red-500/10' : 'text-green-300 bg-green-500/10'
              }`}
            >
              {feedback.type === 'error' ? <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" /> : <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />}
              <span>{feedback.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.form variants={formVariants} initial="hidden" animate="visible" onSubmit={handleAuth} className="space-y-5">
          <motion.div variants={formVariants}><AuthInput id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Correo electrónico" icon={Mail} disabled={isFormDisabled} /></motion.div>
          {mode !== 'reset' && <motion.div variants={formVariants}><AuthInput id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" icon={Lock} disabled={isFormDisabled} /></motion.div>}

          <motion.div variants={formVariants}>
            <button type="submit" disabled={isFormDisabled} className="w-full py-3 font-semibold text-white bg-teal-600 rounded-xl shadow-lg hover:bg-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/50 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300 ease-in-out">
              <AnimatePresence mode="wait">
                <motion.span key={loading ? 'loading' : 'ready'} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="flex items-center justify-center">
                  {loading ? <Loader2 className="animate-spin" /> : mode === 'login' ? 'Iniciar Sesión' : mode === 'signup' ? 'Crear Cuenta' : 'Enviar Enlace'}
                </motion.span>
              </AnimatePresence>
            </button>
          </motion.div>
        </motion.form>

        <div className="mt-6 text-center text-sm text-gray-400">
          {mode === 'login' && (
            <p>¿No tienes cuenta? <button onClick={() => handleModeChange('signup')} className="font-semibold text-teal-400 hover:text-teal-300 transition">Regístrate</button></p>
          )}
          {mode === 'signup' && (
            <p>¿Ya tienes una cuenta? <button onClick={() => handleModeChange('login')} className="font-semibold text-teal-400 hover:text-teal-300 transition">Inicia Sesión</button></p>
          )}
          {mode === 'login' && (
            <p className="mt-2 text-xs">¿Olvidaste tu contraseña? <button onClick={() => handleModeChange('reset')} className="font-semibold text-teal-400 hover:text-teal-300 transition">Recupérala</button></p>
          )}
          {mode === 'reset' && (
            <p className="mt-2 text-xs"><button onClick={() => handleModeChange('login')} className="font-semibold text-teal-400 hover:text-teal-300 transition flex items-center justify-center w-full"><ArrowLeft className="w-4 h-4 mr-1" /> Volver a Inicio de Sesión</button></p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;