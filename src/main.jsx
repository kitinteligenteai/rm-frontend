// Contenido COMPLETO Y CORREGIDO para: src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

// Importación de Componentes y Páginas
import App from './App';
import AuthPage from './pages/Auth'; // <-- 1. IMPORTAMOS LA PÁGINA DE LOGIN
import PlataformaLayout from './Layouts/PlataformaLayout';
import PanelDeControl from './pages/PanelDeControl';
import Gimnasio from './pages/Gimnasio';
import BovedaRecetas from './pages/BovedaRecetas';
import RecetaDetalle from './pages/RecetaDetalle';
import Bitacora from './pages/Bitacora';
import Biblioteca from './pages/Biblioteca';
import Principios from './pages/Principios';
import PrincipioDetalle from './pages/PrincipioDetalle';
import { UserProvider } from './context/UserContext'; // Asegúrate de que el Provider esté aquí

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <UserProvider> {/* El Provider debe envolver toda la aplicación */}
      <BrowserRouter>
        <Routes>
          {/* --- Rutas Públicas --- */}
          <Route path="/" element={<App />} />
          <Route path="/auth" element={<AuthPage />} /> {/* <-- 2. AÑADIMOS LA RUTA PARA /auth */}

          {/* --- Rutas Protegidas --- */}
          <Route path="/plataforma" element={<PlataformaLayout />}>
            <Route index element={<Navigate to="panel-de-control" replace />} />
            <Route path="panel-de-control" element={<PanelDeControl />} />
            <Route path="gimnasio" element={<Gimnasio />} />
            <Route path="boveda-recetas" element={<BovedaRecetas />} />
            <Route path="bitacora" element={<Bitacora />} />
            <Route path="biblioteca" element={<Biblioteca />} />
            <Route path="principios" element={<Principios />} />
            <Route path="receta/:id" element={<RecetaDetalle />} />
            <Route path="principio/:id" element={<PrincipioDetalle />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </UserProvider>
  </React.StrictMode>
);
