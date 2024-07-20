// webpack.config.js
const path = require('path');

module.exports = {
  resolve: {
    fallback: {
      "path": require.resolve("path-browserify"),
      "http": require.resolve("stream-http"),
      "https": require.resolve("https-browserify"),
      "stream": require.resolve("stream-browserify"),
      "url": require.resolve("url")
    }
  },
  module: {
    rules: [
      {
        test: /pdf\.worker\.min\.js$/,
        use: { loader: 'worker-loader' }
      }
    ]
  }
};
