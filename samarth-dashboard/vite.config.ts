// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // This line fixes the "oklch" error
      'html2canvas': 'html2canvas-pro',
    },
  },
})