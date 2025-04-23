import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      stream: 'stream-browserify',
      util: 'util',
      buffer: 'buffer',
      process: 'process/browser',
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          arweave: ['arweave']
        }
      }
    },
    commonjsOptions: {
      transformMixedEsModules: true
    }
  },
  define: {
    'process.env': {},
    global: {}
  }
})
