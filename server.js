const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const port = 3000; // Porta do proxy (pode mudar se quiser)

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, solana-client');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

app.use('/rpc', createProxyMiddleware({
    target: 'https://solana-rpc.publicnode.com', // Endpoint mais leniente
    changeOrigin: true,
    pathRewrite: {
        '^/rpc': '',
    },
    onProxyReq: (proxyReq, req, res) => {
        // Remove headers que podem identificar como browser
        proxyReq.removeHeader('origin');
        proxyReq.removeHeader('referer');
        // Define um User-Agent server-like
        proxyReq.setHeader('user-agent', 'Node.js Solana Proxy');
    }
}));

app.listen(port, () => {
    console.log(`Proxy rodando em http://localhost:${port}`);
});

app.get('/raydium-pairs', async (req, res) => {
    try {
        const response = await fetch('https://api.raydium.io/v2/main/pairs');
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch Raydium pairs' });
    }
});