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
  },
};
