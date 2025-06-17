import react from '@vitejs/plugin-react';

import { defineConfig } from 'vite';

export default defineConfig({
	base: './',
	plugins: [react()],
	build: {
		sourcemap: true,
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
});
