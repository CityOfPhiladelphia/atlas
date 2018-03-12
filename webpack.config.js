const path = require('path');

module.exports = {
  entry: './src/main.js',
  devtool: 'source-map',
  devServer: {
    contentBase: './public',
  },
  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, 'public'),
  },
};
