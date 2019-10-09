module.exports = {
    publicPath: './',
    devServer: {
        port: 3656,
        open: true,
        proxy: {
            [process.env.VUE_APP_BASE_API]: {
                target: process.env.VUE_APP_SERVICE_URL,
                changeOrigin: true,
                ws: true,
                pathRewrite: {
                    ["^" + process.env.VUE_APP_BASE_API]: ""
                }
            },
            [process.env.VUE_APP_BASE_IMG]: {
                changeOrigin: true,
                target: process.env.VUE_APP_SERVICE_URL,
                pathRewrite: {
                    ["^" + process.env.VUE_APP_BASE_IMG]: ''
                }
            }

        }
    }
}