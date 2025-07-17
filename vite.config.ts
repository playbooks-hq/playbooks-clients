import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
	return {
		base: './',
		build: {
			sourcemap: mode === 'development',
			lib: {
				entry: 'src/index.ts',
				name: 'playbooks',
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
		resolve: {
			alias: {
				src: '/src',
			},
		},
	};
});
