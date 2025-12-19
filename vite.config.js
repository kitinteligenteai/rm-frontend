import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Reinicio Metabólico',
        short_name: 'Reinicio M.',
        description: 'Sistema de transformación metabólica inteligente.',
        theme_color: '#0f172a', // Tu color Slate-900
        background_color: '#0f172a',
        display: 'standalone', // Modo pantalla completa (sin barra de navegador)
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png', // ✅ Apuntando a tus nuevos archivos
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png', // ✅ Apuntando a tus nuevos archivos
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
});