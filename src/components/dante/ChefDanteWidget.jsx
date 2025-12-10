// src/components/dante/ChefDanteWidget.jsx
// v5.1 - Fix Z-Index y Visibilidad

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw, User, ExternalLink } from 'lucide-react';
import { danteMessages } from '../../data/danteContent';
import { useUser } from '../../context/UserContext';
import { Link } from 'react-router-dom';

const ChefDanteWidget = () => {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(null);
  
  const danteAvatarUrl = "/dante_avatar.png"; 

  const pickMessage = () => {
    const hour = new Date().getHours();
    let category = 'motivation';
    if (hour >= 6 && hour < 12) category = 'morning';
    else if (hour >= 19 || hour < 5) category = 'evening';
    
    const messages = danteMessages[category] || danteMessages['motivation'] || [{message: "¡Sigue adelante!"}];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  useEffect(() => {
    if (user) {
      setCurrentMessage(pickMessage());
      // Forzar aparición a los 3 segundos
      const timer = setTimeout(() => setIsOpen(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  if (!user) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3 pointer-events-none">
      {/* Usamos pointer-events-auto en los hijos para que se puedan clicar, pero el contenedor no tape clicks */}
      
      <AnimatePresence>
        {isOpen && currentMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20 }}
            className="bg-white border-2 border-indigo-600 rounded-2xl rounded-br-none p-4 shadow-2xl max-w-xs w-72 relative pointer-events-auto"
          >
            <button onClick={() => setIsOpen(false)} className="absolute top-2 right-2 text-slate-400 hover:text-slate-600"><X size={16} /></button>
            <h4 className="font-extrabold text-indigo-700 text-sm mb-1 uppercase tracking-wider">Tip del Chef</h4>
            <p className="text-slate-700 text-sm leading-relaxed font-medium">{currentMessage.message}</p>
            <div className="flex gap-3 mt-3 items-center pt-2 border-t border-slate-100">
                {currentMessage.action && <Link to={currentMessage.action} className="text-xs font-bold text-white bg-indigo-600 px-3 py-1.5 rounded-full hover:bg-indigo-500 transition-colors">Ir ahora →</Link>}
                <button onClick={() => setCurrentMessage(pickMessage())} className="text-xs text-slate-400 hover:text-indigo-500 flex items-center gap-1 ml-auto"><RefreshCw size={12} /> Otro tip</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        animate={{ y: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        className="relative group w-16 h-16 rounded-full border-4 border-white bg-indigo-600 shadow-xl flex items-center justify-center overflow-hidden cursor-pointer pointer-events-auto"
      >
        <img 
            src={danteAvatarUrl} 
            alt="Chef Dante" 
            className="w-full h-full object-cover"
            onError={(e) => {
                e.target.style.display = 'none'; 
                e.target.parentElement.classList.add('bg-indigo-600'); 
                const icon = document.getElementById('dante-fallback-icon');
                if(icon) icon.style.display = 'block';
            }} 
        />
        <div id="dante-fallback-icon" className="hidden absolute inset-0 flex items-center justify-center text-white">
            <User size={32} />
        </div>
        {!isOpen && <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-white rounded-full z-20"></span>}
      </motion.button>
    </div>
  );
};

export default ChefDanteWidget;