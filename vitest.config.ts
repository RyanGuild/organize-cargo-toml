import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.{test,spec}.ts'],
    globals: true,
    setupFiles: ['tests/setup.ts']
  },
  resolve: {
    alias: {
      'vscode': resolve(__dirname, 'tests/__mocks__/vscode.ts')
    }
  }
});
