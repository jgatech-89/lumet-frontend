import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Necesario en Docker sobre Windows: los eventos del sistema de archivos no
    // se propagan al contenedor, así que el hot reload usa polling.
    watch: {
      usePolling: process.env.VITE_USE_POLLING === 'true',
    },
  },
})
