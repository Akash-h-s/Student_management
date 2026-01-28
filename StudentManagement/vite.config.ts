import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
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
  plugins: [react(), mockMediaPlugin()],
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