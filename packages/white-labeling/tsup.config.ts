import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts', 'src/theme/theme.default.css'],
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    outDir: 'dist',
    loader: {
        '.svg': 'dataurl',
        '.css': 'copy'
    },
    splitting: false,
    treeshake: true,
});
