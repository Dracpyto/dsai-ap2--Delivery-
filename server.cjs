const http = require('http');
const fs = require('fs');
const path = require('path');

const INITIAL_PORT = parseInt(process.env.PORT, 10) || 3000;
const BASE_DIR = path.join(__dirname, 'src');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml'
};

function handleRequest(req, res) {
  let reqPath = '/';
  try {
    reqPath = decodeURIComponent(req.url.split('?')[0]);
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Requisição inválida');
  }

  if (reqPath === '/') reqPath = '/index.html';
  const baseResolvido = path.resolve(BASE_DIR);
  const filePath = path.resolve(BASE_DIR, '.' + reqPath);

  // RF-07: Proteção contra Path Traversal garantindo que o arquivo pertença estritamente a BASE_DIR
  if (filePath !== baseResolvido && !filePath.startsWith(baseResolvido + path.sep)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Acesso negado');
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Arquivo não encontrado: ' + reqPath);
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

function iniciarServidor(porta) {
  const server = http.createServer(handleRequest);

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`⚠️  A porta ${porta} já está em uso por outro processo.`);
      const proximaPorta = porta + 1;
      console.log(`🔄 Tentando iniciar automaticamente na porta ${proximaPorta}...`);
      iniciarServidor(proximaPorta);
    } else {
      console.error('❌ Erro inesperado no servidor:', err);
    }
  });

  server.listen(porta, () => {
    console.log(`=========================================`);
    console.log(`🚀 Servidor DeliveryFast iniciado com sucesso!`);
    console.log(`👉 Abra no navegador: http://localhost:${porta}`);
    console.log(`=========================================`);
  });
}

iniciarServidor(INITIAL_PORT);
