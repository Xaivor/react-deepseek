const path = require("path");
const { config } = require("process");

module.exports = {
  webpack: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
    configure: (webpackConfig, { env, paths }) => {
      webpackConfig.output.publicPath = "/react-deepseek/";
      return webpackConfig;
    },
  },
  devServer: {
    port: 3000,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    proxy: {
      "/api": {
        target: "https://ark.cn-beijing.volces.com/api/v3",
        changeOrigin: true,
        headers: {
          // 添加额外的请求头
          "Access-Control-Allow-Origin": "*",
        },
        pathRewrite: {
          "^/api": "",
        },
      },
    },
  },
};
