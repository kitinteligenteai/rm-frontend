// CÓDIGO MEJORADO para: src/pages/DashboardLayout.jsx
import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext.jsx'; // Importamos useUser
import { LogOut } from 'lucide-react'; // Importamos un icono para el botón

const DashboardLayout = () => {
  const { signOut } = useUser(); // Obtenemos la función signOut del contexto
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth', { replace: true }); // Redirigimos al login después de cerrar sesión
  };

  const navItems = [
    { path: '/plataforma/panel-de-control', label: 'Panel' },
    { path: '/plataforma/boveda-recetas', label: 'Bóveda de Recetas' },
    { path: '/plataforma/gimnasio', label: 'Gimnasio' },
    { path: '/plataforma/bitacora', label: 'Bitácora' },
    { path: '/plataforma/biblioteca', label: 'Biblioteca' },
  ];

  return (
    <div className="flex h-screen bg-gray-800 text-white">
      {/* Barra lateral */}
      <aside className="w-64 bg-gray-900 p-4 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-8 text-center">Mi Plataforma</h2>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center p-2 rounded-lg transition-colors ${
                    isActive ? 'bg-teal-600 text-white' : 'hover:bg-gray-700'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Botón de Cerrar Sesión */}
        <button
          onClick={handleSignOut}
          className="flex items-center justify-center w-full p-2 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Cerrar Sesión
        </button>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 bg-gray-800 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
