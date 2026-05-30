import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit(),
    SvelteKitPWA({
      registerType: 'autoUpdate',
      strategies: 'generateSW',
      manifest: {
        name: 'Gothic Garrison',
        short_name: 'Gothic Garrison',
        description: 'List builder for The Silver Bayonet',
        theme_color: '#0e0b08',
        background_color: '#0e0b08',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        navigateFallback: '/',
        globPatterns: ['client/**/*.{js,css,ico,png,svg,webp,woff,woff2}'],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
});
