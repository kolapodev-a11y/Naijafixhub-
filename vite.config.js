import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      host: true,
      port: 3000,
      proxy: {
        '/api': {
          target: env.VITE_DEV_API_PROXY_TARGET || 'http://localhost:5000',
          changeOrigin: true,
        },
        '/uploads': {
          target: env.VITE_DEV_API_PROXY_TARGET || 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    },
    preview: {
      host: true,
      port: 3000,
    },
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  }
})
