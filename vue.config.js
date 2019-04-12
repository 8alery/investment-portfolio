module.exports = {
	// runtimeCompiler:false,
	// configureWebpack: {
	// 	devtool: '#eval'
	// },
	publicPath: process.env.NODE_ENV === 'production'
		? '/investment-portfolio/'
		: '/'
};
