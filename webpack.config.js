const path = require('path');

module.exports = {
  // Aquí va tu configuración existente de Webpack...
  
  resolve: {
    fallback: {
      "path": require.resolve("path-browserify"),
      "http": require.resolve("stream-http"),
      "https": require.resolve("https-browserify"),
      "stream": require.resolve("stream-browserify"),
      "url": require.resolve("url")
    }
  }
};
