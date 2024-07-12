const express = require('express');
const httpsLocalhost = require('https-localhost')();
const path = require('path');

const app = express();

app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

httpsLocalhost.getCerts().then(({ key, cert }) => {
  const https = require('https');
  https.createServer({ key, cert }, app).listen(3000, () => {
    console.log('HTTPS server running on https://localhost:3000');
  });
}).catch((err) => {
  console.error('Error getting certificates:', err);
});

