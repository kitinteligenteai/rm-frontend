// CÓDIGO FINAL Y COMPLETO para: src/main.jsx
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
import ResetPasswordPage from './pages/ResetPasswordPage.jsx'; // Asegúrate de importar la nueva página
import PanelPrincipal from './pages/PanelPrincipal.jsx';

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
    children: [
      { path: 'panel-de-control', element: <PanelPrincipal /> },
      // Aquí irán las otras rutas como Boveda, Gimnasio, etc.
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
