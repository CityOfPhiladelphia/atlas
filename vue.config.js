const Visualizer = require('webpack-visualizer-plugin');

module.exports = {
  publicPath: '/',
  configureWebpack: {
    plugins: [
      new Visualizer({ filename: './statistics.html' }),
    ],
  },
  chainWebpack: (config) => {
    config.plugins.delete('prefetch');
  },
  transpileDependencies: [
    // can be string or regex
    '@phila/mapboard',
    '@phila/vue-comps',
    '@phila/vue-mapping',
    '@phila/vue-datafetch',
    // /other-dep/
  ],
};
