/**
 * 🌱 Agross Full-Stack Ecosystem Multi-Service Runner
 * 
 * Automatically launches and manages:
 * 1. Agross REST API Backend Server -> http://localhost:5001
 * 2. Agross Mobile App Live Preview -> http://localhost:8082
 * 3. Agross Web Admin Portal        -> http://localhost:8081
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const ROOT_DIR = __dirname;
const APP_PREVIEW_DIR = path.join(ROOT_DIR, 'app-preview');
const WEB_ADMIN_DIR = path.join(ROOT_DIR, 'web-admin');
const BACKEND_DIR = path.join(ROOT_DIR, 'backend');

// MIME types helper for static servers
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

function createStaticServer(baseDir, port, name) {
  const server = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      return res.end();
    }

    let parsedUrl = req.url.split('?')[0];
    let filePath = path.join(baseDir, parsedUrl === '/' ? 'index.html' : parsedUrl);

    // Prevent directory traversal
    if (!filePath.startsWith(baseDir)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      return res.end('Forbidden');
    }

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        // If not found or directory, try serving index.html
        filePath = path.join(baseDir, 'index.html');
      }

      fs.readFile(filePath, (readErr, content) => {
        if (readErr) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          return res.end('File Not Found');
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      });
    });
  });

  server.listen(port, () => {
    console.log(`[${name}] Running at http://localhost:${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[${name}] Port ${port} already in use. Please terminate any old process.`);
    } else {
      console.error(`[${name}] Server error:`, err);
    }
  });

  return server;
}

// 1. Start Backend API
console.log('----------------------------------------------------');
console.log('🌱 Starting Agross Farm-to-Fork Platform Ecosystem');
console.log('----------------------------------------------------');

const backendProc = spawn('node', ['server.js'], {
  cwd: BACKEND_DIR,
  stdio: 'inherit'
});

backendProc.on('error', (err) => {
  console.error('[Backend API] Failed to start backend:', err);
});

// 2. Start Unified Ecosystem Portal on port 8080
createStaticServer(ROOT_DIR, 8080, 'Ecosystem Portal');

// 3. Start Mobile App Live Preview on port 8082
createStaticServer(APP_PREVIEW_DIR, 8082, 'Mobile App Runner');

// 4. Start Web Admin Portal on port 8081
createStaticServer(WEB_ADMIN_DIR, 8081, 'Web Admin Portal');

console.log('----------------------------------------------------');
console.log('✅ Services Launched:');
console.log('🌐 Unified Ecosystem Portal: http://localhost:8080');
console.log('📱 Mobile App Runner:       http://localhost:8082');
console.log('👑 Web Admin Portal:        http://localhost:8081');
console.log('🔌 Backend REST API:        http://localhost:5001');
console.log('----------------------------------------------------');

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down Agross services...');
  backendProc.kill();
  process.exit();
});
process.on('SIGTERM', () => {
  backendProc.kill();
  process.exit();
});
