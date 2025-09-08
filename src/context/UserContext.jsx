// Contenido FINAL Y UNIFICADO para: src/context/UserContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabaseClient'; // Asegúrate que la ruta a tu cliente Supabase sea correcta

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sesión inicial
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    // Escuchar cambios de sesión (login, logout, refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    initAuth();

    // Limpieza al desmontar el componente
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // API de autenticación centralizada que se provee a la aplicación
  const value = {
    user,
    loading,
    signIn: (credentials) => supabase.auth.signInWithPassword(credentials),
    signUp: (credentials) => supabase.auth.signUp(credentials),
    signOut: () => supabase.auth.signOut(),
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);
