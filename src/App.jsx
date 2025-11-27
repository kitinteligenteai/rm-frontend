// RUTA: src/App.jsx
// Router principal con Auth y Contexto integrados

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// ✅ 1. Importamos el UserProvider (Vital para que funcione el login)
import { UserProvider } from './context/UserContext';

import EnvGuard from './components/common/EnvGuard.jsx';

// Importar Páginas
import Home from './pages/Home.jsx';
import Programa from './pages/Programa.jsx';
import GraciasKit from './pages/GraciasKit.jsx';
import GraciasUpsell from './pages/GraciasUpsell.jsx';
import Plataforma from './pages/Plataforma.jsx';
// ✅ 2. Importamos la página de Autenticación
import AuthPage from './pages/Auth.jsx';

export default function App() {
  return (
    /* ✅ 3. Envolvemos TODO en UserProvider para que la "sangre" (datos de usuario) fluya */
    <UserProvider>
      <EnvGuard />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/programa" element={<Programa />} />
          <Route path="/gracias-kit" element={<GraciasKit />} />
          <Route path="/gracias-upsell" element={<GraciasUpsell />} />
          
          {/* ✅ 4. Agregamos la ruta perdida */}
          <Route path="/auth" element={<AuthPage />} />
          
          <Route path="/plataforma" element={<Plataforma />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}