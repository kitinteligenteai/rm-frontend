// Contenido COMPLETO Y FINAL para: src/pages/DashboardLayout.jsx

import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext.jsx';
import { FiGrid, FiHeart, FiBookOpen, FiClipboard, FiTool } from 'react-icons/fi'; // Importamos los íconos aquí

const DashboardLayout = () => {
  const { user, signOut } = useUser();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navLinkClasses = ({ isActive }) => 
    `flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 rounded-md ${isActive ? 'bg-orange-600 text-white' : ''}`;

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* --- La Barra Lateral está definida aquí --- */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col flex-shrink-0">
        <div className="flex items-center justify-center h-20 border-b border-gray-700">
          <h1 className="text-2xl font-bold text-white">R. Metabólico</h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {/* --- NUEVO ENLACE A PANEL PRINCIPAL --- */}
          <NavLink to="/plataforma/panel" className={navLinkClasses}>
            <FiGrid className="mr-3" /> Panel Principal
          </NavLink>
          <NavLink to="/plataforma/boveda-recetas" className={navLinkClasses}>
            <FiBookOpen className="mr-3" /> Bóveda de Recetas
          </NavLink>
          <NavLink to="/plataforma/gimnasio" className={navLinkClasses}>
            <FiHeart className="mr-3" /> Gimnasio
          </NavLink>
          {/* --- ENLACE CORREGIDO --- */}
          <NavLink to="/plataforma/bitacora" className={navLinkClasses}>
            <FiClipboard className="mr-3" /> Mi Progreso
          </NavLink>
          <NavLink to="/plataforma/biblioteca" className={navLinkClasses}>
            <FiTool className="mr-3" /> Biblioteca
          </NavLink>
        </nav>
        <div className="p-4 border-t border-gray-700">
          <p className="text-sm text-white truncate" title={user?.email}>Hola, {user?.email || 'Usuario'}</p>
          <button onClick={handleSignOut} className="w-full mt-2 text-left px-4 py-2 text-sm text-gray-300 rounded-lg hover:bg-red-600 hover:text-white">Cerrar Sesión</button>
        </div>
      </aside>

      {/* --- El Contenido Principal se renderiza aquí --- */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
