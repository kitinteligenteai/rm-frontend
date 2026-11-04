import React, { lazy, useState } from "react";
import ProtectedRoute from "../utils/ProtectedRoute";
import {
  Routes,
  Route,
  Navigate,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useUser } from "../context/UserContext";
import {
  LayoutDashboard,
  BookOpen,
  Dumbbell,
  LogOut,
  Utensils,
  Calendar,
  BookHeart,
  ShoppingBag,
  PartyPopper,
} from "lucide-react";

import DashboardHome from "../components/dashboard/DashboardHome";
const Planeador = lazy(() => import("./Planeador"));
const BovedaRecetas = lazy(() => import("./BovedaRecetas"));
const Gimnasio = lazy(() => import("./Gimnasio"));
const Bitacora = lazy(() => import("./Bitacora"));
const Biblioteca = lazy(() => import("./Biblioteca"));
const MisCompras = lazy(() => import("./MisCompras"));
const GuiaSocial = lazy(() => import("./GuiaSocial"));

export default function Plataforma() {
  const { user, signOut } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const [logoutError, setLogoutError] = useState("");

  const handleLogout = async () => {
    try {
      setLogoutError("");
      const { error } = await signOut();
      if (error) throw error;
      navigate("/auth", { replace: true });
    } catch {
      setLogoutError("No pudimos cerrar la sesión. Reintenta con conexión.");
    }
  };

  const NavItem = ({ to, icon, label }) => {
    const Icon = icon;
    const isActive = location.pathname.includes(to);
    return (
      <Link
        to={to}
        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
          isActive
            ? "bg-teal-500/10 text-teal-400 border border-teal-500/20"
            : "text-slate-400 hover:bg-slate-800 hover:text-white"
        }`}
      >
        <Icon
          className={`w-5 h-5 ${isActive ? "text-teal-400" : "text-slate-500"}`}
        />
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 flex text-slate-100 font-sans print:bg-white print:text-black">
      {logoutError && (
        <p
          role="alert"
          className="fixed bottom-4 left-4 right-4 z-50 bg-red-950 text-red-100 border border-red-400 p-4 rounded-xl"
        >
          {logoutError}
        </p>
      )}
      {/* SIDEBAR */}
      <aside className="w-72 bg-slate-900 border-r border-slate-800 hidden md:flex flex-col sticky top-0 h-screen print:hidden">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-emerald-600 rounded-lg"></div>
            <span className="text-xl font-bold text-white tracking-tight">
              Reinicio M.
            </span>
          </div>

          <nav className="space-y-1">
            <NavItem
              to="/plataforma/panel-de-control"
              icon={LayoutDashboard}
              label="Panel de Control"
            />
            <div className="pt-4 pb-2">
              <p className="px-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                Herramientas
              </p>
            </div>
            <NavItem
              to="/plataforma/planeador"
              icon={Calendar}
              label="Planeador Semanal"
            />
            <NavItem
              to="/plataforma/recetas"
              icon={Utensils}
              label="Bóveda de Recetas"
            />
            <NavItem
              to="/plataforma/gimnasio"
              icon={Dumbbell}
              label="Gimnasio Digital"
            />
            <NavItem
              to="/plataforma/social"
              icon={PartyPopper}
              label="Guía Social"
            />
            <NavItem
              to="/plataforma/bitacora"
              icon={BookHeart}
              label="Bitácora"
            />
            <NavItem
              to="/plataforma/biblioteca"
              icon={BookOpen}
              label="Biblioteca"
            />
            <NavItem
              to="/plataforma/mis-compras"
              icon={ShoppingBag}
              label="Mis Compras"
            />
          </nav>
        </div>
        <div className="mt-auto p-6 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
          >
            <LogOut className="w-4 h-4" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 min-w-0 bg-slate-950 overflow-y-auto print:bg-white print:overflow-visible">
        <header className="md:hidden h-16 border-b border-slate-800 flex items-center justify-between px-4 bg-slate-900 sticky top-0 z-20 print:hidden">
          <span className="font-bold text-white">Reinicio M.</span>
          <button
            aria-label="Cerrar sesión"
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-white"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        <nav
          aria-label="Navegación móvil"
          className="md:hidden grid grid-cols-2 gap-2 p-3 bg-slate-900 border-b border-slate-800 print:hidden"
        >
          <NavItem
            to="/plataforma/panel-de-control"
            icon={LayoutDashboard}
            label="Mi día"
          />
          <NavItem
            to="/plataforma/planeador"
            icon={Calendar}
            label="Planeador"
          />
          <NavItem to="/plataforma/recetas" icon={Utensils} label="Recetas" />
          <NavItem to="/plataforma/gimnasio" icon={Dumbbell} label="Gimnasio" />
          <NavItem
            to="/plataforma/bitacora"
            icon={BookHeart}
            label="Bitácora"
          />
          <NavItem
            to="/plataforma/mis-compras"
            icon={ShoppingBag}
            label="Mis compras"
          />
          <NavItem
            to="/plataforma/social"
            icon={PartyPopper}
            label="Comer fuera"
          />
          <NavItem
            to="/plataforma/biblioteca"
            icon={BookOpen}
            label="Biblioteca"
          />
        </nav>
        <Routes>
          <Route
            path="panel-de-control"
            element={
              <ProtectedRoute>
                <DashboardHome user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="planeador"
            element={
              <ProtectedRoute>
                <Planeador />
              </ProtectedRoute>
            }
          />
          <Route
            path="recetas"
            element={
              <ProtectedRoute>
                <BovedaRecetas />
              </ProtectedRoute>
            }
          />
          <Route
            path="gimnasio"
            element={
              <ProtectedRoute>
                <Gimnasio />
              </ProtectedRoute>
            }
          />
          <Route
            path="social"
            element={
              <ProtectedRoute>
                <GuiaSocial />
              </ProtectedRoute>
            }
          />
          <Route
            path="bitacora"
            element={
              <ProtectedRoute>
                <Bitacora />
              </ProtectedRoute>
            }
          />
          <Route
            path="biblioteca"
            element={
              <ProtectedRoute>
                <Biblioteca />
              </ProtectedRoute>
            }
          />
          <Route path="mis-compras" element={<MisCompras />} />
          <Route
            path="*"
            element={<Navigate to="/plataforma/panel-de-control" replace />}
          />
        </Routes>

        <footer className="w-full border-t border-slate-800 bg-slate-950 py-8 px-6 print:hidden">
          <div className="max-w-5xl mx-auto text-center space-y-4">
            <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 text-xs text-slate-500 leading-relaxed text-justify">
              <p className="font-bold text-slate-400 mb-1">
                Aviso Importante de Salud:
              </p>
              <p>
                Contenido educativo de bienestar para adultos. No diagnostica ni
                trata enfermedades. Diabetes, embarazo, enfermedad renal o
                cardiovascular y tratamientos requieren orientación profesional
                antes de cambiar alimentación o ejercicio.
              </p>
            </div>
            <p className="text-xs text-slate-600">
              © {new Date().getFullYear()} Reinicio Metabólico.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
