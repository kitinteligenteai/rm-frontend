// Contenido COMPLETO Y CORREGIDO para: src/pages/DashboardLayout.jsx

import React, { useEffect } from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext'; // Importamos el hook del usuario

// Importamos los iconos que ya usabas
import { HomeIcon, BookOpenIcon, ScaleIcon, ChartBarIcon, BeakerIcon } from '@heroicons/react/24/outline';

const DashboardLayout = () => {
  // --- LÓGICA AÑADIDA ---
  const { user, loading, signOut } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    // Si la carga del usuario ha terminado Y no hay un usuario...
    if (!loading && !user) {
      // ...entonces redirigimos a la página de login.
      navigate('/auth', { replace: true });
    }
  }, [user, loading, navigate]); // Esto se ejecuta cada vez que cambia el usuario o el estado de carga

  const handleLogout = async () => {
    await signOut();
    // Después de cerrar sesión, también redirigimos al login.
    navigate('/auth', { replace: true });
  };
  // --- FIN DE LA LÓGICA AÑADIDA ---


  // Si está cargando la información del usuario, mostramos un mensaje para evitar pantallas en blanco.
  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-gray-100">Cargando plataforma...</div>;
  }

  // Si la carga terminó y hay un usuario, mostramos la plataforma.
  // El código de abajo es el que ya tenías, solo he conectado el botón de "Cerrar Sesión".
  return user ? (
    <div className="flex h-screen bg-gray-50">
      {/* --- Barra Lateral (Sidebar) --- */}
      <aside className="w-64 flex flex-col bg-white shadow-md">
        <div className="p-6">
          <Link to="/plataforma/panel-de-control" className="text-2xl font-bold text-teal-600">R. Metabólico</Link>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <NavLink to="/plataforma/panel-de-control" className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg transition-colors ${isActive ? 'bg-teal-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            <HomeIcon className="w-6 h-6 mr-3" /> Panel Principal
          </NavLink>
          <NavLink to="/plataforma/boveda-recetas" className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg transition-colors ${isActive ? 'bg-teal-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            <BookOpenIcon className="w-6 h-6 mr-3" /> Bóveda de Recetas
          </NavLink>
          <NavLink to="/plataforma/gimnasio" className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg transition-colors ${isActive ? 'bg-teal-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            <ScaleIcon className="w-6 h-6 mr-3" /> Gimnasio
          </NavLink>
          <NavLink to="/plataforma/bitacora" className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg transition-colors ${isActive ? 'bg-teal-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            <ChartBarIcon className="w-6 h-6 mr-3" /> Mi Progreso
          </NavLink>
          <NavLink to="/plataforma/biblioteca" className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg transition-colors ${isActive ? 'bg-teal-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            <BeakerIcon className="w-6 h-6 mr-3" /> Biblioteca
          </NavLink>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <div className="text-sm text-gray-700">
            <p className="font-semibold">Hola, {user.email}</p>
          </div>
          {/* --- BOTÓN DE CERRAR SESIÓN CORREGIDO --- */}
          <button
            onClick={handleLogout}
            className="w-full mt-4 text-left text-sm text-gray-500 hover:text-red-600 transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* --- Contenido Principal --- */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <Outlet /> {/* Aquí se renderizan las páginas como Panel, Gimnasio, etc. */}
      </main>
    </div>
  ) : null; // Si no hay usuario, no muestra nada mientras la redirección ocurre.
};

export default DashboardLayout;
