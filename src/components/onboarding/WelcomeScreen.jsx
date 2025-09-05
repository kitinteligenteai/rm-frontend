// src/components/onboarding/WelcomeScreen.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { ChefHat, Sparkles } from 'lucide-react';
import Button from '../common/Button';

const WelcomeScreen = ({ onNext }) => {
  return (
    <div className="flex items-center justify-center min-h-screen p-6 text-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="w-full max-w-2xl"
      >
        {/* NOTA: Aquí iría el fondo con imagen de ingredientes */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 bg-white rounded-3xl shadow-medium flex items-center justify-center">
              <ChefHat className="w-12 h-12 text-primary-600" />
            </div>
            <Sparkles className="w-8 h-8 text-secondary-500 absolute -top-2 -right-2" />
          </div>
        </div>
        <h1 className="font-display text-hero text-neutral-800 mb-6">Un Momento Importante Antes de Empezar</h1>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-soft mb-10">
          <p className="text-body text-neutral-700 leading-relaxed">
            Bienvenido. <strong>'El Chef Sistematizado'</strong> es una herramienta educativa diseñada para ayudarte a mejorar tu estilo de vida a través de la comida real de forma segura y sostenible.
          </p>
        </div>
        <Button onClick={onNext} variant="primary" size="large">
          Entendido, continuar
        </Button>
      </motion.div>
    </div>
  );
};
export default WelcomeScreen;
