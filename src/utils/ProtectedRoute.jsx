// src/utils/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation, Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useUser } from "../context/UserContext.jsx";

const ProtectedRoute = ({ children, requireProgram = true }) => {
  const {
    user,
    loading,
    accessLoading,
    accessError,
    hasProgram,
    refreshAccess,
  } = useUser();
  const location = useLocation();

  if (loading || (user && requireProgram && accessLoading)) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-teal-400 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  if (requireProgram && accessError)
    return (
      <main className="min-h-screen bg-slate-950 text-white p-6 flex flex-col justify-center items-center gap-5">
        <h1 className="text-2xl font-bold">No pudimos verificar tu acceso</h1>
        <p>Comprueba tu conexión y vuelve a intentarlo.</p>
        <button className="bg-teal-600 p-3 rounded-xl" onClick={refreshAccess}>
          Reintentar verificación
        </button>
      </main>
    );
  if (requireProgram && !hasProgram)
    return (
      <main className="min-h-screen bg-slate-950 text-white p-6 flex flex-col justify-center items-center gap-5 text-center">
        <h1 className="text-2xl font-bold">Necesitas el Programa Completo</h1>
        <p className="max-w-md text-slate-300">
          Tu sesión está activa, pero no encontramos una compra activa del
          Programa con este correo.
        </p>
        <Link
          className="bg-teal-600 p-3 rounded-xl"
          to="/plataforma/mis-compras"
        >
          Ver mis compras
        </Link>
        <Link to="/programa" className="text-teal-300 underline">
          Conocer el Programa
        </Link>
        <a href="mailto:soporte@reiniciometabolico.net" className="underline">
          Ya compré y necesito ayuda
        </a>
      </main>
    );
  return children;
};

export default ProtectedRoute;
