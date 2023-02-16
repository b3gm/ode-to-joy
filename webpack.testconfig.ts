import { Configuration } from "webpack";
import { Configuration as WebPackDevServerConfig } from "webpack-dev-server";
import * as p from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";

const config: Configuration & WebPackDevServerConfig = {
  mode: "development",
  entry: {
    index: "./test-src/index.ts"
  },
  devtool: "inline-source-map",
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "ts-loader",
        options: {
          configFile: "tsconfig.testApp.json"
        }
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
      template: "test-src/index.html"
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