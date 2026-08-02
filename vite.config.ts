import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { copyFileSync, existsSync } from 'node:fs';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    base: './',
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'spa-404-fallback',
        apply: 'build',
        closeBundle() {
          const distDir = path.resolve(process.cwd(), 'dist');
          const indexHtml = path.join(distDir, 'index.html');
          const notFoundHtml = path.join(distDir, '404.html');
          if (existsSync(indexHtml)) {
            copyFileSync(indexHtml, notFoundHtml);
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // Set DISABLE_HMR=true to turn off Vite hot reload during development.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
