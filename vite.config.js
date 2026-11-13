import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs'

const { version } = JSON.parse(readFileSync('./package.json', 'utf-8'))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  // The whole app is one file of about 500 kB, so the default 500 kB warning would show on
  // every build. Above 1 MB it shows again.
  build: {
    chunkSizeWarningLimit: 1000,
  },
})