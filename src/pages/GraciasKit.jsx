// src/pages/GraciasKit.jsx
import React, { useEffect, useState } from "react";
import { CheckCircle, Mail, Loader2, AlertTriangle } from "lucide-react";

const GraciasKitPage = () => {
  const [sessionId, setSessionId] = useState("");
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState(""); // <-- NUEVO ESTADO
  const [isLoading, setIsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const functionsUrl = `https://${import.meta.env.VITE_SUPABASE_PROJECT_REF}.functions.supabase.co`;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  useEffect(( ) => {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get("session_id") || "";
    setSessionId(sid);
  }, []);

  // --- LÓGICA DE VALIDACIÓN ---
  const emailsDoNotMatch = email && confirmEmail && email.toLowerCase() !== confirmEmail.toLowerCase();
  const isButtonDisabled = submitting || !email || !confirmEmail || emailsDoNotMatch;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (isButtonDisabled) return; // Doble seguridad

    setSubmitting(true);
    setError("");

    try {
      const resp = await fetch(`${functionsUrl}/update-checkout-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${anonKey}`,
          "apikey": anonKey,
        },
        body: JSON.stringify({ session_id: sessionId, email }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data?.error || "No se pudo confirmar el email.");
      }

      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // --- VISTAS (sin cambios en isLoading, !sessionId, done) ---
  if (isLoading) { /* ... (código sin cambios) ... */ }
  if (!sessionId) { /* ... (código sin cambios) ... */ }
  if (done) { /* ... (código sin cambios) ... */ }

  // --- VISTA DEL FORMULARIO (ACTUALIZADA) ---
  return (
    <div className="min-h-screen grid place-items-center bg-gray-900 text-white p-6">
      <div className="w-full max-w-lg rounded-xl bg-gray-800 p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-teal-400">¡Pago exitoso!</h1>
        <p className="mt-2 text-gray-300">
          Último paso: para evitar errores, por favor, escribe y confirma tu mejor correo para enviarte el acceso:
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {/* --- CAMPO DE EMAIL --- */}
          <div>
            <label htmlFor="email-input" className="block text-sm text-gray-400 mb-1">Correo electrónico</label>
            <div className="flex items-center gap-3 rounded-lg bg-gray-900 p-3 ring-1 ring-gray-700 focus-within:ring-teal-500">
              <Mail className="h-5 w-5 text-gray-400" />
              <input
                id="email-input"
                type="email"
                required
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent outline-none text-white"
              />
            </div>
          </div>

          {/* --- NUEVO CAMPO DE CONFIRMACIÓN DE EMAIL --- */}
          <div>
            <label htmlFor="confirm-email-input" className="block text-sm text-gray-400 mb-1">Confirmar correo electrónico</label>
            <div className="flex items-center gap-3 rounded-lg bg-gray-900 p-3 ring-1 ring-gray-700 focus-within:ring-teal-500">
              <Mail className="h-5 w-5 text-gray-400" />
              <input
                id="confirm-email-input"
                type="email"
                required
                placeholder="repite tu@correo.com"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                className="w-full bg-transparent outline-none text-white"
              />
            </div>
            {/* --- MENSAJE DE ERROR SI NO COINCIDEN --- */}
            {emailsDoNotMatch && (
              <p className="mt-2 text-sm text-yellow-400 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Los correos electrónicos no coinciden.
              </p>
            )}
          </div>

          {error && (
            <p className="text-red-400 bg-red-500/10 border border-red-400/30 px-3 py-2 rounded-md">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isButtonDisabled} // <-- LÓGICA DE DESACTIVACIÓN
            className="w-full flex items-center justify-center rounded-lg bg-teal-600 hover:bg-teal-500 px-6 py-3 font-semibold disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Confirmar y Enviar mi Kit"}
          </button>
        </form>

        <p className="mt-4 text-xs text-gray-500 text-center">
          ID de compra: <span className="font-mono">{sessionId}</span>
        </p>
      </div>
    </div>
  );
};

export default GraciasKitPage;
