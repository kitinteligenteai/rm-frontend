// CÓDIGO DEFINITIVO Y FINAL para: src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { UserProvider } from './context/UserContext.jsx';
import './index.css';

// --- Páginas y Layouts ---
import App from './App.jsx';
import AuthPage from './pages/Auth.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx'; // <-- NUEVA PÁGINA IMPORTADA
import DashboardLayout from './pages/DashboardLayout.jsx';
import ProtectedRoute from './utils/ProtectedRoute.jsx';

// --- Componentes de las páginas del Dashboard (marcadores de posición) ---
const PanelPrincipal = () => <div className="text-white">Contenido del Panel Principal</div>;
const BovedaRecetas = () => <div className="text-white">Contenido de la Bóveda de Recetas</div>;
const Gimnasio = () => <div className="text-white">Contenido del Gimnasio</div>;
const Bitacora = () => <div className="text-white">Contenido de la Bitácora</div>;
const Biblioteca = () => <div className="text-white">Contenido de la Biblioteca</div>;

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
    path: '/auth/reset', // <-- NUEVA RUTA AÑADIDA
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
    children: [
      { path: 'panel-de-control', element: <PanelPrincipal /> },
      { path: 'boveda-recetas', element: <BovedaRecetas /> },
      { path: 'gimnasio', element: <Gimnasio /> },
      { path: 'bitacora', element: <Bitacora /> },
      { path: 'biblioteca', element: <Biblioteca /> },
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
