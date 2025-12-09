// src/pages/Auth.jsx
import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext.jsx'; 
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Loader2, AlertTriangle, Eye, EyeOff, ArrowLeft, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const AuthInput = ({ id, type, value, onChange, placeholder, icon: Icon, disabled }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Icon className="w-5 h-5 text-gray-500" /></div>
      <input id={id} type={inputType} required className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl bg-white text-black placeholder-gray-500 font-medium focus:outline-none focus:ring-4 focus:ring-teal-500/30 focus:border-teal-500 transition-all duration-200 disabled:opacity-60 disabled:bg-gray-200" value={value} onChange={onChange} placeholder={placeholder} disabled={disabled} />
      {isPassword && <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-teal-600 transition-colors focus:outline-none">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>}
    </div>
  );
};

const AuthPage = () => {
  const { signIn, user } = useUser();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => { if (user) navigate('/plataforma/panel-de-control', { replace: true }); }, [user, navigate]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback({ type: '', message: '' });

    try {
      if (mode === 'reset') {
        // ✅ CORRECCIÓN: Apuntamos a la ruta exacta de la app
        const { error } = await supabase.auth.resetPasswordForEmail(email, { 
            redirectTo: `${window.location.origin}/reset-password` 
        });
        if (error) throw error;
        setFeedback({ type: 'success', message: 'Revisa tu correo. El enlace te llevará a crear una nueva contraseña.' });
      } else {
        const { error } = await signIn({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message.includes('Invalid login') ? 'Correo o contraseña incorrectos.' : err.message });
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4 font-sans">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-teal-500/20 mb-4"><ShieldCheck className="w-6 h-6 text-teal-400" /></div>
          <h2 className="text-3xl font-bold text-white tracking-tight">{mode === 'login' ? 'Acceso Miembros' : 'Recuperar Acceso'}</h2>
          <p className="mt-2 text-sm text-slate-400">{mode === 'login' ? 'Ingresa tus credenciales.' : 'Te enviaremos un enlace seguro.'}</p>
        </div>
        
        <AnimatePresence>{feedback.message && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className={`flex items-start p-3 text-sm rounded-lg ${feedback.type === 'error' ? 'text-red-300 bg-red-500/10' : 'text-green-300 bg-green-500/10'}`}>{feedback.message}</motion.div>}</AnimatePresence>

        <form onSubmit={handleAuth} className="space-y-5">
          <AuthInput id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Correo electrónico" icon={Mail} disabled={loading} />
          {mode === 'login' && <AuthInput id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" icon={Lock} disabled={loading} />}
          
          <button type="submit" disabled={loading} className="w-full py-3 font-semibold text-white bg-teal-600 rounded-xl shadow-lg hover:bg-teal-500 transition-all flex items-center justify-center gap-2">
            {loading ? <Loader2 className="animate-spin" /> : mode === 'login' ? 'Entrar' : 'Enviar Enlace'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          {mode === 'login' ? (
            <p className="mb-2"><button onClick={() => setMode('reset')} className="text-teal-400 hover:underline">¿Olvidaste tu contraseña?</button></p>
          ) : (
            <button onClick={() => setMode('login')} className="text-teal-400 flex items-center justify-center w-full gap-2"><ArrowLeft className="w-4 h-4" /> Volver al Login</button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
export default AuthPage;