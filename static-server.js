// Servidor estático para el frontend (landing + dashboard) en :8090.
// El backend (API) corre por separado: cd backend && npm run dev  -> :4000
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const portFromEnv = parseInt(process.env.PORT, 10);
const PORT = Number.isFinite(portFromEnv) && portFromEnv > 0 ? portFromEnv : 8090;

const mime = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.ico': 'image/x-icon',
};

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  let file = url.pathname === '/' ? '/index.html' : url.pathname;
  const fp = path.join(ROOT, decodeURIComponent(file));
  if (!fp.startsWith(ROOT)) { res.statusCode = 403; return res.end(); }
  fs.readFile(fp, (err, data) => {
    if (err) { res.statusCode = 404; return res.end('404'); }
    res.setHeader('Content-Type', mime[path.extname(fp).toLowerCase()] || 'application/octet-stream');
    res.end(data);
  });
}).listen(PORT, () => console.log('static server on :' + PORT));
