const express = require('express');

const app = express();
const port = 3001;

console.log('🚀 Iniciando servidor proxy Express para Solana...');

// CORS middleware
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

// JSON middleware
app.use(express.json());

// Endpoint para Raydium pairs
app.get('/api/solana/raydium-pairs', async (req, res) => {
  try {
    console.log('📡 Fetching Raydium pairs...');
    const response = await fetch('https://api.raydium.io/v2/main/pairs');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`✅ Fetched ${data.length || 0} Raydium pairs`);
    
    res.json(data);
  } catch (error) {
    console.error('❌ Error fetching Raydium pairs:', error);
    res.status(500).json({
      error: 'Failed to fetch Raydium pairs',
      message: error.message
    });
  }
});

// Proxy RPC para Solana
app.post('/api/solana/rpc', async (req, res) => {
  try {
    console.log(`📡 Proxy RPC request: ${req.body?.method || 'unknown'}`);
    
    const response = await fetch('https://solana-rpc.publicnode.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'PollsIA-Backend-Proxy'
      },
      body: JSON.stringify(req.body)
    });
    
    if (!response.ok) {
      throw new Error(`RPC error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`✅ RPC response: ${response.status}`);
    
    res.json(data);
  } catch (error) {
    console.error('❌ RPC proxy error:', error);
    res.status(500).json({
      error: 'RPC proxy error',
      message: error.message
    });
  }
});

// Mock endpoints para evitar 404s
app.get('/api/wallet/:publicKey/portfolio', (req, res) => {
  console.log(`📋 Mock wallet portfolio request for: ${req.params.publicKey}`);
  res.json({
    success: true,
    data: {
      totalValue: 0,
      solBalance: 0,
      tokens: [],
      defiPositions: [],
      performance: {
        daily: 0,
        weekly: 0,
        monthly: 0
      }
    },
    message: 'Portfolio mock data - use /wallet page for real data'
  });
});

app.get('/api/wallet/:publicKey/pools', (req, res) => {
  console.log(`🏊 Mock wallet pools request for: ${req.params.publicKey}`);
  res.json({
    success: true,
    data: [],
    message: 'Pools mock data - use /wallet page for real data'
  });
});

app.get('/api/pools/rankings', (req, res) => {
  console.log('🏆 Mock pools rankings request');
  res.json({
    success: true,
    data: [
      {
        id: 'sol-usdc',
        name: 'SOL/USDC',
        apy: 12.5,
        tvl: 1500000,
        volume24h: 2500000,
        protocol: 'Raydium'
      },
      {
        id: 'ray-sol',
        name: 'RAY/SOL', 
        apy: 18.3,
        tvl: 850000,
        volume24h: 1200000,
        protocol: 'Raydium'
      }
    ],
    message: 'Rankings mock data'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'PollsIA Solana Proxy'
  });
});

// Iniciar servidor
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Servidor proxy rodando na porta ${port}`);
  console.log(`📡 Proxy RPC: http://localhost:${port}/api/solana/rpc`);
  console.log(`🔗 Raydium pairs: http://localhost:${port}/api/solana/raydium-pairs`);
  console.log(`❤️  Health check: http://localhost:${port}/health`);
});