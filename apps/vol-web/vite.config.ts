import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@vickora/optics-engine': path.resolve(__dirname, '../../packages/optics-engine/src/index.ts'),
      '@vickora/vol-data': path.resolve(__dirname, '../../packages/vol-data/src/index.ts'),
      '@vickora/vol-learning': path.resolve(__dirname, '../../packages/vol-learning/src/index.ts'),
      '@vickora/vol-xr': path.resolve(__dirname, '../../packages/vol-xr/src/index.ts'),
      '@vickora/shared': path.resolve(__dirname, '../../packages/shared/src/index.ts'),
      '@vxr/core': path.resolve(__dirname, '../../packages/vxr-core/src/index.ts'),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
});
