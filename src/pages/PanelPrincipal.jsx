// Contenido DEFINITIVO para: src/pages/PanelPrincipal.jsx

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext'; // <-- USAREMOS ESTO

const PanelPrincipal = () => {
  const { user, signOut } = useUser(); // <-- Obtenemos el usuario y la función signOut
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(); // <-- Usamos la función signOut del contexto
    navigate('/auth', { replace: true }); // Redirigimos al login
  };

  if (!user) return null; // Si no hay usuario, no muestra nada

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Bienvenido, {user.email.split('@')[0]}</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-600 hover:text-red-700 font-medium"
        >
          Cerrar Sesión
        </button>
      </div>
      
      <p className="text-lg text-gray-600 mb-8">Tu viaje de transformación continúa. Elige cómo quieres avanzar hoy.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">La Guía Esencial</h3>
          <p className="mt-2 text-gray-600">Plantillas simples y comida real para resultados sin complicaciones.</p>
          <Link to="/plataforma/biblioteca" className="mt-4 inline-block bg-teal-600 text-white font-semibold px-5 py-2 rounded-lg hover:bg-teal-700">
            Empezar Ahora
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">El Planeador Inteligente</h3>
          <p className="mt-2 text-gray-600">Descubre recetas, personaliza tu menú y genera tu lista de súper.</p>
          <Link to="/plataforma/boveda-recetas" className="mt-4 inline-block bg-orange-500 text-white font-semibold px-5 py-2 rounded-lg hover:bg-orange-600">
            Explorar Recetas
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PanelPrincipal;
