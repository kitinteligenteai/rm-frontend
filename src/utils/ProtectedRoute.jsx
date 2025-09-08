// Contenido DEFINITIVO para el guardián: src/pages/utils/ProtectedRoute.jsx

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext'; // Ajusta la ruta si es necesario

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    // Si la verificación ha terminado y NO hay usuario...
    if (!loading && !user) {
      // ...te enviamos a la página de login.
      navigate('/auth', { replace: true });
    }
  }, [user, loading, navigate]);

  // Mientras se verifica, no mostramos nada para evitar parpadeos.
  if (loading) {
    return null; 
  }

  // Si hay un usuario, mostramos el contenido protegido (la Plataforma).
  return user ? children : null;
};

export default ProtectedRoute;
