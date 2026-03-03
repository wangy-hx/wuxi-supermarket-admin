import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [vue()],
    server: {
      port: 5174,
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:3000',
          changeOrigin: true
        }
      }
    },
    define: {
      __VITE_API_BASE_URL__: JSON.stringify(env.VITE_API_BASE_URL)
    }
  }
})