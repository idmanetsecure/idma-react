import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist',
    // Vite 8 utilise rolldown — manualChunks doit être une fonction
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@supabase'))        return 'supabase'
          if (id.includes('@tanstack'))        return 'query'
          if (id.includes('chart.js') || id.includes('react-chartjs')) return 'charts'
          if (id.includes('node_modules'))     return 'vendor'
        }
      }
    }
  }
})
