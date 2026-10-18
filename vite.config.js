import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    // The account API is same-origin in production, so dev proxies `/api` to the
    // local Pages Functions server (`npm run cf:dev` in the backend project).
    // Without this the storefront would call its own dev server and 404.
    proxy: {
      '/api': {
        target: 'http://localhost:8788',
        changeOrigin: true,
      },
    },
  },
})
