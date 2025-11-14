import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  optimizeDeps: {
    include: ['jspdf', 'jspdf-autotable', 'exceljs'],
  },
  
  // This section fixes BOTH 'Buffer' and 'global' errors
  define: {
    'global': 'globalThis', // <-- This line fixes 'global is not defined'
    'globalThis.Buffer': ['buffer', 'Buffer'], // <-- This line fixes 'Buffer is not defined'
  },
})