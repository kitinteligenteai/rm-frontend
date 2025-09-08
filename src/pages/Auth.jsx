// Contenido FINAL, BLINDADO Y CORREGIDO para: src/pages/Auth.jsx

import React, { useState } from 'react';
import { useUser } from '../context/UserContext.jsx';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  // Se obtienen las funciones del contexto. Esto es correcto.
  const { signIn, signUp } = useUser();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // LA CORRECCIÓN CLAVE ESTÁ AQUÍ
      // Se llama a la función (signIn o signUp) y se espera la respuesta.
      const response = isLogin 
        ? await signIn({ email, password }) 
        : await signUp({ email, password });

      // Después de la llamada, se revisa si la respuesta contiene un error.
      // Esta es la forma robusta de manejar la respuesta de Supabase v2.
      if (response.error) {
        // Si hay un error, se lanza para ser capturado por el bloque catch.
        throw response.error;
      }

      // Si NO hay error, la autenticación fue exitosa.
      // Se redirige al usuario al panel de control.
      navigate('/plataforma/panel-de-control', { replace: true });

    } catch (err) {
      // El bloque catch ahora recibe un objeto de error válido.
      // Se muestra el mensaje de error al usuario.
      setError(err.message || 'Ha ocurrido un error inesperado.');
      // IMPORTANTE: Se detiene el 'loading' para que el usuario pueda intentar de nuevo.
      setLoading(false);
    }
    // No es necesario un 'finally' aquí, ya que el loading se maneja en el catch.
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900">
          {isLogin ? 'Acceso a la Plataforma' : 'Crear Nueva Cuenta'}
        </h2>
        <form onSubmit={handleAuth} className="space-y-6">
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
            <input id="email" type="email" required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-gray-700">Contraseña</label>
            <input id="password" type="password" required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" />
          </div>
          {/* Muestra el mensaje de error de forma clara */}
          {error && <p className="text-sm text-center text-red-600 bg-red-50 p-2 rounded-md">{error}</p>}
          <div>
            <button type="submit" disabled={loading} className="w-full px-4 py-2 font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-gray-400">
              {loading ? 'Procesando...' : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')}
            </button>
          </div>
        </form>
        <p className="text-sm text-center text-gray-600">
          {isLogin ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}
          <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="ml-1 font-medium text-teal-600 hover:underline">
            {isLogin ? 'Regístrate' : 'Inicia Sesión'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
