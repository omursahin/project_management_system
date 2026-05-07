import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  // Development modunda base URL'i '/' yap, production'da '/static/'
  const base = command === 'serve' ? '/' : '/static/';

  return {
    plugins: [react()],
    base: base,
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.js',
      css: true,
    },
    server: {
      port: 3000,
      open: true,
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
        },
        '/media': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: false,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          assetFileNames: 'assets/[name]-[hash][extname]',
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          manualChunks: {
            'chakra': ['@chakra-ui/react', '@emotion/react', '@emotion/styled', 'framer-motion'],
            'vendor': ['react', 'react-dom', 'react-router-dom'],
            'query': ['@tanstack/react-query'],
          },
        },
      },
    },
  };
})