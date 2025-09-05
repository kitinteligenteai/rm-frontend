// src/components/dante/ChefDante.jsx (VERSIÓN FINAL)
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare } from 'lucide-react';
import { danteMessages } from '../../data/danteContent';

const ChefDante = ({ trigger, onDanteInteraction }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (trigger) {
      // Ahora busca en la estructura correcta
      const messageToShow = danteMessages.triggers[trigger]?.[1]; // Usamos nivel 1 por ahora
      if (messageToShow) {
        setMessage(messageToShow);
        setIsVisible(true);
        const timer = setTimeout(() => {
          setIsVisible(false);
          if (onDanteInteraction) onDanteInteraction();
        }, 8000); // Mensaje visible por 8 segundos
        return () => clearTimeout(timer);
      }
    }
  }, [trigger, onDanteInteraction]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="bg-white rounded-2xl shadow-strong border border-neutral-200 p-5"
        >
          <div className="flex items-start">
            <div className="mr-4 flex-shrink-0">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-primary-600" />
              </div>
            </div>
            <div className="flex-grow">
              <h3 className="font-display text-title text-neutral-800">Un consejo de Dante</h3>
              <p className="text-body text-neutral-700 mt-2">{message}</p>
            </div>
            <button onClick={() => setIsVisible(false)} className="ml-4 p-1 rounded-full hover:bg-neutral-100">
              <X className="w-5 h-5 text-neutral-500" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
export default ChefDante;
