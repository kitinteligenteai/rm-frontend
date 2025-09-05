// RUTA: src/components/capture/WaitlistForm.jsx
// ESTADO: VERSIÓN FINAL - Alineado con Modelo de Suscripción y Oferta de Fundador

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const WaitlistForm = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [intent, setIntent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      setError("El correo es obligatorio.");
      return;
    }
    setIsSubmitting(true);
    setError('');
    
    // Simulación de envío a un backend/API
    console.log({
      email: email,
    });

    setTimeout(() => {
      setSubmitted(true);
      setIsSubmitting(false);
    }, 1000);
  };

  const handleIntentSelection = (selectedIntent) => {
    setIntent(selectedIntent);
    console.log({
      intent: selectedIntent,
    });
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center p-8 bg-white rounded-2xl shadow-lg border border-green-300"
      >
        <motion.div initial={{scale:0}} animate={{scale:1, transition:{delay:0.2, type: 'spring'}}} className="text-5xl mb-4">✅</motion.div>
        <h3 className="text-2xl font-bold text-[#00838F]">¡Excelente! Estás en la lista de fundadores.</h3>
        <p className="mt-2 text-gray-600">Has asegurado tu descuento. Recibirás un correo de confirmación en breve.</p>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h4 className="font-semibold text-gray-700">Una última pregunta (opcional):</h4>
          <p className="mt-2 text-sm text-gray-600">Para ayudarnos a construir el mejor producto, ¿qué tan probable es que te suscribieras con la oferta de fundador de **$75 USD por el primer año** (50% de descuento sobre el precio final de $149)?</p>
          
          {intent ? (
            <p className="mt-4 font-bold text-green-600">¡Gracias por tu valiosa respuesta!</p>
          ) : (
            <div className="flex flex-col sm:flex-row justify-center gap-3 mt-4">
              <button onClick={() => handleIntentSelection('muy_probable')} className="px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-all">Muy probable</button>
              <button onClick={() => handleIntentSelection('quizas')} className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-all">Quizás</button>
              <button onClick={() => handleIntentSelection('poco_probable')} className="px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-all">Poco probable</button>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="p-6 sm:p-8 bg-[#00838F] rounded-2xl shadow-2xl text-white">
      <h3 className="text-3xl font-bold text-center mb-4">Reserva tu Plaza de Fundador</h3>
      <p className="text-center text-cyan-100 mb-6 max-w-xl mx-auto">
        Únete a la lista para asegurar tu 50% de descuento vitalicio y ser el primero en acceder cuando abramos las **150 plazas** del grupo beta.
      </p>
      
      <form onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
          <div className="flex-grow">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Tu mejor correo electrónico"
              required
              className={`w-full p-4 rounded-lg text-gray-800 placeholder-gray-500 focus:ring-2 focus:outline-none transition-all ${error ? 'border-2 border-red-400 ring-red-400' : 'focus:ring-cyan-200'}`}
            />
            <AnimatePresence>
            {error && <motion.p initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="text-red-200 text-sm mt-1 ml-1">{error}</motion.p>}
            </AnimatePresence>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-4 bg-white text-[#00838F] font-bold rounded-lg shadow-md hover:bg-gray-200 transition-all duration-200 transform hover:scale-105 disabled:bg-gray-300 disabled:scale-100"
          >
            {isSubmitting ? 'Reservando...' : 'Reservar mi Plaza'}
          </button>
        </div>
        <p className="text-xs text-cyan-200 mt-3 text-center">🔒 Acceso prioritario y descuento asegurado.</p>
      </form>
    </div>
  );
};

export default WaitlistForm;
