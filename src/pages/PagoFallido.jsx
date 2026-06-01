// src/pages/PagoFallido.jsx
import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ArrowLeft, CreditCard } from "lucide-react";
import LegalFooter from "../components/common/LegalFooter.jsx";

export default function PagoFallido() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-red-500/20 bg-slate-900/70 p-8 shadow-2xl text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/15">
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>

          <h1 className="text-3xl font-extrabold text-white">
            No se completó el pago
          </h1>

          <p className="mt-4 text-sm leading-relaxed text-slate-300">
            Tu pago no fue aprobado o el proceso se interrumpió. No te preocupes:
            si no recibiste confirmación de Mercado Pago, normalmente no se
            genera ningún cargo final.
          </p>

          <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4 text-left text-sm text-slate-300">
            <p className="font-semibold text-white">Qué puedes hacer:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Verifica los datos de tu tarjeta o método de pago.</li>
              <li>Intenta de nuevo con otro medio de pago.</li>
              <li>Revisa si tu banco solicitó autorización adicional.</li>
            </ul>
          </div>

          <div className="mt-7 space-y-3">
            <Link
              to="/"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-500 px-4 py-3 font-bold text-slate-950 hover:bg-teal-400 transition-colors"
            >
              <CreditCard className="h-5 w-5" />
              Intentar de nuevo
            </Link>

            <Link
              to="/"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 px-4 py-3 font-semibold text-white hover:bg-slate-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Volver al inicio
            </Link>
          </div>

          <p className="mt-6 text-xs leading-relaxed text-slate-500">
            Si crees que sí se realizó un cargo, escríbenos a{" "}
            <a
              href="mailto:soporte@reiniciometabolico.net"
              className="text-teal-300 hover:text-teal-200 underline"
            >
              soporte@reiniciometabolico.net
            </a>{" "}
            con tu correo de compra y comprobante.
          </p>
        </div>
      </main>

      <LegalFooter compact />
    </div>
  );
}