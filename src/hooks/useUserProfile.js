// RUTA: src/hooks/useUserProfile.js
// ESTADO: Reemplazo completo

import { useState, useEffect, useCallback } from 'react';

const PROFILE_STORAGE_KEY = 'userProfile';

export function useUserProfile() {
  const [userProfile, setUserProfile] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // Efecto para cargar el perfil desde localStorage solo una vez al inicio.
  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (storedProfile) {
        setUserProfile(JSON.parse(storedProfile));
      }
    } catch (error) {
      console.error("Error al leer el perfil de localStorage:", error);
      // Si hay un error, limpiamos el almacenamiento para evitar problemas futuros.
      localStorage.removeItem(PROFILE_STORAGE_KEY);
    } finally {
      // Marcamos como inicializado para que la UI se pueda renderizar.
      setInitialized(true);
    }
  }, []);

  // Función para actualizar el perfil y guardarlo en localStorage.
  const updateProfile = useCallback((newProfileData) => {
    setUserProfile(prevProfile => {
      const updatedProfile = { ...prevProfile, ...newProfileData };
      try {
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile));
      } catch (error) {
        console.error("Error al guardar el perfil en localStorage:", error);
      }
      return updatedProfile;
    });
  }, []);

  // Devolvemos el estado y la función para que otros componentes los usen.
  return { userProfile, updateProfile, initialized };
}
