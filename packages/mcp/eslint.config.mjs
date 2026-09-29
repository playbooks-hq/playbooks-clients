import js from '@eslint/js';
import tsEslintPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import eslintPluginComplete from 'eslint-plugin-complete';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';
import globals from 'globals';

export default [
	{
		ignores: ['dist', 'node_modules'],
	},
	js.configs.recommended,
	...tsEslintPlugin.configs['flat/recommended'],
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
			'@typescript-eslint': tsEslintPlugin,
			complete: eslintPluginComplete,
			prettier: prettierPlugin,
			'simple-import-sort': simpleImportSortPlugin,
			'unused-imports': unusedImportsPlugin,
		},
		rules: {
			eqeqeq: 'off',
			'complete/eqeqeq-fix': 'error',
			'no-empty': ['warn'],
			'no-control-regex': 'off',
			'no-useless-escape': ['warn'],
			'unused-imports/no-unused-imports': 'error',
			'no-mixed-spaces-and-tabs': ['off'],
			'no-multi-spaces': 'error',
			'no-multiple-empty-lines': 'error',
			'object-curly-spacing': ['warn', 'always'],
			'@typescript-eslint/ban-ts-comment': 'off',
			'@typescript-eslint/no-empty-function': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unused-vars': 'off',
			'@typescript-eslint/no-var-requires': 'off',
			'@typescript-eslint/explicit-module-boundary-types': 'off',
			'prettier/prettier': 'error',
			'simple-import-sort/imports': 'error',
			'simple-import-sort/exports': 'off',
		},
	},
	prettierRecommended,
];
