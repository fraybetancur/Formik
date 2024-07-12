const { injectManifest } = require('workbox-webpack-plugin');
const { override, addWebpackPlugin } = require('customize-cra');

module.exports = override(
  addWebpackPlugin(
    new injectManifest({
      swSrc: './src/service-worker.js',
      swDest: 'service-worker.js',
    })
  )
);
