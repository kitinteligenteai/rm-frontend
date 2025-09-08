// Contenido DESCONTAMINADO para: src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import './index.css';

// --- Páginas y Layouts ---
import App from './App';
import AuthPage from './pages/Auth';
import DashboardLayout from './pages/DashboardLayout';
import PanelPrincipal from './pages/PanelPrincipal';
import BovedaRecetas from './pages/BovedaRecetas';
import Gimnasio from './pages/Gimnasio';
import Bitacora from './pages/Bitacora';
import Biblioteca from './pages/Biblioteca';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <UserProvider>
        <Routes>
          {/* --- Rutas Públicas --- */}
          <Route path="/" element={<App />} />
          <Route path="/auth" element={<AuthPage />} />
          
          {/* --- Ruta Protegida de la Plataforma --- */}
          <Route path="/plataforma" element={<DashboardLayout />}>
            <Route index element={<PanelPrincipal />} /> {/* Ruta por defecto */}
            <Route path="panel-de-control" element={<PanelPrincipal />} />
            <Route path="boveda-recetas" element={<BovedaRecetas />} />
            <Route path="gimnasio" element={<Gimnasio />} />
            <Route path="bitacora" element={<Bitacora />} />
            <Route path="biblioteca" element={<Biblioteca />} />
          </Route>

        </Routes>
      </UserProvider>
    </BrowserRouter>
  </React.StrictMode>
);
