// Contenido COMPLETO Y ACTUALIZADO para: src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './context/UserContext';

import './index.css';
import App from './App';
import Auth from './pages/Auth';

// --- Layouts y Páginas ---
import DashboardLayout from './pages/DashboardLayout';
import PanelPrincipal from './pages/PanelPrincipal';
import GuiaEsencial from './pages/GuiaEsencial';
import Planeador from './pages/Planeador';
import BovedaRecetas from './pages/BovedaRecetas';
import Gimnasio from './pages/Gimnasio';
import Bitacora from './pages/Bitacora';
import Biblioteca from './pages/Biblioteca';
import Principios from './pages/Principios';
import PrincipioDetalle from './pages/PrincipioDetalle';
import RecetaDetalle from './pages/RecetaDetalle';
// --- 1. IMPORTAMOS LA PÁGINA DE UPSELL ---
import Upsell from './pages/Upsell'; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <UserProvider>
        <Routes>
          {/* --- RUTAS PÚBLICAS --- */}
          <Route path="/login" element={<Auth />} />
          <Route path="/" element={<App />} />
          {/* --- 2. AÑADIMOS LA RUTA PÚBLICA PARA UPSELL --- */}
          <Route path="/upsell" element={<Upsell />} />


          {/* --- RUTAS PROTEGIDAS DENTRO DE LA PLATAFORMA --- */}
          <Route path="/plataforma" element={<DashboardLayout />}>
            <Route index element={<Navigate to="panel" replace />} />
            
            <Route path="panel" element={<PanelPrincipal />} />
            <Route path="guia-esencial" element={<GuiaEsencial />} />
            <Route path="planeador" element={<Planeador />} />
            <Route path="boveda-recetas" element={<BovedaRecetas />} />
            <Route path="receta/:id" element={<RecetaDetalle />} />
            <Route path="gimnasio" element={<Gimnasio />} />
            <Route path="bitacora" element={<Bitacora />} />
            <Route path="biblioteca" element={<Biblioteca />} />
            <Route path="principios" element={<Principios />} />
            <Route path="principio/:id" element={<PrincipioDetalle />} /> 

          </Route>

        </Routes>
      </UserProvider>
    </BrowserRouter>
  </React.StrictMode>
);
