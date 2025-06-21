const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    fs.readFile('index.html', 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Erro ao carregar arquivo');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  } else {
    res.writeHead(404);
    res.end('Não encontrado');
  }
});

const PORT = 8081;
server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});