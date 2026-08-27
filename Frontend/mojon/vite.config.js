import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  const env = loadEnv(mode, process.cwd(), '')
  return {
  plugins: [react()],
  define: {
    // Esto mapea la variable limpia de Vercel al nombre que usa tu app
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.API_URL)
    },
  }
})
