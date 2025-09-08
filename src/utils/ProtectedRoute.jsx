// Contenido FINAL Y UNIFICADO para: src/pages/utils/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext'; // Asegúrate que la ruta al UserContext sea correcta

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-3"></div>
          <p className="text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Si la carga terminó y no hay usuario, redirige a la página de autenticación
    return <Navigate to="/auth" replace />;
  }

  // Si hay usuario, renderiza el contenido protegido (los hijos)
  return children;
};

export default ProtectedRoute;
