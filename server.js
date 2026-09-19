const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3002;
const HOST = '127.0.0.1';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Universal Request Handler conforming to Vercel Serverless Function & Node.js HTTP
function requestHandler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  let p = (req.url || '/').split('?')[0];
  if (p === '/' || p === '') p = '/index.html';

  const filePath = path.join(__dirname, p);
  const ext = path.extname(filePath).toLowerCase();

  fs.readFile(filePath, (err, data) => {
    if (err) {
      const fallback = path.join(__dirname, 'index.html');
      fs.readFile(fallback, (err2, fallbackData) => {
        if (err2) {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('Not found');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(fallbackData);
        }
      });
    } else {
      res.writeHead(200, {
        'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
        'Cache-Control': ext === '.html' ? 'public, max-age=0, must-revalidate' : 'public, max-age=31536000, immutable'
      });
      res.end(data);
    }
  });
}

// Export handler for Vercel Serverless Function deployment
module.exports = requestHandler;

// If executed directly (node server.js locally):
if (require.main === module) {
  const server = http.createServer(requestHandler);
  server.listen(PORT, HOST, () => {
    console.log(`Co404 Tours & Travel Hub Server ready on http://${HOST}:${PORT}/`);
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      const alt = PORT + 1;
      server.listen(alt, HOST, () => {
        console.log(`Co404 Tours & Travel Hub Server ready on http://${HOST}:${alt}/`);
      });
    } else {
      console.error('Server error:', err);
    }
  });
}
