import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

// Plugin to handle media imports in tests
const mockMediaPlugin = () => ({
  name: 'mock-media',
  resolveId(id: string) {
    if (id.match(/\.(mp4|webm|ogg|mp3|wav|flac|aac)$/)) {
      return id;
    }
    return null;
  },
  load(id: string) {
    if (id.match(/\.(mp4|webm|ogg|mp3|wav|flac|aac)$/)) {
      return 'export default "mocked-media-file"';
    }
    return null;
  },
});

export default defineConfig({
  plugins: [
    react(),
    mockMediaPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['mask-icon.svg', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'EduCloud Student Management',
        short_name: 'EduCloud',
        description: 'Advanced Student Management System with Offline Capabilities',
        theme_color: '#0a0a0f',
        background_color: '#0a0a0f',
        display: 'standalone',
        icons: [
          {
            src: 'mask-icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    css: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});