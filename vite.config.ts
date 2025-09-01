import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: (() => {
      const rootDir = fileURLToPath(new URL('.', import.meta.url))
      return {
        '@': path.resolve(rootDir, './src'),
        '@components': path.resolve(rootDir, './src/components'),
        '@pages': path.resolve(rootDir, './src/pages'),
        '@hooks': path.resolve(rootDir, './src/hooks'),
        '@utils': path.resolve(rootDir, './src/utils'),
        '@assets': path.resolve(rootDir, './src/assets'),
        '@styles': path.resolve(rootDir, './src/styles'),
        '@services': path.resolve(rootDir, './src/services'),
        '@context': path.resolve(rootDir, './src/context'),
        '@types': path.resolve(rootDir, './src/types'),
        '@store': path.resolve(rootDir, './src/store'),
        '@routes': path.resolve(rootDir, './src/routes'),
        '@config': path.resolve(rootDir, './src/config'),
        '@libs': path.resolve(rootDir, './src/libs'),
        '@layouts': path.resolve(rootDir, './src/layouts'),
      }
    })(),
  },
})
