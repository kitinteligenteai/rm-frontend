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
import ResetPasswordPage from './pages/ResetPasswordPage.jsx'; // <--- IMPORTANTE

export default function App() {
  return (
    <UserProvider>
      <EnvGuard />
      <BrowserRouter>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/programa" element={<Programa />} />
          
          {/* Rutas de Acceso */}
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} /> {/* <--- RUTA CRÍTICA */}

          {/* Rutas de Gracias */}
          <Route path="/gracias-kit" element={<GraciasKit />} />
          <Route path="/gracias-upsell" element={<GraciasUpsell />} />
          
          {/* Plataforma Privada (Maneja sus sub-rutas internas) */}
          <Route path="/plataforma/*" element={<Plataforma />} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}