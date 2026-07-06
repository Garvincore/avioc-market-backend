import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  publicDir: 'static', // Load static assets from static/
  build: {
    outDir: 'public', // Output build bundle to public/
    emptyOutDir: true // Clear the folder before building
  }
})
