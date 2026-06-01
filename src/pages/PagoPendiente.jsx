// src/pages/PagoPendiente.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Clock3, Mail, ArrowLeft } from "lucide-react";
import LegalFooter from "../components/common/LegalFooter.jsx";

export default function PagoPendiente() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-amber-500/20 bg-slate-900/70 p-8 shadow-2xl text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/15">
            <Clock3 className="h-8 w-8 text-amber-300" />
          </div>

          <h1 className="text-3xl font-extrabold text-white">
            Tu pago está pendiente
          </h1>

          <p className="mt-4 text-sm leading-relaxed text-slate-300">
            Mercado Pago todavía está procesando tu pago. Esto puede pasar con
            algunos métodos como transferencia, efectivo, revisión bancaria o
            autorización pendiente.
          </p>

          <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4 text-left text-sm text-slate-300">
            <p className="font-semibold text-white">Qué esperar:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Cuando Mercado Pago apruebe el pago, procesaremos tu acceso.</li>
              <li>El correo puede tardar unos minutos después de la aprobación.</li>
              <li>Revisa tu bandeja principal, promociones y spam.</li>
            </ul>
          </div>

          <div className="mt-7 space-y-3">
            <a
              href="mailto:soporte@reiniciometabolico.net"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-500 px-4 py-3 font-bold text-slate-950 hover:bg-teal-400 transition-colors"
            >
              <Mail className="h-5 w-5" />
              Contactar soporte
            </a>

            <Link
              to="/"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 px-4 py-3 font-semibold text-white hover:bg-slate-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Volver al inicio
            </Link>
          </div>

          <p className="mt-6 text-xs leading-relaxed text-slate-500">
            Si Mercado Pago ya te confirmó la aprobación y no recibes correo
            después de 10 minutos, escríbenos con tu comprobante.
          </p>
        </div>
      </main>

      <LegalFooter compact />
    </div>
  );
}