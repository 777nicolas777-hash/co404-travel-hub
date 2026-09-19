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
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function resolveFile(requestedPath) {
  const clean = requestedPath.startsWith('/') ? requestedPath.slice(1) : requestedPath;
  const searchLocations = [
    path.join(__dirname, clean),
    path.join(process.cwd(), clean),
    path.resolve(clean)
  ];
  for (const loc of searchLocations) {
    if (fs.existsSync(loc) && fs.statSync(loc).isFile()) {
      return loc;
    }
  }
  return null;
}

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
  try {
    p = decodeURIComponent(p);
  } catch (e) {}
  if (p === '/' || p === '') p = '/index.html';

  const foundPath = resolveFile(p);

  if (foundPath) {
    const ext = path.extname(foundPath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
      'Cache-Control': ext === '.html' ? 'public, max-age=0, must-revalidate' : 'public, max-age=31536000, immutable'
    });
    fs.createReadStream(foundPath).pipe(res);
    return;
  }

  // If file not found and has NO extension (e.g. clean SPA URL), fallback to index.html
  if (!path.extname(p)) {
    const indexFile = resolveFile('index.html');
    if (indexFile) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      fs.createReadStream(indexFile).pipe(res);
      return;
    }
  }

  // Not found
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('404 Not Found: ' + p);
}

module.exports = requestHandler;

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
