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
				fileName: format => `index.${format}.js`,
			},
			rollupOptions: {
				external: [],
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
