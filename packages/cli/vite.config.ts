import path from 'path';
import { defineConfig } from 'vite';
import { runSize } from 'vite-plugin-size';

export default defineConfig(({ mode }) => {
	return {
		base: './',
		build: {
			ssr: true,
			sourcemap: mode === 'development',
			lib: {
				entry: path.resolve(__dirname, 'src/index.ts'),
				fileName: format => (format === 'es' ? 'index.js' : 'index.cjs'),
				name: 'Playbooks',
				formats: ['es', 'cjs'],
			},
			rollupOptions: {
				external: [/^@playbooks\//],
				output: { banner: '#!/usr/bin/env node' },
			},
		},
		plugins: [runSize({ format: 'cjs' })],
		resolve: {
			alias: {
				src: path.resolve(__dirname, 'src'),
				'package.json': path.resolve(__dirname, 'package.json'),
			},
		},
	};
});
