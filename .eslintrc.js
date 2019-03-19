module.exports = {
	root: true,
	env: {
		node: true,
		es6: true
	},
	extends: [
		'plugin:vue/essential'
	],
	rules: {
		'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
		'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
		'no-var': 'error',
		'linebreak-style': [
			'error',
			'unix'
		],
		'quotes': [
			'error',
			'single'
		],
		'semi': [
			'error',
			'always'
		],
		'no-unused-vars': ['error', { 'argsIgnorePattern': 'next' }],
		'vue/script-indent': ['error', 'tab', {
			'baseIndent': 1,
			'switchCase': 1,
			'ignores': []
		}],
		'indent': ['error', 'tab'],
	},
	parserOptions: {
		parser: 'babel-eslint',
		ecmaVersion: 2017,
		sourceType: 'module',
		ecmaFeatures: {
			experimentalObjectRestSpread: true,
			jsx: true
		}
	},
	overrides: [
		{
			files: ['*.vue'],
			rules: {
				indent: 'off'
			}
		}
	]
};
