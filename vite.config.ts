import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  },
  define: {
    // This allows the code to use process.env.API_KEY as required by the SDK,
    // while mapping it to the Vite-compatible environment variable at build time.
    'process.env.API_KEY': 'import.meta.env.VITE_API_KEY'
  }
});