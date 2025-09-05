// Contenido COMPLETO y DEFINITIVO para: vite.config.js

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // <-- 1. Importar el módulo 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react( )],
  // --- 2. AÑADIR LA CONFIGURACIÓN DEL ALIAS ---
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
