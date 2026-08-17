import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'node:path';

export default defineConfig({
  main: {
    build: {
      lib: {
        entry: resolve(__dirname, 'electron-main/main/index.ts')
      }
    },
    plugins: [externalizeDepsPlugin()]
  },

  preload: {
    build: {
      lib: {
        entry: resolve(__dirname, 'electron-main/preload/index.ts')
      }
    },
    plugins: [externalizeDepsPlugin()]
  },

  renderer: {
    root: resolve(__dirname, 'src'),

    plugins: [react(), tailwindcss()],

    build: {
      rollupOptions: {
        input: resolve(__dirname, 'src/index.html')
      }
    }
  }
});
