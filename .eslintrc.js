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
		'no-console': 'off', //process.env.NODE_ENV === 'production' ? 'error' : 'off',
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
		ecmaVersion: 9,
		sourceType: 'module',
		ecmaFeatures: {
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
