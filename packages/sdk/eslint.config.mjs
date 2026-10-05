import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import { defineConfig } from 'eslint/config';
import prettierConfig from 'eslint-config-prettier';
import eslintPluginComplete from 'eslint-plugin-complete';
import prettierPlugin from 'eslint-plugin-prettier';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';

export default defineConfig([
	{
		ignores: ['build', 'dist', 'node_modules'],
	},
	{
		files: ['src/**/*.ts'],
		rules: {
			'no-restricted-imports': [
				'error',
				{
					patterns: [{ group: ['./*', '../*'], message: 'Use package-root absolute imports.' }],
				},
			],
		},
	},
	js.configs.recommended,
	...tsPlugin.configs['flat/recommended'],
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
			'@typescript-eslint': tsPlugin,
			complete: eslintPluginComplete,
			prettier: prettierPlugin,
			'simple-import-sort': simpleImportSort,
			'unused-imports': unusedImports,
		},
		rules: {
			...tsPlugin.configs.recommended.rules,
			'complete/eqeqeq-fix': 'error',
			'no-empty': ['warn'],
			'no-redeclare': 'off',
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
			'simple-import-sort/imports': 'error',
			'simple-import-sort/exports': 'off',
			'prettier/prettier': 'error',
		},
	},
	{
		files: ['tests/**/*.{js,ts,tsx}', '**/*.test.{js,ts,tsx}'],
		languageOptions: {
			globals: {
				...globals.jest,
			},
		},
	},
	prettierConfig,
]);
