// Contenido DEFINITIVO Y BLINDADO para: src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import './index.css';

// --- Páginas y Layouts ---
import App from './App'; // La Landing Page de ventas
import AuthPage from './pages/Auth'; // La página de Login/Registro
import DashboardLayout from './pages/DashboardLayout'; // El guardián de la plataforma
import PanelPrincipal from './pages/PanelPrincipal'; // El panel principal real

// --- Importa el resto de tus páginas de la plataforma ---
import BovedaRecetas from './pages/BovedaRecetas';
import Gimnasio from './pages/Gimnasio';
import Bitacora from './pages/Bitacora';
import Biblioteca from './pages/Biblioteca';

// El Provider DEBE envolver a las Routes
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <UserProvider>
      <BrowserRouter>
        <Routes>
          {/* --- Rutas Públicas --- */}
          <Route path="/" element={<App />} />
          <Route path="/auth" element={<AuthPage />} />
          
          {/* --- Ruta Protegida de la Plataforma --- */}
          {/* Todo lo que esté aquí adentro será protegido por DashboardLayout */}
          <Route path="/plataforma" element={<DashboardLayout />}>
            <Route path="panel-de-control" element={<PanelPrincipal />} />
            <Route path="boveda-recetas" element={<BovedaRecetas />} />
            <Route path="gimnasio" element={<Gimnasio />} />
            <Route path="bitacora" element={<Bitacora />} />
            <Route path="biblioteca" element={<Biblioteca />} />
            {/* Añade aquí el resto de tus sub-rutas si faltan */}
          </Route>

        </Routes>
      </BrowserRouter>
    </UserProvider>
  </React.StrictMode>
);
