const fastify = require('fastify')({ logger: true });

// Registrar CORS
fastify.register(require('@fastify/cors'), {
  origin: ['http://localhost:3000'],
  credentials: true
});

// Log de todas as requisições
fastify.addHook('preHandler', async (request, reply) => {
  console.log(`${request.method} ${request.url}`);
});

// Health endpoint
fastify.get('/health', async (request, reply) => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: process.uptime()
  };
});

// Pools endpoints
fastify.get('/api/pools/discover', async (request, reply) => {
  return {
    success: true,
    data: [
      {
        id: 'pool_sol_usdc_001',
        tokenA: 'SOL',
        tokenB: 'USDC',
        apy: 12.5,
        tvl: 1500000,
        protocol: 'Raydium'
      }
    ],
    timestamp: new Date().toISOString()
  };
});

// Test wallet endpoint
fastify.get('/api/wallet/:publicKey/portfolio', async (request, reply) => {
  console.log('Portfolio request for:', request.params.publicKey);
  return {
    success: true,
    data: {
      publicKey: request.params.publicKey,
      totalValue: 15420.50,
      totalPnl: 1420.50,
      pnlPercentage: 10.15,
      positions: 3
    },
    timestamp: new Date().toISOString()
  };
});

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: '0.0.0.0' });
    console.log('🚀 Simple debug server running on port 3001');
    console.log('📊 Health check: http://localhost:3001/health');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();