// src/components/common/Button.jsx (VERSIÓN FINAL CON EL ERROR DE SINTAXIS CORREGIDO)
import React from 'react';
import { motion } from 'framer-motion';

export default function Button({ onClick, children, variant = 'primary', size = 'medium', className = '', disabled = false }) {
  const baseStyles = 'font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 font-body';
  const variantStyles = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-soft hover:shadow-medium',
    disabled: 'bg-neutral-200 text-neutral-500 cursor-not-allowed',
    outline: 'bg-transparent border-2 border-primary-600 text-primary-600 hover:bg-primary-50',
    ghost: 'bg-transparent text-neutral-600 hover:bg-neutral-100',
  };
  const sizeStyles = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-6 py-2.5 text-body',
    large: 'px-12 py-4 text-subtitle',
  };
  
  // ¡AQUÍ ESTÁ LA CORRECCIÓN! Usamos backticks (`) en lugar de comillas.
  const styles = `${baseStyles} ${sizeStyles[size]} ${variantStyles[disabled ? 'disabled' : variant]} ${className}`;

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={onClick}
      className={styles}
      disabled={disabled}
    >
      {children}
    </motion.button>
  );
}
