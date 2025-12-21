import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: ['**/*.e2e.test.ts'],
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
