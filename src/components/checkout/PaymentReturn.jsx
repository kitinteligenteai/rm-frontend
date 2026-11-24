import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
export default function PaymentReturn({ program = false }) {
  const [params] = useSearchParams();
  const id = params.get("session_id");
  const [state, setState] = useState("idle");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState(() => {
    try {
      return localStorage.getItem(`rm:checkout-email:${id}`) || "";
    } catch {
      return "";
    }
  });
  const token = (() => {
    try {
      return localStorage.getItem(`rm:checkout:${id}`);
    } catch {
      return null;
    }
  })();
  async function verify(event) {
    event.preventDefault();
    setState("loading");
    try {
      const result = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/confirm-purchase`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: id,
            checkout_token: token,
            email: email.trim().toLowerCase(),
          }),
        },
      );
      const body = await result.json();
      if (!result.ok || body.success !== true)
        throw Error(body.message || "Todavía no pudimos verificar el pago.");
      setState("verified");
      setMessage(
        "Pago verificado por el servidor. El correo de entrega está en preparación.",
      );
    } catch (error) {
      setState("error");
      setMessage(
        error.message ||
          "No pudimos verificar el pago. Reintenta con conexión.",
      );
    }
  }
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <section className="max-w-lg w-full bg-slate-900 border border-slate-700 rounded-2xl p-6 sm:p-8 space-y-5">
        <p className="text-sm text-teal-300">
          {program ? "Programa Completo" : "Kit de 7 días"}
        </p>
        <h1 className="text-2xl font-bold">Verificación de compra</h1>
        <p className="text-slate-300">
          El regreso desde Mercado Pago no confirma el cobro. Verificamos el
          estado con el proveedor antes de activar o entregar tu producto.
        </p>
        {state === "verified" ? (
          <p role="status" className="text-teal-200">
            {message}
          </p>
        ) : (
          <>
            <p className="text-slate-300">
              Si tu pago se aprueba, enviaremos{" "}
              {program
                ? "el enlace para activar tu acceso"
                : "la descarga del Kit"}{" "}
              al correo que confirmaste antes de pagar. No necesitas volver al
              mismo navegador ni volver a comprar.
            </p>
            {token && id && (
              <form onSubmit={verify} className="space-y-3">
                <label className="block text-sm">
                  Correo indicado al comprar
                  <input
                    aria-label="Correo indicado al comprar"
                    className="block mt-2 bg-slate-800 border border-slate-600 rounded-lg p-3 w-full text-base"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    maxLength={254}
                    required
                    autoComplete="email"
                  />
                </label>
                <button
                  disabled={state === "loading"}
                  className="bg-teal-300 text-slate-950 font-bold rounded-xl px-4 py-3 w-full"
                >
                  {state === "loading"
                    ? "Verificando…"
                    : "Consultar estado de mi compra"}
                </button>
              </form>
            )}
            {state === "error" && (
              <p role="alert" className="text-amber-200">
                {message}
              </p>
            )}
          </>
        )}
        <p className="text-sm text-slate-400">
          Revisa la bandeja principal y spam. Si el pago está pendiente, la
          entrega esperará su aprobación. Si fue rechazado, no se activa acceso.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link to="/auth" className="underline text-teal-300 py-2">
            Entrar a mi cuenta
          </Link>
          <Link
            to="/plataforma/mis-compras"
            className="underline text-teal-300 py-2"
          >
            Mis compras
          </Link>
        </div>
        <p className="text-xs text-slate-400">
          Si necesitas ayuda, escribe a{" "}
          <a href="mailto:soporte@reiniciometabolico.net" className="underline">
            soporte@reiniciometabolico.net
          </a>{" "}
          con el correo de compra y la referencia del pago. Nunca envíes tu
          contraseña.
        </p>
      </section>
    </main>
  );
}
