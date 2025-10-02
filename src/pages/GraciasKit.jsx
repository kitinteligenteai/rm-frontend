// src/pages/GraciasKit.jsx
import React, { useEffect, useState } from "react";
import { CheckCircle, Mail, Loader2 } from "lucide-react";

const GraciasKitPage = () => {
  const [sessionId, setSessionId] = useState("");
  const [email, setEmail] = useState("");
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

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      // ✅ APUNTAMOS A LA NUEVA Y CORRECTA FUNCIÓN 'update-checkout-email'
      const resp = await fetch(`${functionsUrl}/update-checkout-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${anonKey}`,
          "apikey": anonKey // Buena práctica añadir también el apikey
        },
        body: JSON.stringify({ session_id: sessionId, email })
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

  if (isLoading) {
    return (
      <div className="min-h-screen grid place-items-center bg-gray-900 text-white p-6">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-teal-400 mx-auto" />
          <p className="mt-4 text-gray-300">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!sessionId) {
    return (
      <div className="min-h-screen grid place-items-center bg-gray-900 text-white p-6">
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-bold text-red-400">Error</h1>
          <p className="mt-4 text-gray-300">
            No se encontró un identificador de compra válido.
            Si acabas de pagar, por favor, revisa el enlace proporcionado por Mercado Pago.
          </p>
          <a className="inline-block mt-6 px-6 py-3 rounded-lg bg-teal-600 hover:bg-teal-500" href="/">Volver al inicio</a>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen grid place-items-center bg-gray-900 text-white p-6">
        <div className="max-w-md rounded-xl bg-gray-800 p-8 text-center shadow-lg">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-teal-400">¡Listo!</h1>
          <p className="mt-4 text-gray-300">
            Hemos recibido tu confirmación. Enviaremos el acceso a tu Kit de 7 días al correo:
          </p>
          <p className="mt-2 text-lg font-bold text-white bg-gray-900 px-4 py-2 rounded-md">{email}</p>
          <p className="mt-4 text-sm text-gray-400">
            Revisa tu bandeja de entrada en los próximos 5 minutos. Si no lo ves, mira en Spam o Promociones.
          </p>
          <a className="inline-block mt-8 px-6 py-3 rounded-lg bg-teal-600 hover:bg-teal-500" href="/">Ir al inicio</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gray-900 text-white p-6">
      <div className="w-full max-w-lg rounded-xl bg-gray-800 p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-teal-400">¡Pago exitoso!</h1>
        <p className="mt-2 text-gray-300">
          Último paso: indícanos o confirma tu mejor correo para enviarte el acceso:
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label htmlFor="email-input" className="block text-sm text-gray-400">Correo electrónico</label>
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

          {error && (
            <p className="text-red-400 bg-red-500/10 border border-red-400/30 px-3 py-2 rounded-md">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || !email}
            className="w-full flex items-center justify-center rounded-lg bg-teal-600 hover:bg-teal-500 px-6 py-3 font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed"
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
