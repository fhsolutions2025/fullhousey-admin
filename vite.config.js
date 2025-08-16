import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'production' ? '/' : '', // Fix for Vercel Preview builds
  build: {
    outDir: 'dist'
  }
}))
