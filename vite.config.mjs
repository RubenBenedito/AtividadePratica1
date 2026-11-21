import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  root: 'frontend',
  plugins: [svelte(), tailwindcss()],
  server: {
    proxy: {
      '/alunos': 'http://localhost:3010',
      '/cursos': 'http://localhost:3010',
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
