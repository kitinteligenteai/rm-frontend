// Propuesta de corrección para: src/utils/ProtectedRoute.jsx

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// La ruta correcta desde 'src/utils/' a 'src/context/' es:
import { useUser } from '../context/UserContext.jsx'; 

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return null;
  }

  return user ? children : null;
};

export default ProtectedRoute;
