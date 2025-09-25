import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/extension.ts'),
      name: 'extension',
      fileName: 'extension',
      formats: ['es']
    },
    rollupOptions: {
      external: ['vscode'],
      output: {
        format: 'cjs',
        entryFileNames: '[name].js'
      }
    },
    outDir: 'dist',
    sourcemap: true,
    target: 'node16',
    minify: false
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
  }
});
