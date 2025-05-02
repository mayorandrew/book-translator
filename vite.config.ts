import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  base: process.env.BASE_URL || '/',
  plugins: [solidPlugin()],
  server: {
    port: 3000,
  },
  build: {
    target: 'modules',
  },
});
