import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  input: {
    home: resolve(import.meta.dirname, 'index.html'),
    grimoire: resolve(import.meta.dirname, 'grimoire/index.html'),
    dice: resolve(import.meta.dirname, 'dice/index.html'),
  },
});
