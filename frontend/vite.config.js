import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [],
  esbuild: {
    jsx: 'automatic',
  },
  server: {
    port: 5000
  }
})