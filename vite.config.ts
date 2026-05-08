import { defineConfig } from 'vite'

export default defineConfig({
  // Base-Pfad für GitHub Pages: snadbreugen.github.io/colorizateur/
  base: '/colorizateur/',
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
})
