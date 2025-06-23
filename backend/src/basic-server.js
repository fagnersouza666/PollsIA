const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'ok', path: req.url }));
});

server.listen(9000, '127.0.0.1', () => {
  console.log('Basic HTTP server running on port 9000');
});