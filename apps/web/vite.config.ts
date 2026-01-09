/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import { loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '')
    const apiTarget = env.VITE_API_TARGET || 'http://127.0.0.1:3000'

    return {
        plugins: [react(), tailwindcss()],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
                '@core': path.resolve(__dirname, './src/core'),
                '@features': path.resolve(__dirname, './src/features'),
                '@test': path.resolve(__dirname, './src/test'),
                '@fundraising/white-labeling/css': path.resolve(
                    __dirname,
                    '../../packages/white-labeling/src/theme/theme.default.css',
                ),
                '@fundraising/white-labeling': path.resolve(
                    __dirname,
                    '../../packages/white-labeling/src/index.ts',
                ),
                '@fundraising/types': path.resolve(__dirname, '../../packages/types/src/index.ts'),
            },
        },
        server: {
            proxy: {
                '/api': {
                    target: apiTarget,
                    changeOrigin: true,
                    // No rewrite needed if backend has global prefix 'api'
                },
                '/socket.io': {
                    target: apiTarget,
                    changeOrigin: true,
                    ws: true,
                },
            },
        },
        build: {
            chunkSizeWarningLimit: 1000,
            rollupOptions: {
                output: {
                    manualChunks: (id) => {
                        if (id.includes('node_modules')) {
                            if (
                                id.includes('react') ||
                                id.includes('react-dom') ||
                                id.includes('react-router-dom')
                            ) {
                                return 'react-vendor'
                            }
                            if (id.includes('lucide-react') || id.includes('radix-ui')) {
                                return 'ui-vendor'
                            }
                            return 'vendor'
                        }
                    },
                },
            },
        },
        test: {
            globals: true,
            environment: 'jsdom',
            setupFiles: './src/test/setup.ts',
            css: true,
            include: ['src/test/**/*.test.{ts,tsx}'],
        },
    }
})
