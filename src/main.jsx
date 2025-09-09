// CÓDIGO FINAL Y REESTRUCTURADO para: src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { UserProvider } from './context/UserContext.jsx';
import './index.css';

// --- Páginas y Layouts ---
import App from './App.jsx';
import AuthPage from './pages/Auth.jsx';
import DashboardLayout from './pages/DashboardLayout.jsx';
import ProtectedRoute from './utils/ProtectedRoute.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import PanelPrincipal from './pages/PanelPrincipal.jsx';

// --- Componentes para las otras secciones (placeholders) ---
const BovedaRecetas = () => <div>Contenido de la Bóveda de Recetas</div>;
const Gimnasio = () => <div>Contenido del Gimnasio</div>;
const Bitacora = () => <div>Contenido de la Bitácora</div>;
const Biblioteca = () => <div>Contenido de la Biblioteca</div>;


const router = createBrowserRouter([
  // --- Rutas Públicas ---
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/auth',
    element: <AuthPage />,
  },
  {
    path: '/auth/reset',
    element: <ResetPasswordPage />,
  },
  // --- Rutas Protegidas ---
  {
    path: '/plataforma',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    // Definimos las rutas hijas aquí
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
      // Esta ruta actúa como el default para /plataforma
      {
        index: true,
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
