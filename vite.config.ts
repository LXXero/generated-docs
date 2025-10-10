import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/generated-docs/radical-programming-timeline/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
