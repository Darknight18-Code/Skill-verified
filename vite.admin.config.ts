import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Direct alias for the problematic module
      'use-sync-external-store/shim': path.resolve(__dirname, 'src/shims.ts'),
      'use-sync-external-store': path.resolve(__dirname, 'src/shims.ts')
    }
  },
  define: {
    'process.env': {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      REACT_APP_API_URL: JSON.stringify(process.env.REACT_APP_API_URL || ''),
    }
  },
  build: {
    outDir: 'dist-admin',
    rollupOptions: {
      input: {
        admin: path.resolve(__dirname, 'index.admin.html'),
      },
    },
  },
  server: {
    port: 5176,
    proxy: {
      '/api': {
        target: 'http://localhost:5173',
        changeOrigin: true
      }
    }
  },
  optimizeDeps: {
    // Include React dependencies to ensure consistent resolution
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      'use-sync-external-store/shim'
    ],
    // Exclude any problematic packages
    exclude: ['@clerk/clerk-react']
  }
});