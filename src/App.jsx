// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import EnvGuard from './components/common/EnvGuard.jsx';

// Páginas
import Home from './pages/Home.jsx';
import Programa from './pages/Programa.jsx';
import GraciasKit from './pages/GraciasKit.jsx';
import GraciasUpsell from './pages/GraciasUpsell.jsx';
import Plataforma from './pages/Plataforma.jsx';
import AuthPage from './pages/Auth.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';

// Páginas legales
import Terminos from './pages/Terminos.jsx';
import Privacidad from './pages/Privacidad.jsx';
import Devoluciones from './pages/Devoluciones.jsx';

export default function App() {
  return (
    <UserProvider>
      <EnvGuard />
      <BrowserRouter>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/programa" element={<Programa />} />

          {/* Rutas Legales */}
          <Route path="/terminos" element={<Terminos />} />
          <Route path="/privacidad" element={<Privacidad />} />
          <Route path="/devoluciones" element={<Devoluciones />} />

          {/* Rutas de Acceso */}
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Rutas de Gracias */}
          <Route path="/gracias-kit" element={<GraciasKit />} />
          <Route path="/gracias-upsell" element={<GraciasUpsell />} />

          {/* Plataforma Privada */}
          <Route path="/plataforma/*" element={<Plataforma />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}