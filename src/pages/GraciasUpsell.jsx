// src/pages/GraciasUpsell.jsx
import React, { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  HelpCircle,
  Loader2,
  LockKeyhole,
  Mail,
  Sparkles,
} from "lucide-react";

export default function GraciasUpsell() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const [emailTouched, setEmailTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);

  const cleanEmail = email.trim().toLowerCase();
  const cleanConfirmEmail = confirmEmail.trim().toLowerCase();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(cleanEmail);
  const doEmailsMatch = cleanEmail === cleanConfirmEmail;
  const canSubmit = Boolean(sessionId) && isEmailValid && doEmailsMatch;

  const inboxLink = useMemo(() => {
    if (cleanEmail.endsWith("@gmail.com")) {
      return {
        label: "Abrir Gmail",
        href: "https://mail.google.com",
      };
    }

    if (
      cleanEmail.endsWith("@outlook.com") ||
      cleanEmail.endsWith("@hotmail.com") ||
      cleanEmail.endsWith("@live.com")
    ) {
      return {
        label: "Abrir Outlook",
        href: "https://outlook.live.com/mail/",
      };
    }

    if (cleanEmail.endsWith("@yahoo.com") || cleanEmail.endsWith("@yahoo.com.mx")) {
      return {
        label: "Abrir Yahoo Mail",
        href: "https://mail.yahoo.com",
      };
    }

    return {
      label: "Abrir mi correo",
      href: "mailto:",
    };
  }, [cleanEmail]);

  const handleConfirm = async (e) => {
    e.preventDefault();

    if (!canSubmit || loading) return;

    setLoading(true);
    setStatus("idle");
    setMessage("");

    try {
      const response = await fetch(
        "https://mgjzlohapnepvrqlxmpo.functions.supabase.co/confirm-purchase",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sessionId,
            email: cleanEmail,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const serverMessage = data?.message || "Error al confirmar tu correo.";

        // Si el usuario repite el proceso o refresca la página, no lo asustamos.
        // La compra ya puede estar confirmada y el correo de acceso ya puede estar en camino.
        if (
          serverMessage.toLowerCase().includes("confirmada") ||
          serverMessage.toLowerCase().includes("anteriormente")
        ) {
          setStatus("success");
          setMessage(cleanEmail);
          return;
        }

        throw new Error(serverMessage);
      }

      setStatus("success");
      setMessage(cleanEmail);
    } catch (err) {
      setStatus("error");
      setMessage(
        err instanceof Error
          ? err.message
          : "No pudimos confirmar tu correo. Intenta de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900 flex items-center justify-center p-4 font-sans text-slate-100">
      <div className="max-w-lg w-full bg-slate-900/70 border border-teal-500/20 rounded-2xl p-7 md:p-8 shadow-2xl backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-36 h-36 bg-teal-500/10 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />

        {status === "success" ? (
          <div className="text-center animate-in fade-in zoom-in duration-500 relative z-10">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-teal-500/30">
              <Sparkles className="w-10 h-10 text-white" />
            </div>

            <div className="inline-flex items-center gap-2 bg-teal-500/10 text-teal-300 text-xs font-bold px-3 py-1 rounded-full border border-teal-500/20 uppercase tracking-widest mb-4">
              <CheckCircle2 className="w-4 h-4" />
              Acceso en proceso
            </div>

            <h2 className="text-3xl font-bold text-white mb-4">
              Revisa tu correo
            </h2>

            <div className="bg-white/5 rounded-xl p-4 mb-5 border border-white/10">
              <p className="text-slate-300 text-sm mb-2">
                Las instrucciones para crear tu contraseña y entrar al Programa
                fueron enviadas a:
              </p>
              <p className="text-teal-400 font-mono text-base md:text-lg font-medium break-all">
                {message}
              </p>
            </div>

            <div className="bg-slate-950/60 border border-slate-700 rounded-xl p-4 text-left mb-6">
              <div className="flex gap-3">
                <Clock className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-semibold text-sm mb-1">
                    Puede tardar unos minutos.
                  </p>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Normalmente llega rápido, pero puede tardar hasta 5 minutos.
                    Revisa también <strong>Promociones</strong>,{" "}
                    <strong>Spam</strong> o <strong>Correo no deseado</strong>.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-teal-500/10 border border-teal-500/20 rounded-xl p-4 text-left mb-6">
              <p className="text-teal-200 font-semibold text-sm mb-2">
                Tu acceso permanente será desde:
              </p>
              <p className="text-white text-sm leading-relaxed">
                <strong>reiniciometabolico.net</strong> →{" "}
                <strong>Iniciar sesión</strong> / <strong>Mi Programa</strong>
              </p>
              <p className="text-slate-400 text-xs mt-2">
                Usa siempre el mismo correo con el que hiciste la compra.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <a
                href={inboxLink.href}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Mail className="w-5 h-5" />
                {inboxLink.label}
                <ExternalLink className="w-4 h-4 opacity-70" />
              </a>

              <Link
                to="/auth"
                className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <LockKeyhole className="w-5 h-5" />
                Ir a iniciar sesión
              </Link>

              <Link
                to="/reset-password"
                className="text-slate-400 hover:text-teal-300 text-sm transition-colors flex items-center justify-center gap-2 mt-1"
              >
                <HelpCircle className="w-4 h-4" />
                Si el enlace caducó, solicita uno nuevo aquí
              </Link>
            </div>
          </div>
        ) : (
          <div className="relative z-10">
            <div className="flex justify-center mb-4">
              <span className="bg-teal-500/10 text-teal-400 text-xs font-bold px-3 py-1 rounded-full border border-teal-500/20 uppercase tracking-widest">
                Pago confirmado
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3 text-center">
              Activa tu acceso
            </h1>

            <p className="text-slate-400 text-center mb-6">
              Confirma el correo donde recibirás las instrucciones para crear tu
              contraseña y entrar al Programa Completo.
            </p>

            {!sessionId && (
              <div className="bg-red-500/10 text-red-300 p-4 rounded-xl text-sm flex items-center gap-3 border border-red-500/20 mb-6">
                <AlertCircle className="w-5 h-5 shrink-0" />
                No encontramos la sesión de compra. Si el cargo fue aprobado,
                escríbenos a soporte@reiniciometabolico.net con tu comprobante.
              </div>
            )}

            <div className="bg-slate-950/60 border border-slate-700 rounded-xl p-4 mb-6">
              <p className="text-white font-semibold text-sm mb-2">
                Qué pasará después:
              </p>
              <ol className="text-slate-400 text-sm space-y-1 list-decimal list-inside">
                <li>Confirmas tu correo de compra.</li>
                <li>Te enviamos el enlace para crear contraseña.</li>
                <li>Entras desde reiniciometabolico.net → Mi Programa.</li>
              </ol>
            </div>

            <form onSubmit={handleConfirm} className="space-y-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                  Tu correo principal
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-4 w-5 h-5 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setEmailTouched(true)}
                    placeholder="tucorreo@ejemplo.com"
                    autoComplete="email"
                    className={`w-full bg-black/40 border ${
                      emailTouched && !isEmailValid
                        ? "border-red-500/50"
                        : "border-white/10 focus:border-teal-500/50"
                    } rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all`}
                  />
                </div>
                {emailTouched && !isEmailValid && (
                  <p className="text-red-400 text-xs ml-1 mt-1 animate-in slide-in-from-top-1">
                    Introduce un correo válido.
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                  Confirma tu correo
                </label>
                <div className="relative">
                  <CheckCircle2 className="absolute left-4 top-4 w-5 h-5 text-slate-500" />
                  <input
                    type="email"
                    value={confirmEmail}
                    onChange={(e) => setConfirmEmail(e.target.value)}
                    onBlur={() => setConfirmTouched(true)}
                    placeholder="Repite tu correo"
                    autoComplete="email"
                    onPaste={(e) => e.preventDefault()}
                    className={`w-full bg-black/40 border ${
                      confirmTouched && !doEmailsMatch
                        ? "border-red-500/50"
                        : "border-white/10 focus:border-teal-500/50"
                    } rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all`}
                  />
                </div>
                {confirmTouched && !doEmailsMatch && (
                  <p className="text-red-400 text-xs ml-1 mt-1 animate-in slide-in-from-top-1">
                    Los correos no coinciden.
                  </p>
                )}
              </div>

              {status === "error" && (
                <div className="bg-red-500/10 text-red-300 p-4 rounded-xl text-sm flex items-center gap-3 border border-red-500/20">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={!canSubmit || loading}
                className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-black font-bold py-4 rounded-xl shadow-lg shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                ) : (
                  "ACTIVAR CUENTA PREMIUM"
                )}
              </button>
            </form>

            <p className="text-slate-500 text-xs text-center mt-6 leading-relaxed">
              Si ya tienes cuenta, usa el mismo correo de compra. Si el enlace
              caduca, podrás solicitar uno nuevo desde “Olvidé mi contraseña”.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}