// RUTA: src/App.jsx
// Router principal sin react-helmet-async

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import EnvGuard from './components/common/EnvGuard.jsx';   // ✅ desde src/

// ✅ Las páginas viven en src/pages/
import Home from './pages/Home.jsx';
import Programa from './pages/Programa.jsx';
import GraciasKit from './pages/GraciasKit.jsx';
import GraciasUpsell from './pages/GraciasUpsell.jsx';
import Plataforma from './pages/Plataforma.jsx';

export default function App() {
  return (
    <>
      <EnvGuard />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/programa" element={<Programa />} />
          <Route path="/gracias-kit" element={<GraciasKit />} />
          <Route path="/gracias-upsell" element={<GraciasUpsell />} />
          <Route path="/plataforma" element={<Plataforma />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
