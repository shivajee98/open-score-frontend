import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const adminUrl = env.ADMIN_PANEL_URL || 'http://127.0.0.1:3001';
  const backendUrl = env.BACKEND_API_URL || 'http://127.0.0.1:8001';

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-vendor': ['lucide-react', 'framer-motion'],
            'utils-vendor': ['jose', 'date-fns', 'clsx', 'tailwind-merge'],
            'qr-vendor': ['html5-qrcode', 'react-qr-code', 'html2canvas'],
            'realtime-vendor': ['laravel-echo', 'pusher-js'],
          },
        },
      },
      chunkSizeWarningLimit: 600,
    },
    server: {
      proxy: {
        '/admin': {
          target: adminUrl,
          changeOrigin: true,
        },
        '/api': {
          target: backendUrl,
          changeOrigin: true,
          rewrite: (path) => {
            if (path.startsWith('/api/proxy') || path.startsWith('/api/auth')) {
              return path;
            }
            return path.replace(/^\/api/, '/api');
          }
        },
      },
    },
  };
});
