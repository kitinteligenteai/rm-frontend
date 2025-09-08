// Contenido DEFINITIVO Y BLINDADO para: src/pages/DashboardLayout.jsx

import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const DashboardLayout = () => {
  const { user, loading } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    // Esta es la única regla. Si la carga terminó y NO hay usuario...
    if (!loading && !user) {
      // ...te vas al login. Fin de la historia.
      navigate('/auth', { replace: true });
    }
  }, [user, loading, navigate]);

  // Mientras se verifica la sesión, muestra un mensaje claro. Cero pantallas en blanco.
  if (loading) {
    return <div className="flex h-screen w-full items-center justify-center bg-gray-100"><p className="text-lg font-medium text-gray-600">Verificando acceso...</p></div>;
  }

  // Si la carga terminó y SÍ hay un usuario, se muestra el contenido.
  // El 'Outlet' es el que carga PanelDeControl, Gimnasio, etc.
  return user ? <Outlet /> : null;
};

export default DashboardLayout;
