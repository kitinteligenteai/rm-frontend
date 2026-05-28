// src/components/common/LegalFooter.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function LegalFooter({ compact = false }) {
  return (
    <footer className="relative z-10 w-full border-t border-white/10 bg-black/30 px-4 py-6 text-center text-xs text-slate-400">
      <div className="mx-auto max-w-[1120px] space-y-3">
        {!compact && (
          <p className="mx-auto max-w-3xl leading-relaxed text-slate-400">
            Reinicio Metabólico ofrece contenido educativo de bienestar,
            alimentación real y hábitos. No sustituye diagnóstico, consulta,
            tratamiento médico ni indicaciones de un profesional de salud.
          </p>
        )}

        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <Link to="/terminos" className="hover:text-teal-300 transition-colors">
            Términos
          </Link>
          <Link to="/privacidad" className="hover:text-teal-300 transition-colors">
            Privacidad
          </Link>
          <Link to="/devoluciones" className="hover:text-teal-300 transition-colors">
            Devoluciones
          </Link>
          <a
            href="mailto:soporte@reiniciometabolico.net"
            className="hover:text-teal-300 transition-colors"
          >
            Soporte
          </a>
        </nav>

        <p className="text-slate-500">
          © {new Date().getFullYear()} Reinicio Metabólico.
        </p>
      </div>
    </footer>
  );
}