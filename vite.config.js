// Vite config: tells Vite this site has 3 HTML pages, so all of them
// are included when we run "npm run build" for deployment.
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    chunkSizeWarningLimit: 800, // three.js is a big library; this hides a harmless warning
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        revenue: resolve(__dirname, 'revenue.html'),
        compensation: resolve(__dirname, 'compensation.html'),
      },
    },
  },
});
