import Fastify from 'fastify';
import cors from '@fastify/cors';

const fastify = Fastify({
  logger: true
});

async function start() {
  try {
    await fastify.register(cors, {
      origin: ['http://localhost:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    });

    // Health check simples
    fastify.get('/health', async () => {
      return { 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        message: 'Servidor funcionando'
      };
    });

    // Teste pools discovery sem dependências
    fastify.get('/api/pools/discover', async () => {
      try {
        return {
          success: true,
          data: [
            {
              id: 'test-pool-1',
              name: 'SOL/USDC',
              protocol: 'Raydium',
              tvl: 1000000,
              apy: 15.5,
              volume24h: 500000
            },
            {
              id: 'test-pool-2', 
              name: 'RAY/SOL',
              protocol: 'Raydium',
              tvl: 800000,
              apy: 22.3,
              volume24h: 300000
            }
          ],
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        fastify.log.error('Erro em pools discovery:', error);
        return {
          success: false,
          error: 'Erro interno do servidor',
          timestamp: new Date().toISOString()
        };
      }
    });

    await fastify.listen({ port: 3001, host: '0.0.0.0' });
    console.log('🚀 Test server running on port 3001');
    console.log('📍 Health: http://localhost:3001/health');
    console.log('📍 Pools: http://localhost:3001/api/pools/discover');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();