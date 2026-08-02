import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    base: './',
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'spa-404-and-intro',
        apply: 'build',
        closeBundle() {
          const distDir = path.resolve(process.cwd(), 'dist');
          const indexHtml = path.join(distDir, 'index.html');
          if (!existsSync(indexHtml)) return;

          // 1) 404 fallback so unknown paths (e.g. /introduce) still serve the SPA.
          copyFileSync(indexHtml, path.join(distDir, '404.html'));

          // 2) Real intro page at /introduce/ returning HTTP 200.
          //    Deploy under introduce/ with asset paths rewritten to ../assets/..
          const introDir = path.join(distDir, 'introduce');
          mkdirSync(introDir, { recursive: true });
          const html = readFileSync(indexHtml, 'utf-8')
            .replaceAll('./assets/', '../assets/')
            .replaceAll('./favicon.svg', '../favicon.svg')
            .replaceAll('./manifest.json', '../manifest.json');
          writeFileSync(path.join(introDir, 'index.html'), html);
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
