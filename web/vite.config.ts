import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Termos e Política vêm de ../docs/legal (fonte única): o servidor de desenvolvimento precisa ler fora de web/.
  server: { fs: { allow: ['..'] } },
})
