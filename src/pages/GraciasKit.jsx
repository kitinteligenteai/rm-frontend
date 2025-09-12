// src/pages/GraciasKit.jsx
import React, { useEffect, useState } from "react";
import { CheckCircle, Mail, Loader2 } from "lucide-react";

const GraciasKitPage = () => {
  const [sessionId, setSessionId] = useState("");
  const [email, setEmail] = useState("");
  const [initialStatus, setInitialStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const functionsUrl = `https://${import.meta.env.VITE_SUPABASE_PROJECT_REF}.functions.supabase.co`;
  
  // Esta es la "credencial" que le mostraremos a Supabase. Es segura para usar aquí.
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  useEffect((  ) => {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get("session_id") || "";
    setSessionId(sid);

    if (!sid) {
      setIsLoading(false);
      return;
    }

    // 1) Intentar prellenar con lo que tengamos en purchases (pre-registro o post-webhook)
    // ✅ CORRECCIÓN: Añadimos el header de autorización
    fetch(`${functionsUrl}/claim-purchase?session_id=${encodeURIComponent(sid)}`, {
      headers: {
        'Authorization': `Bearer ${anonKey}`
      }
    })
      .then(r => r.ok ? r.json() : Promise.reject({ message: "No se pudo verificar la sesión." }))
      .then((data) => {
        if (data.exists) {
          setInitialStatus(data.status || "");
          if (data.email) setEmail(data.email);
        }
      })
      .catch((err) => {
        setError("Error al cargar los datos de la compra. Por favor, recarga la página.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      // ✅ CORRECCIÓN: Añadimos el header de autorización también aquí
      const resp = await fetch(`${functionsUrl}/claim-purchase`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${anonKey}`
        },
        body: JSON.stringify({ session_id: sessionId, email })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || "No se pudo confirmar el email.");

      setDone(true);
    } catch (err)      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen grid place-items-center bg-gray-900 text-white p-6">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-teal-400 mx-auto" />
          <p className="mt-4 text-gray-300">Verificando tu compra...</p>
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
            Hemos enviado el acceso a tu Kit de 7 días al correo:
          </p>
          <p className="mt-2 text-lg font-bold text-white bg-gray-900 px-4 py-2 rounded-md">{email}</p>
          <p className="mt-4 text-sm text-gray-400">
            Revisa tu bandeja de entrada. Si no lo ves, mira en Spam o Promociones.
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
          {email
            ? "Confirma o corrige tu correo para enviarte el acceso:"
            : "Último paso: indícanos tu correo para enviarte el acceso:"}
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
            {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Enviar mi Kit a este correo"}
          </button>
        </form>

        <p className="mt-4 text-xs text-gray-500 text-center">
          ID de compra: <span className="font-mono">{sessionId}</span>
          {initialStatus ? <> · Estado: <span className="font-mono capitalize">{initialStatus}</span></> : null}
        </p>
      </div>
    </div>
  );
};

export default GraciasKitPage;
