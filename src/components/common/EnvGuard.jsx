// RUTA: src/components/common/EnvGuard.jsx
import React, { useMemo, useEffect, useState } from "react";

/**
 * Valida y muestra un banner si faltan/son inválidas variables .env
 * - Modo dev: se muestra automáticamente.
 * - Producción: puedes forzarlo con ?env=1 en la URL.
 */
export default function EnvGuard() {
  const [visible, setVisible] = useState(false);

  const issues = useMemo(() => {
    const E = import.meta.env;
    const errs = [];

    const has = (k) => {
      const v = E[k];
      return v !== undefined && String(v).trim() !== "";
    };
    const ensure = (cond, msg) => { if (!cond) errs.push(msg); };

    // Validaciones críticas
    ensure(has("VITE_SUPABASE_URL"), "Falta VITE_SUPABASE_URL");
    ensure(has("VITE_SUPABASE_PROJECT_REF"), "Falta VITE_SUPABASE_PROJECT_REF");
    ensure(has("VITE_SUPABASE_ANON_KEY"), "Falta VITE_SUPABASE_ANON_KEY");
    ensure(has("VITE_MERCADOPAGO_PUBLIC_KEY"), "Falta VITE_MERCADOPAGO_PUBLIC_KEY");
    ensure(has("VITE_GUMROAD_KIT_URL"), "Falta VITE_GUMROAD_KIT_URL");
    ensure(has("VITE_GUMROAD_PROG_URL"), "Falta VITE_GUMROAD_PROG_URL");

    // Validaciones de formato (no bloqueantes, solo avisos)
    const anon = E.VITE_SUPABASE_ANON_KEY;
    if (anon && (anon.split(".").length !== 3))
      errs.push("VITE_SUPABASE_ANON_KEY no parece tener un formato JWT válido (xxx.yyy.zzz)");

    const mpPub = E.VITE_MERCADOPAGO_PUBLIC_KEY;
    if (mpPub && !/^(APP_USR|TEST_USR)/.test(mpPub))
      errs.push("VITE_MERCADOPAGO_PUBLIC_KEY debe iniciar con APP_USR- o TEST_USR-");

    return errs;
  }, []);

  useEffect(() => {
    const force = new URLSearchParams(window.location.search).get("env") === "1";
    const isDev = import.meta.env.DEV;
    const shouldShow = (isDev || force) && issues.length > 0;
    setVisible(shouldShow);

    if (issues.length > 0 && (isDev || force)) {
        console.group("%cEnvGuard: Problemas Detectados", "color:#f59e0b;font-weight:bold;");
        console.table(issues.map((m, i) => ({ "#": i + 1, Problema: m })));
        console.groupEnd();
    }
  }, [issues]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 inset-x-0 z-[9999] p-2">
      <div className="mx-auto max-w-5xl px-4 py-3 rounded-xl border border-yellow-300/40 bg-yellow-50 text-yellow-900 shadow-lg">
        <div className="flex items-start gap-3">
          <span className="mt-1.5 inline-flex h-2.5 w-2.5 rounded-full bg-yellow-500 animate-pulse" />
          <div className="text-sm leading-5">
            <p className="font-semibold">EnvGuard: ¡Atención! Variables de entorno faltantes o inválidas</p>
            <ul className="list-disc ml-5 mt-1 space-y-0.5">
              {issues.map((msg, i) => <li key={i}>{msg}</li>)}
            </ul>
            <p className="mt-2 text-[12px] text-yellow-800/80">
              Este aviso solo es visible en desarrollo. Revisa tu archivo <code>.env.local</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
