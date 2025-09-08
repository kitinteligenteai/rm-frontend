// Contenido FINAL Y UNIFICADO para: src/pages/DashboardLayout.jsx
import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

const DashboardLayout = () => {
  // Define aquí los enlaces de tu barra lateral
  const navItems = [
    { path: '/plataforma/panel-de-control', label: 'Panel' },
    { path: '/plataforma/boveda-recetas', label: 'Bóveda de Recetas' },
    { path: '/plataforma/gimnasio', label: 'Gimnasio' },
    { path: '/plataforma/bitacora', label: 'Bitácora' },
    { path: '/plataforma/biblioteca', label: 'Biblioteca' },
  ];

  return (
    <div className="flex h-screen">
      {/* Barra lateral */}
      <aside className="w-64 bg-gray-900 text-white p-4 flex flex-col">
        <h2 className="text-xl font-bold mb-6">Mi Plataforma</h2>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `block p-2 rounded transition-colors ${
                  isActive ? 'bg-teal-600' : 'hover:bg-gray-700'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Contenido principal que cambiará según la ruta */}
      <main className="flex-1 bg-gray-50 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
