import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext.jsx'; 
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Loader2, CheckCircle, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const AuthInput = ({ id, type, value, onChange, placeholder, icon: Icon, disabled }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Icon className="w-5 h-5 text-gray-500" /></div>
      <input id={id} type={isPassword && showPassword ? 'text' : type} required className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl bg-white text-black placeholder-gray-500 font-medium focus:outline-none focus:ring-4 focus:ring-teal-500/30 focus:border-teal-500 transition-all disabled:opacity-60" value={value} onChange={onChange} placeholder={placeholder} disabled={disabled} />
      {isPassword && <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-teal-600"><{showPassword ? EyeOff : Eye} className="w-5 h-5" /></button>}
    </div>
  );
};

const AuthPage = () => {
  const { signIn, signUp, user } = useUser();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState(''); // Nuevo estado
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => { if (user) navigate('/plataforma/panel-de-control', { replace: true }); }, [user, navigate]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback({ type: '', message: '' });
    try {
      if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/reset` });
        if (error) throw error;
        setFeedback({ type: 'success', message: 'Revisa tu correo para restablecer contraseña.' });
      } else if (mode === 'signup') {
        // Enviar metadata con nombre
        const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
        if (error) throw error;
        if (data.user) setFeedback({ type: 'success', message: '¡Cuenta creada! Revisa tu correo para confirmar.' });
      } else {
        const { error } = await signIn({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message.includes('Invalid login') ? 'Credenciales incorrectas.' : err.message });
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4 font-sans">
      <motion.div key={mode} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 space-y-6">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white tracking-tight">{mode === 'login' ? 'Bienvenido' : mode === 'signup' ? 'Crea tu Cuenta' : 'Recuperar'}</h2>
          <p className="mt-2 text-sm text-gray-400">{mode === 'login' ? 'Inicia sesión para continuar.' : mode === 'signup' ? 'Únete al reto hoy mismo.' : 'Ingresa tu email.'}</p>
        </div>
        <AnimatePresence>{feedback.message && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className={`flex items-start p-3 text-sm rounded-lg ${feedback.type === 'error' ? 'text-red-300 bg-red-500/10' : 'text-green-300 bg-green-500/10'}`}>{feedback.message}</motion.div>}</AnimatePresence>
        <form onSubmit={handleAuth} className="space-y-5">
          {mode === 'signup' && <AuthInput id="name" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nombre Completo" icon={User} disabled={loading} />}
          <AuthInput id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Correo electrónico" icon={Mail} disabled={loading} />
          {mode !== 'reset' && <AuthInput id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" icon={Lock} disabled={loading} />}
          <button type="submit" disabled={loading} className="w-full py-3 font-semibold text-white bg-teal-600 rounded-xl shadow-lg hover:bg-teal-500 transition-all">{loading ? <Loader2 className="animate-spin mx-auto" /> : mode === 'login' ? 'Iniciar Sesión' : mode === 'signup' ? 'Crear Cuenta' : 'Enviar Enlace'}</button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-400">
          {mode === 'login' && <p>¿No tienes cuenta? <button onClick={() => setMode('signup')} className="font-semibold text-teal-400 hover:text-teal-300">Regístrate</button></p>}
          {mode === 'signup' && <p>¿Ya tienes cuenta? <button onClick={() => setMode('login')} className="font-semibold text-teal-400 hover:text-teal-300">Inicia Sesión</button></p>}
          {mode === 'login' && <p className="mt-2 text-xs"><button onClick={() => setMode('reset')} className="text-teal-400 hover:text-teal-300">Olvidé mi contraseña</button></p>}
          {mode === 'reset' && <p className="mt-2 text-xs"><button onClick={() => setMode('login')} className="text-teal-400 flex items-center justify-center w-full"><ArrowLeft className="w-4 h-4 mr-1" /> Volver</button></p>}
        </div>
      </motion.div>
    </div>
  );
};
export default AuthPage;