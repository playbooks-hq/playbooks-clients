import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import prettierConfig from 'eslint-config-prettier';
import eqeqeqFix from 'eslint-plugin-eqeqeq-fix';
import prettierPlugin from 'eslint-plugin-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';

export default defineConfig([
	{
		ignores: ['build', 'dist', 'node_modules'],
	},
	js.configs.recommended,
	...tseslint.configs['flat/recommended'],
	{
		files: ['**/*.{js,mjs,cjs,ts,tsx}'],
		languageOptions: {
			parser: tsParser,
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: {
				...globals.node,
			},
		},
		plugins: {
			'@typescript-eslint': tseslint,
			'eqeqeq-fix': eqeqeqFix,
			prettier: prettierPlugin,
			'react-hooks': reactHooks,
			'simple-import-sort': simpleImportSort,
			'unused-imports': unusedImports,
		},
		rules: {
			...prettierConfig.rules,
			...prettierPlugin.configs.recommended.rules,
			...eqeqeqFix.configs.recommended.rules,
			eqeqeq: ['warn'],
			'no-empty': ['warn'],
			'no-useless-escape': ['warn'],
			'unused-imports/no-unused-imports': 'error',
			'no-mixed-spaces-and-tabs': ['off'],
			'no-multi-spaces': 'error',
			'no-multiple-empty-lines': 'error',
			'object-curly-spacing': ['warn', 'always'],
			'@typescript-eslint/ban-ts-comment': 'off',
			'@typescript-eslint/explicit-module-boundary-types': 'off',
			'@typescript-eslint/no-empty-function': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-require-imports': 'off',
			'@typescript-eslint/no-unsafe-declaration-merging': 'off',
			'@typescript-eslint/no-unused-expressions': 'off',
			'@typescript-eslint/no-unused-vars': 'off',
			'@typescript-eslint/no-var-requires': 'off',
			'react-hooks/exhaustive-deps': 'off',
			'simple-import-sort/imports': 'error',
			'simple-import-sort/exports': 'off',
		},
	},
	{
		files: ['**/*.{js,ts,tsx,css}'],
		rules: {
			'simple-import-sort/imports': [
				'error',
				{
					groups: [['react', 'next']],
				},
			],
		},
	},
]);
