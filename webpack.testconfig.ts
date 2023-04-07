import { Configuration } from "webpack";
import { Configuration as WebPackDevServerConfig } from "webpack-dev-server";
import * as p from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";

const config: Configuration & WebPackDevServerConfig = {
  mode: "development",
  entry: {
    index: "./src/tests/index.ts"
  },
  devtool: "inline-source-map",
  resolve: {
    extensions: [".ts", ".html", ".js"]
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "ts-loader",
      },
      {
        test: /\.html$/,
        loader: "html-loader"
      }
    ],
  },
  devServer: {
    port: 3000
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "src/tests/index.html"
    })
  ],
  output: {
    filename: "[name].bundle.js",
    path: p.resolve(__dirname, "test-app"),
    clean: true
  },
	optimization: {
		splitChunks: {
			automaticNameDelimiter: '-',
			cacheGroups: {
				commons: {
					test: /[\\/]node_modules[\\/]/,
					name: "vendors",
					chunks: "all"
				}
			}
		}
	},
}
export default config;