// src/pages/GraciasKit.jsx — versión simple y robusta (sin Zod)
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { CheckCircle, Loader2, Mail } from "lucide-react";

function GraciasKitPage() {
  const [sessionId, setSessionId] = useState("");
  const [done, setDone] = useState(false);
  const [finalEmail, setFinalEmail] = useState("");

  const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_REF || "mgjzlohapnepvrqlxmpo";
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "REEMPLAZA_SI_NO_TOMA_ENV";

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const sid = p.get("session_id") || p.get("external_reference") || "";
    setSessionId(sid);
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isValid }
  } = useForm({ mode: "onBlur", reValidateMode: "onChange" });

  const emailValue = watch("email", "");

  const onSubmit = async (values) => {
    try {
      if (!sessionId) {
        alert("No se encontró un ID de sesión válido.");
        return;
      }
      const email = String(values.email).trim().toLowerCase();
      const functionsUrl = `https://${projectRef}.functions.supabase.co`;

      const resp = await fetch(`${functionsUrl}/update-checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${anonKey}`,
          apikey: anonKey
        },
        body: JSON.stringify({ session_id: sessionId, email })
      });

      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(data?.error || "No se pudo confirmar tu email.");

      setFinalEmail(email);
      setDone(true);
    } catch (err) {
      console.error("Confirm email error:", err);
      alert("Hubo un problema al confirmar tu correo. Intenta de nuevo.");
    }
  };

  if (done) {
    return (
      <div className="min-h-screen grid place-items-center bg-gray-900 text-white p-6">
        <div className="max-w-md w-full rounded-2xl bg-gray-800 p-8 text-center shadow-lg">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          <h1 className="mt-6 text-3xl font-bold text-teal-400">¡Listo! Correo en camino.</h1>
          <p className="mt-4 text-gray-300">
            Enviamos el acceso a <span className="font-bold">{finalEmail}</span>. Revisa Bandeja de entrada y Spam/Promociones.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gray-900 text-white p-6">
      <div className="w-full max-w-md rounded-2xl bg-gray-800 p-8 shadow-lg">
        <h1 className="text-2xl md:text-3xl font-extrabold text-teal-400">¡Pago exitoso!</h1>
        <p className="mt-2 text-gray-300">Último paso: confirma tu correo para enviarte el acceso al Kit.</p>

        <form className="mt-6 space-y-5" noValidate onSubmit={handleSubmit(onSubmit)}>
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">
              Correo electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                id="email"
                type="email"
                placeholder="nombre@correo.com"
                className="w-full bg-transparent outline-none border border-gray-700 focus:border-teal-500 transition rounded-lg pl-10 pr-3 py-3"
                autoComplete="email"
                {...register("email", {
                  required: "El correo es obligatorio.",
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, message: "Introduce un correo válido." }
                })}
              />
            </div>
            {errors.email && <p className="mt-2 text-sm text-yellow-400">{errors.email.message}</p>}
          </div>

          {/* Confirm Email */}
          <div>
            <label htmlFor="confirmEmail" className="block text-sm font-medium text-gray-400 mb-1">
              Confirma tu correo
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                id="confirmEmail"
                type="email"
                placeholder="Vuelve a escribir tu correo"
                className="w-full bg-transparent outline-none border border-gray-700 focus:border-teal-500 transition rounded-lg pl-10 pr-3 py-3"
                autoComplete="off"   /* 👈 evita el autocompletar raro */
                {...register("confirmEmail", {
                  required: "Confirma tu correo.",
                  validate: (v) => v?.trim().toLowerCase() === emailValue?.trim().toLowerCase() || "Los correos no coinciden."
                })}
              />
            </div>
            {errors.confirmEmail && <p className="mt-2 text-sm text-yellow-400">{errors.confirmEmail.message}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || !isValid}
            className="w-full flex items-center justify-center rounded-lg bg-teal-600 hover:bg-teal-500 px-6 py-4 font-semibold disabled:bg-gray-700 disabled:opacity-60 transition"
          >
            {isSubmitting ? (<><Loader2 className="h-5 w-5 animate-spin mr-3" />Procesando…</>) : ("Confirmar y Recibir mi Kit")}
          </button>

          <p className="text-xs text-gray-400 text-center">
            Usaremos este correo sólo para enviarte tu acceso y soporte.
          </p>
        </form>
      </div>
    </div>
  );
}

export default GraciasKitPage;
