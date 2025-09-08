// Contenido para el NUEVO archivo: src/pages/Plataforma.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const Plataforma = () => {
  const { user, signOut } = useUser();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth', { replace: true });
  };

  if (!user) return null;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* --- Barra Lateral --- */}
      <aside className="w-64 flex flex-col bg-white shadow-md p-4">
        <h1 className="text-2xl font-bold text-teal-600 mb-8">R. Metabólico</h1>
        <nav className="flex-1 space-y-2">
          <p className="px-4 py-2 bg-teal-500 text-white rounded-lg">Panel Principal</p>
          {/* Otros enlaces pueden ir aquí después */}
        </nav>
        <div className="border-t pt-4">
          <p className="font-semibold text-sm text-gray-700">Hola, {user.email}</p>
          <button onClick={handleLogout} className="w-full mt-2 text-left text-sm text-gray-500 hover:text-red-600">
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* --- Contenido Principal --- */}
      <main className="flex-1 p-10">
        <h2 className="text-3xl font-bold text-gray-800">Plataforma Funcional</h2>
        <p className="mt-4 text-lg text-gray-600">El sistema de autenticación y rutas está operativo.</p>
      </main>
    </div>
  );
};

export default Plataforma;
