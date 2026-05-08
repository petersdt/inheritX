import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      process: 'process/browser',
    },
  },
  optimizeDeps: {
    exclude: ['@base-org/account', '@metamask/connect-evm', '@zama-fhe/relayer-sdk'],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress optional peer dependency warnings
        if (warning.code === 'UNRESOLVED_IMPORT') return
        warn(warning)
      },
      external: [],
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
})
