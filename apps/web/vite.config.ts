import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Per README port mapping:
//   Web Frontend  → 3000
//   Backend API   → 3001
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      // Proxy all /api/* requests to the Fastify backend at :3001
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
