import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
export default function DownloadKit() {
  const [params] = useSearchParams();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function download() {
    setBusy(true);
    setError("");
    try {
      const { data, error } = await supabase.functions.invoke(
        "get-kit-download",
        {
          body: {
            session_id: params.get("session_id"),
            token: params.get("token"),
          },
        },
      );
      if (error || !data?.url)
        throw Error(
          "No pudimos verificar la descarga. Contacta a soporte con tu correo de compra.",
        );
      window.location.assign(data.url);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="min-h-screen bg-slate-950 text-white grid place-items-center p-5">
      <section className="max-w-md space-y-5 p-6 bg-slate-900 rounded-2xl">
        <h1 className="text-3xl font-bold">Tu Kit de 7 días</h1>
        <p>
          Descarga tu guía y guárdala en tu dispositivo para consultarla cuando
          quieras.
        </p>
        <button
          onClick={download}
          disabled={busy}
          className="bg-teal-500 text-slate-950 font-bold p-4 rounded-xl w-full"
        >
          {busy ? "Preparando…" : "Descargar mi Kit"}
        </button>
        {error && <p role="alert">{error}</p>}
        <a
          className="text-teal-300 underline"
          href="mailto:soporte@reiniciometabolico.net"
        >
          Solicitar ayuda
        </a>
      </section>
    </main>
  );
}
