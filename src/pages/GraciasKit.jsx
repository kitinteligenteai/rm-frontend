// src/pages/GraciasKit.jsx - v4 - DEBOUNCED & UX POLISHED
import React, { useEffect, useState } from "react";
import { CheckCircle, Mail, Loader2, AlertTriangle } from "lucide-react";

// Hook personalizado para "debounce" (retrasar la actualización de un valor)
function useDebouncedValue(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

// Helpers para normalizar y validar
const normalizeEmail = (s) => s.trim().toLowerCase();
const isEmailValid = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalizeEmail(s));

const GraciasKitPage = () => {
  const [sessionId, setSessionId] = useState("");
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [confirmBlurred, setConfirmBlurred] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState("");

  const functionsUrl = `https://${import.meta.env.VITE_SUPABASE_PROJECT_REF}.functions.supabase.co`;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  useEffect(( ) => {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get("session_id") || params.get("external_reference") || "";
    setSessionId(sid);
  }, []);

  // --- LÓGICA DE VALIDACIÓN INTELIGENTE CON DEBOUNCE ---
  const emailIsValid = isEmailValid(email);
  const emailsMatch = email.length > 0 && normalizeEmail(email) === normalizeEmail(confirmEmail);

  const debouncedConfirmEmail = useDebouncedValue(confirmEmail);
  const debouncedEmailsMatch = email.length > 0 && normalizeEmail(email) === normalizeEmail(debouncedConfirmEmail);

  const showMismatchError = (confirmBlurred || submitAttempted || (confirmEmail.length > 0 && !debouncedEmailsMatch)) && !emailsMatch;

  const canSubmit = emailIsValid && emailsMatch && !submitting;

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);
    if (!canSubmit) return;

    setSubmitting(true);
    setServerError("");

    try {
      const resp = await fetch(`${functionsUrl}/update-checkout-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${anonKey}`, "apikey": anonKey },
        body: JSON.stringify({ session_id: sessionId, email: normalizeEmail(email) }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || "No se pudo confirmar el email. Intenta de nuevo.");
      setDone(true);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // --- VISTAS ---

  if (!sessionId) { /* ... (código de error de sesión sin cambios) ... */ }
  if (done) { /* ... (código de pantalla de éxito sin cambios) ... */ }

  return (
    <div className="min-h-screen grid place-items-center bg-gray-900 text-white p-6">
      <div className="w-full max-w-md rounded-xl bg-gray-800 p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-teal-400">¡Pago exitoso!</h1>
        <p className="mt-2 text-gray-300">Último paso: confirma tu correo para enviarte el acceso al Kit.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
          <div>
            <label htmlFor="email-input" className="block text-sm font-medium text-gray-400 mb-1">Correo electrónico</label>
            <div className="flex items-center gap-3 rounded-lg bg-gray-900 p-3 ring-1 ring-gray-700 focus-within:ring-teal-500">
              <Mail className="h-5 w-5 text-gray-500" />
              <input id="email-input" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" spellCheck="false" required placeholder="nombre@correo.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-transparent outline-none text-white" />
            </div>
          </div>

          <div>
            <label htmlFor="confirm-email-input" className="block text-sm font-medium text-gray-400 mb-1">Confirma tu correo</label>
            <div className="flex items-center gap-3 rounded-lg bg-gray-900 p-3 ring-1 ring-gray-700 focus-within:ring-teal-500">
              <Mail className="h-5 w-5 text-gray-500" />
              <input id="confirm-email-input" type="email" inputMode="email" autoComplete="off" autoCapitalize="none" spellCheck="false" required placeholder="Vuelve a escribir tu correo" value={confirmEmail} onChange={(e) => setConfirmEmail(e.target.value)} onBlur={() => setConfirmBlurred(true)} aria-invalid={showMismatchError} className="w-full bg-transparent outline-none text-white" />
            </div>
            {showMismatchError && (
              <p className="mt-2 text-sm text-yellow-400 flex items-center gap-2" aria-live="polite"><AlertTriangle className="h-4 w-4" />Los correos no coinciden.</p>
            )}
          </div>

          {serverError && (
            <p className="text-red-400 bg-red-500/10 border border-red-400/30 px-3 py-2 rounded-md">{serverError}</p>
          )}

          <button type="submit" disabled={!canSubmit} className="w-full flex items-center justify-center rounded-lg bg-teal-600 hover:bg-teal-500 px-6 py-3 font-semibold disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            {submitting ? <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Confirmando...</> : "Confirmar y Recibir mi Kit"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default GraciasKitPage;
