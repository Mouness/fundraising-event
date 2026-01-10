import { defineConfig } from 'tsup'

export default defineConfig({
    entry: ['src/index.ts', 'src/theme/theme.default.css'],
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    outDir: 'dist',
    splitting: false,
    treeshake: true,
    loader: {
        '.svg': 'dataurl',
        '.css': 'copy',
    },
})
