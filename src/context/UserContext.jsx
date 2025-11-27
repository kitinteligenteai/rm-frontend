// src/context/UserContext.jsx (v2.0 - FIX PANTALLA NEGRA)
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabaseClient';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // 1. Verificar sesión inicial
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error Auth Init:", error);
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    // 2. Escuchar cambios en tiempo real
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const value = {
    user,
    loading,
    signIn: (data) => supabase.auth.signInWithPassword(data),
    signUp: (data) => supabase.auth.signUp(data),
    signOut: () => supabase.auth.signOut(),
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

// ✅ ESTA ES LA PROTECCIÓN CLAVE:
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser debe usarse dentro de un UserProvider. Revisa tu main.jsx/App.jsx');
  }
  return context;
};