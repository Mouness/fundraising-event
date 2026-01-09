import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/*.e2e.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    globals: true,
    root: './',
  },
  resolve: {
    alias: {
      '@': '../../',
    },
  },
  plugins: [swc.vite() as any],
});
