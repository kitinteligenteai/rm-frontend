// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import EnvGuard from "./components/common/EnvGuard.jsx";
import ProtectedRoute from "./utils/ProtectedRoute.jsx";

// Páginas
import Home from "./pages/Home.jsx";
import HomeMarca from "./pages/HomeMarca.jsx";
import Programa from "./pages/Programa.jsx";
import GraciasKit from "./pages/GraciasKit.jsx";
import GraciasUpsell from "./pages/GraciasUpsell.jsx";
import Plataforma from "./pages/Plataforma.jsx";
import AuthPage from "./pages/Auth.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";

// Páginas legales
import Terminos from "./pages/Terminos.jsx";
import Privacidad from "./pages/Privacidad.jsx";
import Devoluciones from "./pages/Devoluciones.jsx";

// Páginas de estado de pago
import PagoFallido from "./pages/PagoFallido.jsx";
import PagoPendiente from "./pages/PagoPendiente.jsx";

export default function App() {
  return (
    <UserProvider>
      <EnvGuard />
      <BrowserRouter>
        <Routes>
          {/* Home institucional segura para marca / Etsy / tráfico orgánico */}
          <Route path="/" element={<HomeMarca />} />
          <Route path="/inicio" element={<HomeMarca />} />

          {/* Landing comercial del Kit: solo para embudo web / Meta Ads */}
          <Route path="/reinicio-7-dias" element={<Home />} />

          {/* Evitar ruta obvia al Kit barato */}
          <Route path="/kit" element={<Navigate to="/inicio" replace />} />

          {/* Programa Completo */}
          <Route path="/programa" element={<Programa />} />

          {/* Rutas legales */}
          <Route path="/terminos" element={<Terminos />} />
          <Route path="/privacidad" element={<Privacidad />} />
          <Route path="/devoluciones" element={<Devoluciones />} />

          {/* Rutas de estado de pago */}
          <Route path="/pago-fallido" element={<PagoFallido />} />
          <Route path="/pago-pendiente" element={<PagoPendiente />} />

          {/* Rutas de acceso */}
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Rutas de gracias */}
          <Route path="/gracias-kit" element={<GraciasKit />} />
          <Route path="/gracias-upsell" element={<GraciasUpsell />} />

          {/* Plataforma privada: requiere sesión */}
          <Route
            path="/plataforma/*"
            element={
              <ProtectedRoute>
                <Plataforma />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}