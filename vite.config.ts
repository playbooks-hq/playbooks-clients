import path from 'path';
import { defineConfig } from 'vite';
import { runSize } from 'vite-plugin-size';

export default defineConfig(({ mode }) => {
	return {
		base: './',
		build: {
			sourcemap: mode === 'development',
			lib: {
				entry: path.resolve(__dirname, 'src/index.ts'),
				name: 'Playbooks',
				formats: ['es', 'cjs'],
				fileName: (format, entryName) => `${entryName}.${format}.js`,
			},
			rollupOptions: {
				external: ['os'],
				output: {
					banner: '#!/usr/bin/env node',
				},
			},
		},
		plugins: [],
		resolve: {
			alias: {
				src: path.resolve(__dirname, '/src'),
			},
		},
	};
});
