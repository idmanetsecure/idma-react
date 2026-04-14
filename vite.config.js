import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [react(), cloudflare()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor:    ['react', 'react-dom', 'react-router-dom'],
          supabase:  ['@supabase/supabase-js'],
          query:     ['@tanstack/react-query'],
          charts:    ['chart.js', 'react-chartjs-2'],
          pdf:       ['jspdf', 'jspdf-autotable'],
        }
      }
    }
  }
})