import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['glace.png'],
      manifest: {
        name: 'Caisse Pompon',
        short_name: 'Caisse',
        description: 'Caisse automatique (caisse + récap utilisables hors ligne).',
        lang: 'fr',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#068aef',
        icons: [
          { src: 'glace.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        ],
      },
      workbox: {
        // L'app (HTML/JS/CSS/icône) est mise en cache => caisse + récap hors ligne.
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
        // Les appels réseau (reset + stats) ne sont jamais servis par le fallback offline.
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api/, /^\/jour/],
      },
    }),
  ],
  // En dev, le front (5173) appelle l'API du backend (4000) via ces proxys,
  // pour que le code utilise toujours des chemins relatifs (/api, /jour).
  server: {
    proxy: {
      '/api': 'http://localhost:4000',
      '/jour': 'http://localhost:4000',
    },
  },
})
