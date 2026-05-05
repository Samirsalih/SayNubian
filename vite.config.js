import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Relative asset paths so the same dist/ works at the root (Capacitor) AND
  // under a subpath like /SayNubian/ (GitHub Pages) without rebuilding.
  base: './',
  server: { host: true },
  build: { outDir: 'dist' },
});
