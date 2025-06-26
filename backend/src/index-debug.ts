import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from './config/env';
import { errorHandler } from './middleware/errorHandler';

const fastify = Fastify({
  logger: true
});

async function start() {
  try {
    console.log('🚀 Iniciando servidor debug...');
    
    // Register error handler
    fastify.setErrorHandler(errorHandler);

    // Register CORS
    await fastify.register(cors, {
      origin: [config.FRONTEND_URL, 'http://localhost:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    });

    // Health check
    fastify.get('/health', async () => {
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        uptime: process.uptime()
      };
    });

    // Carregar rotas gradualmente
    try {
      console.log('📚 Carregando rotas de pools...');
      const { poolRoutes } = await import('./routes/pools');
      await fastify.register(poolRoutes, { prefix: '/api/pools' });
      console.log('✅ Rotas de pools carregadas');
    } catch (error) {
      console.error('❌ Erro ao carregar rotas de pools:', error);
    }

    try {
      console.log('👤 Carregando rotas de wallet...');
      const { walletRoutes } = await import('./routes/wallet');
      await fastify.register(walletRoutes, { prefix: '/api/wallet' });
      console.log('✅ Rotas de wallet carregadas');
    } catch (error) {
      console.error('❌ Erro ao carregar rotas de wallet:', error);
    }

    try {
      console.log('📊 Carregando rotas de analytics...');
      const { analyticsRoutes } = await import('./routes/analytics');
      await fastify.register(analyticsRoutes, { prefix: '/api/analytics' });
      console.log('✅ Rotas de analytics carregadas');
    } catch (error) {
      console.error('❌ Erro ao carregar rotas de analytics:', error);
    }

    // Start server
    await fastify.listen({ port: config.PORT, host: '0.0.0.0' });
    console.log(`🚀 Servidor rodando na porta ${config.PORT}`);
    console.log(`📍 Health check: http://localhost:${config.PORT}/health`);
    console.log(`🔍 API Base: http://localhost:${config.PORT}/api`);
  } catch (err) {
    console.error('❌ Erro fatal ao iniciar servidor:', err);
    fastify.log.error(err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down gracefully...');
  await fastify.close();
  process.exit(0);
});

start();