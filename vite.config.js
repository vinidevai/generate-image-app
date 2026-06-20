import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base precisa bater com o nome do repositório para o GitHub Pages servir os assets.
export default defineConfig({
  plugins: [react()],
  base: '/generate-image-app/',
})
