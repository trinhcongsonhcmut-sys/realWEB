import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
    open: false,
    host: true,
    watch: {
      ignored: ['**/*.glb', '**/*.gltf', '**/*.hdr', '**/*.bin', '**/*.mp4', '**/public/assets/**', '**/public/models/**']
    }
  },
  build: {
    target: 'esnext',
    chunkSizeWarningLimit: 1200
  }
});
