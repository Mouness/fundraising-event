import swc from 'unplugin-swc'
import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        globals: true,
        root: './',
        include: ['test/**/*.test.ts', 'src/**/*.test.ts'],
        exclude: ['**/node_modules/**', '**/dist/**'],
        setupFiles: ['./test/setup.ts'],
        server: {
            deps: {
                inline: ['pdfmake'],
            },
        },
    },
    resolve: {
        alias: {
            '@': './src',
        },
    },
    plugins: [
        // This is required to build the test files with SWC
        swc.vite({
            // Explicitly set the module type to avoid "import" issues
            module: { type: 'es6' },
        }) as any,
    ],
})
