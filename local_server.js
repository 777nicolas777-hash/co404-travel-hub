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
  '.svg': 'image/svg+xml'
};

const CITY_COORDS = {
  'san-cris': { lat: 16.7370, lon: -92.6376, city: 'San Cristóbal de las Casas', state: 'Chiapas', country: 'México' },
  'oaxaca': { lat: 17.0605, lon: -96.7256, city: 'Oaxaca de Juárez', state: 'Oaxaca', country: 'México' },
  'medellin': { lat: 6.2442, lon: -75.5812, city: 'Medellín', state: 'Antioquia', country: 'Colombia' }
};

// =============================================================================
// 100% FREE, ZERO-COST Open Geocoding & Business Search Engine
// (Zero Google Cloud API billing, zero credit card, zero API keys required)
// Uses open Photon/OpenStreetMap POI database biased to local city coordinates,
// returning standard free web navigation links for Google Maps & OpenStreetMap.
// =============================================================================
async function handlePlacesSearch(query, locationKey) {
  const loc = CITY_COORDS[locationKey] || CITY_COORDS['san-cris'];
  
  // 100% Free Live POI & Geocoding Search (No API Key, No Costs)
  try {
    const searchUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(query + ' ' + loc.city)}&lat=${loc.lat}&lon=${loc.lon}&limit=8`;
    const res = await fetch(searchUrl, {
      headers: { 'User-Agent': 'Co404TravelHub/1.0 (Free Open Search)' }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.features && data.features.length > 0) {
        return data.features.map(f => {
          const p = f.properties;
          const name = p.name || p.street || query;
          const addrParts = [p.street, p.housenumber, p.district, p.city || loc.city, p.country || loc.country].filter(Boolean);
          const address = addrParts.join(', ') || `${loc.city}, ${loc.country}`;
          // Standard web search URL - 100% free, opens directly in user's browser without any API charges
          const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ', ' + address)}`;
          const osmUrl = `https://www.openstreetmap.org/search?query=${encodeURIComponent(name + ', ' + address)}`;
          return {
            name,
            address,
            googleMapsUrl,
            osmUrl,
            lat: f.geometry?.coordinates?.[1] || loc.lat,
            lng: f.geometry?.coordinates?.[0] || loc.lon,
            type: p.osm_value || p.type || 'local_business',
            source: 'free-open-poi'
          };
        });
      }
    }
  } catch (err) {
    console.warn('Free open POI search error:', err.message);
  }

  // Fallback: standard free browser search URL
  const freeMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query + ', ' + loc.city)}`;
  return [{
    name: query,
    address: `${loc.city}, ${loc.country}`,
    googleMapsUrl: freeMapsUrl,
    lat: loc.lat,
    lng: loc.lon,
    source: 'free-open-direct'
  }];
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = req.url.split('?')[0];

  // API endpoint for live Google Maps / Places search
  if (parsedUrl === '/api/places-search') {
    try {
      const urlObj = new URL(req.url, `http://${HOST}:${PORT}`);
      const query = (urlObj.searchParams.get('query') || '').trim();
      const locationKey = urlObj.searchParams.get('location') || 'san-cris';

      if (!query || query.length < 2) {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: true, results: [] }));
        return;
      }

      const results = await handlePlacesSearch(query, locationKey);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: true, query, location: locationKey, results }));
    } catch (err) {
      console.error('Error handling places search:', err);
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

  // Static file serving
  let p = parsedUrl;
  if (p === '/') p = '/index.html';
  const filePath = path.join(__dirname, p);
  const ext = path.extname(filePath).toLowerCase();

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
    } else {
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'text/plain; charset=utf-8' });
      res.end(data);
    }
  });
});

let currentPort = PORT;

function startServer(port) {
  server.listen(port, HOST, () => {
    console.log(`Co404 Tours & Travel Hub Server ready on http://${HOST}:${port}/`);
  });
}

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.warn(`Port ${currentPort} occupied. Retrying on ${currentPort + 1}...`);
    currentPort++;
    startServer(currentPort);
  } else {
    console.error('Server error:', err);
  }
});

startServer(currentPort);
