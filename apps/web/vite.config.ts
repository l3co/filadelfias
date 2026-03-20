import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import compression from 'vite-plugin-compression'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    compression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240, // Only compress files > 10KB
    }),
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes('react-router') ||
            id.includes('/node_modules/react/') ||
            id.includes('/node_modules/react-dom/') ||
            id.includes('/node_modules/scheduler/') ||
            id.includes('jsx-runtime')
          ) {
            return 'vendor-react'
          }

          if (id.includes('@tanstack/react-query')) {
            return 'vendor-query'
          }

          if (id.includes('@radix-ui')) {
            return 'vendor-radix'
          }

          if (id.includes('lucide-react')) {
            return 'vendor-icons'
          }

          if (id.includes('/src/features/members/')) {
            return 'feature-members'
          }

          if (id.includes('/src/features/financial/') || id.includes('/src/features/tithe/') || id.includes('/src/features/expense/')) {
            return 'feature-financial'
          }

          if (id.includes('/src/features/governance/')) {
            return 'feature-governance'
          }

          if (id.includes('/src/features/ebd/')) {
            return 'feature-ebd'
          }

          if (id.includes('/src/features/events/')) {
            return 'feature-events'
          }

          if (id.includes('node_modules')) {
            return 'vendor-misc'
          }
        },
      },
    },
    chunkSizeWarningLimit: 300,
  },
})
