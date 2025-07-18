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
				name: 'Playbooks',
				formats: ['es', 'cjs'],
				fileName: (format, entryName) => `${entryName}.${format}.js`,
			},
			rollupOptions: {
				external: [
					'assert',
					'constants',
					'events',
					'path',
					'fs',
					'node:os',
					'node_child_process',
					'node:process',
					'stream',
					'util',
				],
				output: {
					banner: '#!/usr/bin/env node',
				},
			},
		},
		plugins: [runSize()],
		resolve: {
			alias: {
				src: path.resolve(__dirname, '/src'),
			},
		},
	};
});
