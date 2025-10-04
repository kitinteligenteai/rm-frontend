// src/pages/GraciasKit.jsx - v7 - SIMPLIFIED LOGIC
import React, { useEffect, useState } from "react";
import { CheckCircle, Mail, Loader2, AlertTriangle } from "lucide-react";

const GraciasKitPage = () => {
  const [sessionId, setSessionId] = useState("");
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  // --- LÓGICA DE VALIDACIÓN SIMPLIFICADA Y ROBUSTA ---
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  const emailsMatch = email.trim().toLowerCase() === confirmEmail.trim().toLowerCase();
  
  // El error solo se muestra si el campo de confirmación tiene texto Y no coincide con el email
  const showMismatchError = confirmEmail.length > 0 && !emailsMatch;
  
  // El botón solo se activa si ambos correos son válidos, coinciden y no se está enviando.
  const canSubmit = isEmailValid && emailsMatch && !submitting;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get("session_id") || params.get("external_reference") || "";
    setSessionId(sid);
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError("");

    try {
      const functionsUrl = `https://${import.meta.env.VITE_SUPABASE_PROJECT_REF}.functions.supabase.co`;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      const resp = await fetch(`${functionsUrl}/update-checkout-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${anonKey}`, "apikey": anonKey },
        body: JSON.stringify({ session_id: sessionId, email: email.trim( ).toLowerCase() }),
      });
      
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data?.error || "No se pudo confirmar el email.");
      }
      
      // En lugar de solo poner 'done', esperamos un segundo para que el usuario vea el feedback.
      setTimeout(() => {
        setDone(true);
      }, 1000);

    } catch (err) {
      setError(err.message);
      setSubmitting(false); // Permitimos reintentar si hay un error
    }
  };

  // --- VISTAS ---
  if (done) { /* ... (código de pantalla de éxito sin cambios) ... */ }
  if (!sessionId) { /* ... (código de error de sesión sin cambios) ... */ }

  return (
    <div className="min-h-screen grid place-items-center bg-gray-900 text-white p-6">
      <div className="w-full max-w-md rounded-xl bg-gray-800 p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-teal-400">¡Pago exitoso!</h1>
        <p className="mt-2 text-gray-300">Último paso: confirma tu correo.</p>
        
        <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
          <div>
            <label htmlFor="email-input" className="block text-sm font-medium text-gray-400 mb-1">Correo electrónico</label>
            <input id="email-input" type="email" required placeholder="nombre@correo.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-transparent outline-none border border-gray-700 p-3 rounded-lg" />
          </div>
          <div>
            <label htmlFor="confirm-email-input" className="block text-sm font-medium text-gray-400 mb-1">Confirma tu correo</label>
            <input id="confirm-email-input" type="email" required placeholder="Vuelve a escribir tu correo" value={confirmEmail} onChange={(e) => setConfirmEmail(e.target.value)} className="w-full bg-transparent outline-none border border-gray-700 p-3 rounded-lg" />
            {showMismatchError && (
              <p className="mt-2 text-sm text-yellow-400">Los correos no coinciden.</p>
            )}
          </div>
          {error && (<p className="text-red-400">{error}</p>)}
          <button type="submit" disabled={!canSubmit} className="w-full flex items-center justify-center rounded-lg bg-teal-600 hover:bg-teal-500 px-6 py-4 font-semibold disabled:bg-gray-700 disabled:opacity-60 transition-all">
            {submitting ? <><Loader2 className="h-5 w-5 animate-spin mr-3" /> Procesando...</> : "Confirmar y Recibir mi Kit"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default GraciasKitPage;
