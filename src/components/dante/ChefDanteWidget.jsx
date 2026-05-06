// src/components/dante/ChefDanteWidget.jsx
// v7.0 - Dante FAB / Copiloto silencioso

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { danteMessages } from "../../data/danteContent";
import { useUser } from "../../context/UserContext";
import { supabase } from "../../lib/supabaseClient";

const ChefDanteWidget = ({
  message = null,
  action = null,
  actionLabel = "Ir ahora",
  badge = true,
}) => {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(null);

  const danteAvatarUrl = "/dante_avatar.gif";

  useEffect(() => {
    let mounted = true;

    const initDante = async () => {
      if (!user) return;

      if (message) {
        setCurrentMessage({
          message,
          action,
          actionLabel,
        });
        return;
      }

      try {
        const { data: logs } = await supabase
          .from("progress_logs")
          .select("created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1);

        const lastLog = logs?.[0];
        const daysSinceLog = lastLog
          ? (new Date() - new Date(lastLog.created_at)) /
            (1000 * 60 * 60 * 24)
          : 999;

        if (mounted && daysSinceLog > 3) {
          setCurrentMessage({
            message:
              "Hace días que no registras tu avance. Cuando lo haces, el sistema puede mostrarte mejor tu progreso y ayudarte a retomar el hilo.",
            action: "/plataforma/bitacora",
            actionLabel: "Registrar avance",
          });
          return;
        }
      } catch (e) {
        console.warn("Dante check:", e);
      }

      const hour = new Date().getHours();
      let category = "motivation";

      if (hour >= 6 && hour < 12) {
        category = Math.random() > 0.4 ? "morning" : "nutrition";
      } else if (hour >= 19 || hour < 5) {
        category = Math.random() > 0.4 ? "evening" : "hydration";
      } else {
        category = Math.random() > 0.5 ? "nutrition" : "motivation";
      }

      const options = danteMessages[category] || danteMessages.motivation || [];
      const selected =
        options[Math.floor(Math.random() * options.length)] || {
          message:
            "No buscamos perfección. Buscamos consistencia suficiente para que tu cuerpo vuelva a responder.",
        };

      if (mounted) {
        setCurrentMessage({
          message: selected.message,
          action: selected.action || null,
          actionLabel: "Ir ahora",
        });
      }
    };

    initDante();

    return () => {
      mounted = false;
    };
  }, [user, message, action, actionLabel]);

  if (!user) return null;

  const hasMessage = Boolean(currentMessage?.message);

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3 pointer-events-none">
      <AnimatePresence>
        {isOpen && hasMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 10 }}
            className="relative bg-white text-slate-800 border border-slate-200 rounded-2xl p-4 shadow-2xl max-w-xs w-80 pointer-events-auto"
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-2 right-2 text-slate-400 hover:text-slate-600"
              aria-label="Cerrar mensaje de Dante"
            >
              <X size={16} />
            </button>

            <div className="flex items-start gap-3 pr-4">
              <div className="w-9 h-9 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0">
                <Sparkles size={18} />
              </div>

              <div>
                <h4 className="font-extrabold text-indigo-700 text-sm mb-1 uppercase tracking-wider">
                  Dante te guía
                </h4>

                <p className="text-slate-700 text-sm leading-relaxed font-medium">
                  {currentMessage.message}
                </p>

                {currentMessage.action && (
                  <Link
                    to={currentMessage.action}
                    onClick={() => setIsOpen(false)}
                    className="inline-flex items-center gap-1 mt-3 text-xs font-bold text-white bg-indigo-600 px-3 py-2 rounded-full hover:bg-indigo-500 transition-colors"
                  >
                    {currentMessage.actionLabel}
                    <ArrowRight size={12} />
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen((prev) => !prev)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.96 }}
        animate={{ y: [0, -4, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        className="relative w-16 h-16 rounded-full border-4 border-white bg-indigo-600 shadow-xl flex items-center justify-center overflow-hidden cursor-pointer pointer-events-auto"
        aria-label="Abrir guía de Dante"
      >
        <img
          src={danteAvatarUrl}
          alt="Chef Dante"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />

        <div className="absolute inset-0 hidden items-center justify-center text-white">
          <User size={32} />
        </div>

        {!isOpen && badge && hasMessage && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-white rounded-full animate-pulse" />
        )}
      </motion.button>
    </div>
  );
};

export default ChefDanteWidget;