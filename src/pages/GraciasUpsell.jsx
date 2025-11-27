// src/pages/GraciasUpsell.jsx (v3.1 - MENSAJES CLAROS)
import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle2, AlertCircle, Loader2, Sparkles, Mail } from "lucide-react";

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

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(email);
  const doEmailsMatch = email.trim().toLowerCase() === confirmEmail.trim().toLowerCase();
  const canSubmit = isEmailValid && doEmailsMatch && email.length > 0;

  const handleConfirm = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setStatus("idle");

    try {
      const response = await fetch("https://mgjzlohapnepvrqlxmpo.functions.supabase.co/confirm-purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, email: email.trim() }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Error al confirmar");

      setStatus("success");
      setMessage(email);
    } catch (err) {
      setStatus("error");
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900 flex items-center justify-center p-4 font-sans text-slate-100">
      <div className="max-w-md w-full bg-slate-800/60 border border-teal-500/20 rounded-2xl p-8 shadow-2xl backdrop-blur-md relative overflow-hidden">
        
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl"></div>

        {status === "success" ? (
          <div className="text-center animate-in fade-in zoom-in duration-500 relative z-10">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-teal-500/30">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-4">¡Revisa tu Correo!</h2>
            
            <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
              <p className="text-slate-300 text-sm mb-2">Las instrucciones de acceso fueron enviadas a:</p>
              <p className="text-teal-400 font-mono text-lg font-medium">{message}</p>
            </div>

            <p className="text-slate-400 text-sm mb-8">
              Si no lo ves en tu bandeja de entrada, revisa <strong>Spam o Promociones</strong>.
            </p>

            <a 
              href="https://mail.google.com" 
              target="_blank" 
              rel="noreferrer" 
              className="block w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Mail className="w-5 h-5" />
              Ir a mi bandeja de entrada
            </a>
          </div>
        ) : (
          <div className="relative z-10">
            <div className="flex justify-center mb-4">
               <span className="bg-teal-500/10 text-teal-400 text-xs font-bold px-3 py-1 rounded-full border border-teal-500/20 uppercase tracking-widest">Pago Confirmado</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3 text-center">Activa tu Acceso</h1>
            <p className="text-slate-400 text-center mb-8">
              Para proteger tu cuenta Premium, confirma el correo donde recibirás las credenciales.
            </p>

            <form onSubmit={handleConfirm} className="space-y-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Tu Correo Principal</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-4 w-5 h-5 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setEmailTouched(true)}
                    placeholder="tucorreo@ejemplo.com"
                    className={`w-full bg-black/40 border ${emailTouched && !isEmailValid ? "border-red-500/50" : "border-white/10 focus:border-teal-500/50"} rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all`}
                  />
                </div>
                {emailTouched && !isEmailValid && (
                   <p className="text-red-400 text-xs ml-1 mt-1 animate-in slide-in-from-top-1">Introduce un correo válido</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Confirma tu Correo</label>
                <div className="relative">
                  <CheckCircle2 className="absolute left-4 top-4 w-5 h-5 text-slate-500" />
                  <input
                    type="email"
                    value={confirmEmail}
                    onChange={(e) => setConfirmEmail(e.target.value)}
                    onBlur={() => setConfirmTouched(true)}
                    placeholder="Repite tu correo"
                    onPaste={(e) => e.preventDefault()}
                    className={`w-full bg-black/40 border ${confirmTouched && !doEmailsMatch ? "border-red-500/50" : "border-white/10 focus:border-teal-500/50"} rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all`}
                  />
                </div>
                {confirmTouched && !doEmailsMatch && (
                  <p className="text-red-400 text-xs ml-1 mt-1 animate-in slide-in-from-top-1">Los correos no coinciden</p>
                )}
              </div>

              {status === "error" && (
                <div className="bg-red-500/10 text-red-300 p-4 rounded-xl text-sm flex items-center gap-3 border border-red-500/20">
                  <AlertCircle className="w-5 h-5 shrink-0" /> {message}
                </div>
              )}

              <button
                type="submit"
                disabled={!canSubmit || loading}
                className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-black font-bold py-4 rounded-xl shadow-lg shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : "ACTIVAR CUENTA PREMIUM"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}