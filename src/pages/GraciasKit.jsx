// src/pages/GraciasKit.jsx
// v6.8 - UX post-pago con expectativa clara de entrega por correo

import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle2, AlertCircle, Loader2, Mail, Clock3 } from "lucide-react";

export default function GraciasKit() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const [emailTouched, setEmailTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(email);
  const doEmailsMatch =
    email.trim().toLowerCase() === confirmEmail.trim().toLowerCase();

  const canSubmit = isEmailValid && doEmailsMatch && email.length > 0;

  const handleConfirm = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setStatus("idle");

    try {
      const response = await fetch(
        "https://mgjzlohapnepvrqlxmpo.functions.supabase.co/confirm-purchase",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sessionId,
            email: email.trim(),
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Error al confirmar");
      }

      setStatus("success");
      setMessage("Tu correo fue confirmado correctamente.");
    } catch (err) {
      setStatus("error");
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans text-slate-100">
      <div className="max-w-md w-full bg-slate-800/50 border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
        {status === "success" ? (
          <div className="text-center animate-in fade-in zoom-in duration-500">
            <div className="mx-auto w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">
              ¡Pago confirmado!
            </h2>

            <p className="text-slate-300 mb-4">{message}</p>

            <div className="rounded-2xl border border-teal-500/20 bg-teal-500/10 p-4 text-left mb-5">
              <div className="flex items-start gap-3">
                <Clock3 className="w-5 h-5 text-teal-300 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-teal-100">
                    Estamos preparando tu correo de acceso.
                  </p>
                  <p className="mt-1 text-sm text-slate-300 leading-relaxed">
                    Normalmente llega en menos de 5 minutos. Revisa tu bandeja
                    principal, promociones y spam.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Si después de 10 minutos no lo recibes, escríbenos a{" "}
              <a
                href="mailto:soporte@reiniciometabolico.net"
                className="text-teal-300 hover:text-teal-200 underline"
              >
                soporte@reiniciometabolico.net
              </a>{" "}
              usando el mismo correo de compra.
            </p>

            <a
              href="https://outlook.live.com/mail/0/"
              target="_blank"
              rel="noreferrer"
              className="block w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
            >
              Ir a mi correo
            </a>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-extrabold text-teal-400 mb-2 text-center">
              ¡Pago exitoso!
            </h1>

            <p className="text-slate-400 text-center mb-4 text-sm">
              Confirma tu correo para recibir el acceso al Kit.
            </p>

            <div className="mb-8 rounded-xl border border-white/10 bg-slate-900/50 p-3 text-xs leading-relaxed text-slate-400">
              Después de confirmar, enviaremos tu Kit por correo. El envío puede
              tardar unos minutos. Revisa también spam o promociones.
            </div>

            <form onSubmit={handleConfirm} className="space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase ml-1">
                  Correo electrónico
                </label>

                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setEmailTouched(true)}
                    placeholder="tucorreo@ejemplo.com"
                    className={`w-full bg-slate-900/50 border ${
                      emailTouched && !isEmailValid
                        ? "border-red-500/50"
                        : "border-white/10"
                    } rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50`}
                  />
                </div>

                {emailTouched && !isEmailValid && (
                  <p className="text-red-400 text-xs ml-1 animate-in slide-in-from-top-1">
                    Introduce un correo válido.
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase ml-1">
                  Confirmar correo
                </label>

                <div className="relative">
                  <CheckCircle2 className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                  <input
                    type="email"
                    value={confirmEmail}
                    onChange={(e) => setConfirmEmail(e.target.value)}
                    onBlur={() => setConfirmTouched(true)}
                    placeholder="Repite tu correo"
                    onPaste={(e) => e.preventDefault()}
                    className={`w-full bg-slate-900/50 border ${
                      confirmTouched && !doEmailsMatch
                        ? "border-red-500/50"
                        : "border-white/10"
                    } rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50`}
                  />
                </div>

                {confirmTouched && !doEmailsMatch && (
                  <p className="text-red-400 text-xs ml-1">
                    Los correos no coinciden.
                  </p>
                )}
              </div>

              {status === "error" && (
                <div className="bg-red-500/10 text-red-300 p-3 rounded-lg text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={!canSubmit || loading}
                className="w-full bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold py-4 rounded-xl shadow-lg shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  "Confirmar y Recibir mi Kit"
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}