// src/components/dante/ChefDanteWidget.jsx
// v4.0 - Estilo Videojuego (Animado y Flotante)

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, RefreshCw, MessageCircle } from 'lucide-react';
import { danteMessages } from '../../data/danteContent';
import { useUser } from '../../context/UserContext';
import { Link } from 'react-router-dom';

const ChefDanteWidget = () => {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false); // Si el mensaje está abierto o cerrado
  const [currentMessage, setCurrentMessage] = useState(null);
  
  // URL de la imagen de Dante (Asegúrate de tenerla en public/images)
  // Si no tienes una recortada redonda, el código la recorta automáticamente.
  const danteAvatarUrl = "/images/dante_avatar.png"; // ⚠️ Asegúrate de subir una foto de dante con este nombre

  // Función para elegir mensaje
  const pickMessage = () => {
    const hour = new Date().getHours();
    let category = 'motivation';

    if (hour >= 6 && hour < 12) category = Math.random() > 0.5 ? 'morning' : 'nutrition';
    else if (hour >= 19 || hour < 5) category = Math.random() > 0.5 ? 'evening' : 'hydration';
    else category = Math.random() > 0.5 ? 'nutrition' : 'motivation';

    const messages = danteMessages[category] || danteMessages['motivation'];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  useEffect(() => {
    if (user) {
      setCurrentMessage(pickMessage());
      // Al entrar, esperamos 2 segundos y "saltamos" para llamar la atención
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  if (!user) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      
      {/* 1. EL GLOBO DE TEXTO (El mensaje) */}
      <AnimatePresence>
        {isOpen && currentMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20 }}
            className="bg-white border-2 border-indigo-600 rounded-2xl rounded-br-none p-4 shadow-2xl max-w-xs w-72 relative"
          >
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-2 right-2 text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
            
            <h4 className="font-extrabold text-indigo-700 text-sm mb-1 uppercase tracking-wider">
              Tip del Chef
            </h4>
            <p className="text-slate-700 text-sm leading-relaxed font-medium">
              {currentMessage.message}
            </p>

            <div className="flex gap-3 mt-3 items-center pt-2 border-t border-slate-100">
                {currentMessage.action && (
                  <Link 
                    to={currentMessage.action}
                    className="text-xs font-bold text-white bg-indigo-600 px-3 py-1.5 rounded-full hover:bg-indigo-500 transition-colors"
                  >
                    Ir ahora →
                  </Link>
                )}
                <button 
                  onClick={() => setCurrentMessage(pickMessage())}
                  className="text-xs text-slate-400 hover:text-indigo-500 flex items-center gap-1 ml-auto"
                >
                  <RefreshCw size={12} /> Otro tip
                </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. EL PERSONAJE (El círculo animado) */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        // Esta es la animación de "Respiración" para que se vea vivo
        animate={{ y: [0, -5, 0] }}
        transition={{ 
          repeat: Infinity, 
          duration: 3, 
          ease: "easeInOut" 
        }}
        className="relative group"
      >
        {/* Halo brillante */}
        <div className="absolute inset-0 bg-indigo-500 rounded-full blur opacity-50 group-hover:opacity-100 transition-opacity animate-pulse"></div>
        
        {/* Círculo con la imagen */}
        <div className="w-16 h-16 rounded-full border-4 border-white bg-indigo-600 overflow-hidden shadow-xl relative z-10 flex items-center justify-center">
            {/* Si no tienes la imagen subida aún, muestra un icono, si la subes, se verá la foto */}
            <img 
                src={danteAvatarUrl} 
                alt="Chef Dante" 
                className="w-full h-full object-cover"
                onError={(e) => {
                    e.target.style.display = 'none'; // Si falla la imagen, ocúltala
                    // Mostramos icono de respaldo
                    e.target.parentNode.classList.add('flex', 'items-center', 'justify-center');
                }} 
            />
            {/* Icono de respaldo por si no hay foto */}
            <MessageCircle className="text-white w-8 h-8 absolute" style={{ zIndex: -1 }} /> 
        </div>

        {/* Notificación roja si está cerrado */}
        {!isOpen && (
            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-white rounded-full z-20"></span>
        )}
      </motion.button>

    </div>
  );
};

export default ChefDanteWidget;