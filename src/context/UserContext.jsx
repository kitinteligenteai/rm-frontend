// src/context/UserContext.jsx (v2.0 - FIX PANTALLA NEGRA)
import React, { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "../lib/supabaseClient";
import { hasProduct } from "../lib/access";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [access, setAccess] = useState({
    userId: null,
    loading: true,
    error: false,
    products: [],
  });
  const [accessVersion, setAccessVersion] = useState(0);
  const userId = user?.id;
  const userEmail = user?.email;
  useEffect(() => {
    let active = true;
    if (!userId) {
      setAccess({ userId: null, loading: false, error: false, products: [] });
      return;
    }
    setAccess({ userId, loading: true, error: false, products: [] });
    supabase
      .from("my_entitlements")
      .select("product_id,status")
      .then(({ data, error }) => {
        if (active)
          setAccess({
            userId,
            loading: false,
            error: !!error,
            products: error ? [] : data || [],
          });
      })
      .catch(() => {
        if (active)
          setAccess({ userId, loading: false, error: true, products: [] });
      });
    return () => {
      active = false;
    };
  }, [userId, userEmail, accessVersion]);
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible")
        setAccessVersion((v) => v + 1);
    };
    document.addEventListener("visibilitychange", refresh);
    return () => document.removeEventListener("visibilitychange", refresh);
  }, []);

  useEffect(() => {
    let mounted = true;

    // 1. Verificar sesión inicial
    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
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
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
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
    accessLoading: !!user && (access.loading || access.userId !== user.id),
    accessError: access.error,
    entitlements: access.userId === user?.id ? access.products : [],
    hasProgram:
      access.userId === user?.id &&
      hasProduct(access.products, "programa-completo"),
    refreshAccess: () => setAccessVersion((v) => v + 1),
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
    throw new Error(
      "useUser debe usarse dentro de un UserProvider. Revisa tu main.jsx/App.jsx",
    );
  }
  return context;
};
