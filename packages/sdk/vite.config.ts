import path from 'node:path';

import { defineConfig } from 'vite';

export default defineConfig({
	resolve: {
		alias: {
			src: path.resolve(__dirname, 'src'),
			'package.json': path.resolve(__dirname, 'package.json'),
		},
	},
	build: {
		ssr: true,
		lib: {
			entry: 'src/index.ts',
			formats: ['es', 'cjs'],
			fileName: format => (format === 'es' ? 'index.js' : 'index.cjs'),
		},
	},
});
