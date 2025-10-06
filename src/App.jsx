// RUTA: src/App.jsx (Versión Final con Router y EnvGuard)

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async'; // Necesario para el SEO en Programa.jsx

import EnvGuard from './components/common/EnvGuard'; // Nuestro guardián de seguridad

// Importamos todas las páginas que usaremos en las rutas
import Home from './pages/Home';
import Programa from './pages/Programa';
import GraciasKit from './pages/GraciasKit';
import GraciasUpsell from './pages/GraciasUpsell';
import Plataforma from './pages/Plataforma'; // Asumo que tienes una página de plataforma
// ... importa aquí cualquier otra página que necesites en tus rutas

export default function App() {
  return (
    // HelmetProvider envuelve toda la app para que el SEO funcione
    <HelmetProvider>
      <EnvGuard /> {/* Nuestro guardián, siempre vigilante */}
      
      <BrowserRouter>
        <Routes>
          {/* Ruta para la página de inicio (venta del Kit) */}
          <Route path="/" element={<Home />} />
          
          {/* Ruta para la página de venta del Programa Completo */}
          <Route path="/programa" element={<Programa />} />
          
          {/* Rutas para las páginas de "Gracias" */}
          <Route path="/gracias-kit" element={<GraciasKit />} />
          <Route path="/gracias-upsell" element={<GraciasUpsell />} />

          {/* Ruta para la plataforma de miembros (área privada) */}
          <Route path="/plataforma" element={<Plataforma />} />

          {/* Puedes añadir más rutas aquí según las necesites */}

        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
}
