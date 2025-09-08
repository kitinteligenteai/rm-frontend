// Contenido REFORZADO para: src/context/UserContext.jsx

import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabaseClient';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Flag para evitar actualizaciones en un componente desmontado
    let isMounted = true;

    // Función para obtener la sesión inicial
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (isMounted) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    };

    // Listener para cambios futuros (login, logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setUser(session?.user ?? null);
      }
    });

    // Iniciar la autenticación
    initAuth();

    // Función de limpieza que se ejecuta al desmontar
    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const value = {
    user,
    loading,
    signIn: (credentials) => supabase.auth.signInWithPassword(credentials),
    signOut: () => supabase.auth.signOut(),
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);
