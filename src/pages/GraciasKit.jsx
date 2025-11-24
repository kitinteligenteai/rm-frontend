// src/pages/GraciasKit.jsx — versión PRO con validación solo al enviar (2025-11-21)
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { CheckCircle, Loader2, Mail } from "lucide-react";

function GraciasKitPage() {
  const [sessionId, setSessionId] = useState("");
  const [done, setDone] = useState(false);
  const [finalEmail, setFinalEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [alreadyConfirmed, setAlreadyConfirmed] = useState(false);

  const projectRef =
    import.meta.env.VITE_SUPABASE_PROJECT_REF || "mgjzlohapnepvrqlxmpo";
  const anonKey =
    import.meta.env.VITE_SUPABASE_ANON_KEY || "REEMPLAZA_SI_NO_TOMA_ENV";

  // 🧭 Captura session_id desde la URL
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const sid =
      p.get("session_id") || p.get("external_reference") || "";
    setSessionId(sid);

    // Bloqueo de reenvío tras refresh
    const confirmedKey = `rm.confirmed.${sid}`;
    if (localStorage.getItem(confirmedKey) === "1") {
      setAlreadyConfirmed(true);
      setDone(true);
      setFinalEmail(
        localStorage.getItem(`rm.email.${sid}`) || ""
      );
    }
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onChange" });

  const emailValue = watch("email", "").trim().toLowerCase();
  const confirmValue = watch("confirmEmail", "").trim().toLowerCase();

  // ✔ Mejor práctica profesional: botón habilitado si ambos campos tienen algo
  const isValid =
    emailValue.length > 0 &&
    confirmValue.length > 0 &&
    !isSubmitting &&
    !alreadyConfirmed;

  // 🚀 Envío de confirmación con validación SOLO al enviar
  const onSubmit = async (values) => {
    try {
      setErrorMsg("");

      // 📌 Validación profesional: solo al presionar el botón
      if (
        values.email.trim().toLowerCase() !==
        values.confirmEmail.trim().toLowerCase()
      ) {
        setErrorMsg("Los correos no coinciden.");
        return;
      }

      if (!sessionId) {
        setErrorMsg("No se encontró un ID de sesión válido.");
        return;
      }

      const email = values.email.trim().toLowerCase();
      const functionsUrl =
        `https://${projectRef}.functions.supabase.co`;

      const resp = await fetch(
        `${functionsUrl}/confirm-purchase`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${anonKey}`,
            apikey: anonKey,
          },
          body: JSON.stringify({ session_id: sessionId, email }),
        }
      );

      const data = await resp.json().catch(() => ({}));

      if (!resp.ok) {
        if (data?.message?.includes("ya fue confirmada")) {
          setAlreadyConfirmed(true);
          setErrorMsg(
            "Esta compra ya fue confirmada anteriormente."
          );
          return;
        }
        throw new Error(
          data?.message ||
            "No se pudo confirmar tu email."
        );
      }

      // Guardar estado local (bloquea reenvío tras refresh)
      localStorage.setItem(
        `rm.confirmed.${sessionId}`,
        "1"
      );
      localStorage.setItem(
        `rm.email.${sessionId}`,
        email
      );

      setFinalEmail(email);
      setDone(true);
    } catch (err) {
      console.error("Confirm email error:", err);
      setErrorMsg(
        "Hubo un problema al confirmar tu correo. Intenta de nuevo."
      );
    }
  };

  // ===============================
  //  PANTALLA FINAL
  // ===============================
  if (done) {
    return (
      <div className="min-h-screen grid place-items-center bg-gray-900 text-white p-6">
        <div className="max-w-md w-full rounded-2xl bg-gray-800 p-8 text-center shadow-lg">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          <h1 className="mt-6 text-3xl font-bold text-teal-400">
            ¡Listo! Correo en camino.
          </h1>
          <p className="mt-4 text-gray-300">
            Enviamos el acceso a{" "}
            <span className="font-bold">{finalEmail}</span>.
            Revisa Bandeja de entrada y Spam/Promociones.
          </p>
        </div>
      </div>
    );
  }

  // ===============================
  //  FORMULARIO
  // ===============================
  return (
    <div className="min-h-screen grid place-items-center bg-gray-900 text-white p-6">
      <div className="w-full max-w-md rounded-2xl bg-gray-800 p-8 shadow-lg">
        <h1 className="text-2xl md:text-3xl font-extrabold text-teal-400">
          ¡Pago exitoso!
        </h1>
        <p className="mt-2 text-gray-300">
          Último paso: confirma tu correo para enviarte el
          acceso al Kit.
        </p>

        <form
          className="mt-6 space-y-5"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-400 mb-1"
            >
              Correo electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                id="email"
                type="email"
                placeholder="nombre@correo.com"
                className="w-full bg-transparent border border-gray-700 focus:border-teal-500 transition rounded-lg pl-10 pr-3 py-3"
                autoComplete="email"
                {...register("email", {
                  required: "El correo es obligatorio.",
                  pattern: {
                    value:
                      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
                    message: "Introduce un correo válido.",
                  },
                })}
              />
            </div>
            {errors.email && (
              <p className="mt-2 text-sm text-yellow-400">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Confirm Email */}
          <div>
            <label
              htmlFor="confirmEmail"
              className="block text-sm font-medium text-gray-400 mb-1"
            >
              Confirma tu correo
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                id="confirmEmail"
                type="email"
                placeholder="Vuelve a escribir tu correo"
                className="w-full bg-transparent border border-gray-700 focus:border-teal-500 transition rounded-lg pl-10 pr-3 py-3"
                autoComplete="off"
                {...register("confirmEmail", {
                  required: "Confirma tu correo.",
                  validate: () => true, // ✔ Sin validación mientras escribe
                })}
              />
            </div>
            {errors.confirmEmail && (
              <p className="mt-2 text-sm text-yellow-400">
                {errors.confirmEmail.message}
              </p>
            )}
          </div>

          {/* Botón */}
          <button
            type="submit"
            disabled={!isValid}
            className={`w-full flex items-center justify-center rounded-lg px-6 py-4 font-semibold transition-all duration-300 ${
              isValid
                ? "bg-teal-600 hover:bg-teal-500 text-white shadow-lg hover:shadow-teal-400/20 scale-[1.02]"
                : "bg-gray-600 text-gray-300 cursor-not-allowed opacity-70"
            }`}
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

          {errorMsg && (
            <p className="text-sm text-red-400 text-center mt-2">
              {errorMsg}
            </p>
          )}

          <p className="text-xs text-gray-400 text-center">
            Usaremos este correo sólo para enviarte tu acceso y
            soporte.
          </p>
        </form>
      </div>
    </div>
  );
}

export default GraciasKitPage;
