const http = require('http');
const fs = require('fs/promises');
const path = require('path');

const PORT = process.env.PORT ? Number(process.env.PORT) : 8000;
const HOST = process.env.HOST || '0.0.0.0';
const PUBLIC_DIR = path.resolve(__dirname, '..');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.map': 'application/json; charset=utf-8'
};

function isPathInside(parent, child) {
  const relative = path.relative(parent, child);
  return !relative.startsWith('..') && !path.isAbsolute(relative);
}

function normalizeRequestPath(urlPath) {
  const [rawPath] = urlPath.split('?');
  const decoded = decodeURIComponent(rawPath);
  if (!decoded || decoded === '/') {
    return 'index.html';
  }
  return decoded.replace(/^\/+/, '');
}

async function resolveFile(requestPath) {
  const safePath = path.normalize(requestPath).replace(/^\.?(?:\\|\/)+/, '');
  const candidates = [];

  if (!path.extname(safePath)) {
    candidates.push(`${safePath}.html`);
  }
  if (safePath.endsWith('/') || safePath === '') {
    candidates.push(path.join(safePath, 'index.html'));
  }
  candidates.unshift(safePath);

  for (const candidate of candidates) {
    const absolutePath = path.join(PUBLIC_DIR, candidate);
    if (!isPathInside(PUBLIC_DIR, absolutePath)) {
      continue;
    }
    try {
      const stats = await fs.stat(absolutePath);
      if (stats.isFile()) {
        return absolutePath;
      }
    } catch (error) {
      // File does not exist, check next candidate
    }
  }

  return null;
}

async function readFileWithFallback(filePath) {
  try {
    return await fs.readFile(filePath);
  } catch (error) {
    return null;
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const requestPath = normalizeRequestPath(req.url || '/');
    const absoluteFile = await resolveFile(requestPath);

    if (!absoluteFile) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(
        '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>404 Not Found</title></head><body><h1>404 - File Not Found</h1><p>Tệp bạn yêu cầu không tồn tại.</p></body></html>'
      );
      return;
    }

    const ext = path.extname(absoluteFile).toLowerCase();
    const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

    const data = await readFileWithFallback(absoluteFile);
    if (!data) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Không thể đọc tệp yêu cầu.');
      return;
    }

    res.writeHead(200, { 'Content-Type': mimeType });
    res.end(data);
  } catch (error) {
    console.error('Static server error:', error);
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Đã xảy ra lỗi trên máy chủ tĩnh.');
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Static server is running at http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
});
