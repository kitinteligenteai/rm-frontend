// Contenido FINAL, CORREGIDO Y UNIFICADO para: src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { UserProvider } from './context/UserContext.jsx';
import './index.css'; // Asegúrate que tu archivo de estilos principal esté importado

// --- Páginas y Layouts ---
import App from './App.jsx'; // Tu página de inicio pública, si la tienes
import AuthPage from './pages/Auth.jsx';
import DashboardLayout from './pages/DashboardLayout.jsx';
import ProtectedRoute from './utils/ProtectedRoute.jsx'; // <-- RUTA CORREGIDA

// --- Componentes de las páginas del Dashboard (debes crearlos si no existen) ---
const PanelPrincipal = () => <div>Contenido del Panel Principal</div>;
const BovedaRecetas = () => <div>Contenido de la Bóveda de Recetas</div>;
const Gimnasio = () => <div>Contenido del Gimnasio</div>;
const Bitacora = () => <div>Contenido de la Bitácora</div>;
const Biblioteca = () => <div>Contenido de la Biblioteca</div>;

const router = createBrowserRouter([
  // --- Rutas Públicas ---
  {
    path: '/',
    element: <App />, // Página de aterrizaje o marketing
  },
  {
    path: '/auth',
    element: <AuthPage />, // Página de login/registro
  },
  // --- Rutas Protegidas ---
  {
    path: '/plataforma',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'panel-de-control', element: <PanelPrincipal /> },
      { path: 'boveda-recetas', element: <BovedaRecetas /> },
      { path: 'gimnasio', element: <Gimnasio /> },
      { path: 'bitacora', element: <Bitacora /> },
      { path: 'biblioteca', element: <Biblioteca /> },
      // Redirección por defecto si solo se entra a /plataforma
      { index: true, element: <PanelPrincipal /> },
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <UserProvider>
      <RouterProvider router={router} />
    </UserProvider>
  </React.StrictMode>
);
