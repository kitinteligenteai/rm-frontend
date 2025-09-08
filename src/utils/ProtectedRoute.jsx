// Contenido DECLARATIVO Y MEJORADO para: src/pages/utils/ProtectedRoute.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useUser();

  // 1. Mientras carga, muestra un loader claro. Cero pantallas en blanco.
  if (loading) {
    return <div className="flex h-screen w-full items-center justify-center bg-gray-100"><p>Verificando sesión...</p></div>;
  }

  // 2. Si la carga terminó y NO hay usuario, redirige a /auth.
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // 3. Si la carga terminó y SÍ hay usuario, muestra el contenido.
  return children;
};

export default ProtectedRoute;
