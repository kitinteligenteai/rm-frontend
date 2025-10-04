// src/pages/GraciasKit.jsx — v9 (react-hook-form + Zod)
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, Mail, Loader2, AlertTriangle } from "lucide-react";

// --- Schema de validación (mensajes en español)
const EmailSchema = z
  .string({ required_error: "El correo es obligatorio." })
  .trim()
  .toLowerCase()
  .min(1, "El correo es obligatorio.")
  .email("Introduce un correo válido.");

const FormSchema = z
  .object({
    email: EmailSchema,
    confirmEmail: EmailSchema
  })
  .superRefine((val, ctx) => {
    if (val.email !== val.confirmEmail) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmEmail"],
        message: "Los correos no coinciden."
      });
    }
  });

export default function GraciasKitPage() {
  // Fingerprint de build para verificar bundle en prod
  useEffect(() => {
    console.info("GraciasKit v9 (Zod) build:", new Date().toISOString());
  }, []);

  const [sessionId, setSessionId] = useState("");
  const [done, setDone] = useState(false);
  const [finalEmail, setFinalEmail] = useState("");

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const sid =
      p.get("session_id") ||
      p.get("external_reference") ||
      "";
    setSessionId(sid);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(FormSchema),
    mode: "onBlur",          // valida al salir del campo
    reValidateMode: "onChange"
  });

  const onSubmit = async (values) => {
    try {
      const email = values.email; // ya viene normalizado por el schema
      const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_REF;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const functionsUrl = `https://${projectRef}.functions.supabase.co`;

      const resp = await fetch(`${functionsUrl}/update-checkout-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${anonKey}`,
          apikey: anonKey
        },
        body: JSON.stringify({ session_id: sessionId, email } )
      });

      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(data?.error || "No se pudo confirmar el email.");

      setFinalEmail(email);
      setDone(true);
    } catch (err) {
      console.error("Confirm email error:", err);
      alert("Hubo un problema al confirmar tu correo. Intenta de nuevo en unos segundos.");
    }
  };

  if (done) {
    return (
      <div className="min-h-screen grid place-items-center bg-gray-900 text-white p-6">
        <div className="max-w-md w-full rounded-2xl bg-gray-800 p-8 text-center shadow-lg">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          <h1 className="mt-6 text-3xl font-bold text-teal-400">¡Listo! Correo en camino.</h1>
          <p className="mt-4 text-gray-300">
            Enviamos el acceso a <span className="font-bold">{finalEmail}</span>. Revisa tu
            bandeja (y Spam/Promociones).
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
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="mt-2 text-sm text-yellow-400 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                {errors.email.message}
              </p>
            )}
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
                autoComplete="email"
                {...register("confirmEmail")}
              />
            </div>
            {errors.confirmEmail && (
              <p className="mt-2 text-sm text-yellow-400 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                {errors.confirmEmail.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center rounded-lg bg-teal-600 hover:bg-teal-500 px-6 py-4 font-semibold disabled:bg-gray-700 disabled:opacity-60 transition"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-3" />
                Procesando…
              </>
            ) : (
              "Confirmar y Recibir mi Kit"
            )}
          </button>

          <p className="text-xs text-gray-400 text-center">
            Usaremos este correo sólo para enviarte tu acceso y soporte.
          </p>
        </form>
      </div>
    </div>
  );
}
