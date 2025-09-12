// CÓDIGO COMPLETO, FINAL Y LIMPIO para: src/main.jsx
// Commit para forzar el redespliegue en Vercel

import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { UserProvider } from './context/UserContext.jsx';
import './index.css';

// --- Páginas y Layouts ---
import Home from './pages/Home.jsx';
import AuthPage from './pages/Auth.jsx';
import DashboardLayout from './pages/DashboardLayout.jsx';
import ProtectedRoute from './utils/ProtectedRoute.jsx'; 
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import PanelPrincipal from './pages/PanelPrincipal.jsx';
import MisCompras from './pages/MisCompras.jsx';
import GraciasKitPage from './pages/gracias-kit.jsx';

const BovedaRecetas = () => <div>Contenido de la Bóveda de Recetas</div>;
const Gimnasio = () => <div>Contenido del Gimnasio</div>;
const Bitacora = () => <div>Contenido de la Bitácora</div>;
const Biblioteca = () => <div>Contenido de la Biblioteca</div>;

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/auth', element: <AuthPage /> },
  { path: '/auth/reset', element: <ResetPasswordPage /> },
  { path: '/gracias-kit', element: <GraciasKitPage /> },
  {
    path: '/mis-compras',
    element: (<ProtectedRoute><MisCompras /></ProtectedRoute>),
  },
  {
    path: '/plataforma',
    element: (<ProtectedRoute><DashboardLayout /></ProtectedRoute>),
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
