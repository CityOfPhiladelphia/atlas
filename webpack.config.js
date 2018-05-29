const path = require('path');
const webpack = require('webpack');

const env = process.env.NODE_ENV;
const isDevelopment = env === 'development';

module.exports = {
  entry: {
    app: './src/main.js',
  },
  resolve: {
    mainFields: ['module', 'main', 'browser'],
  },
  devtool: isDevelopment ? 'inline-source-map' : 'source-map',
  devServer: {
    contentBase: './public',
    host: process.env.WEBPACK_DEV_HOST,
    port: process.env.WEBPACK_DEV_PORT
  },
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: '[name].js',
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'file-loader',
        options: {
          name: 'images/[name].[ext]?[hash]',
        },
      },
    ],
  },
  plugins: [
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en/),
  ],
  mode: env,
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /node_modules/,
          chunks: 'initial',
          name: 'vendor',
          enforce: true,
          priority: 5,
        },
        mapboard: {
          test: /mapboard/,
          chunks: 'initial',
          name: 'mapboard',
          priority: 10,
        },
      },
    },
  },
};
