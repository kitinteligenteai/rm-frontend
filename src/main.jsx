// CÓDIGO FINAL, CORREGIDO Y COMPLETO para: src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { UserProvider } from './context/UserContext.jsx';
import './index.css';

// --- Páginas y Layouts ---
import Home from './pages/Home.jsx'; // <-- ¡LA CLAVE! Importamos la página de ventas.
import AuthPage from './pages/Auth.jsx';
import DashboardLayout from './pages/DashboardLayout.jsx';
import ProtectedRoute from './pages/utils/ProtectedRoute.jsx'; // Corregida la ruta
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import PanelPrincipal from './pages/PanelPrincipal.jsx';
import MisCompras from './pages/MisCompras.jsx'; // Importamos la página de compras
import GraciasKit from './pages/GraciasKit.jsx'; // Importamos la página de gracias

// --- Componentes para las otras secciones (placeholders) ---
const BovedaRecetas = () => <div>Contenido de la Bóveda de Recetas</div>;
const Gimnasio = () => <div>Contenido del Gimnasio</div>;
const Bitacora = () => <div>Contenido de la Bitácora</div>;
const Biblioteca = () => <div>Contenido de la Biblioteca</div>;

const router = createBrowserRouter([
  // --- Rutas Públicas ---
  {
    path: '/',
    element: <Home />, // <-- ¡CORREGIDO! La ruta principal ahora muestra la página de ventas.
  },
  {
    path: '/auth',
    element: <AuthPage />,
  },
  {
    path: '/auth/reset',
    element: <ResetPasswordPage />,
  },
  {
    path: '/gracias-kit', // Ruta de agradecimiento
    element: <GraciasKit />,
  },
  // --- Rutas Protegidas ---
  {
    path: '/mis-compras', // Ruta para ver las compras del usuario
    element: (
      <ProtectedRoute>
        <MisCompras />
      </ProtectedRoute>
    ),
  },
  {
    path: '/plataforma',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'panel-de-control',
        element: <PanelPrincipal />,
      },
      {
        path: 'boveda-recetas',
        element: <BovedaRecetas />,
      },
      {
        path: 'gimnasio',
        element: <Gimnasio />,
      },
      {
        path: 'bitacora',
        element: <Bitacora />,
      },
      {
        path: 'biblioteca',
        element: <Biblioteca />,
      },
      {
        index: true, // Ruta por defecto para /plataforma
        element: <PanelPrincipal />,
      },
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
