import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('echarts') || id.includes('zrender')) {
              return 'echarts';
            }
            if (id.includes('@tanstack')) {
              return 'tanstack';
            }
            if (id.includes('react')) {
              return 'react';
            }
            return 'vendor';
          }
          return undefined;
        },
      },
    },
  },
});
