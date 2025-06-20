import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from './config/env';
import { poolRoutes } from './routes/pools';
import { walletRoutes } from './routes/wallet';
import { analyticsRoutes } from './routes/analytics';
import { errorHandler } from './middleware/errorHandler';

const fastify = Fastify({
  logger: true
});

async function start() {
  try {
    // Register error handler
    fastify.setErrorHandler(errorHandler);

    await fastify.register(cors, {
      origin: [config.FRONTEND_URL],
      credentials: true
    });

    await fastify.register(poolRoutes, { prefix: '/api/pools' });
    await fastify.register(walletRoutes, { prefix: '/api/wallet' });
    await fastify.register(analyticsRoutes, { prefix: '/api/analytics' });

    fastify.get('/health', async (_request, _reply) => {
      return { status: 'ok', timestamp: new Date().toISOString() };
    });

    await fastify.listen({ 
      port: config.PORT, 
      host: '0.0.0.0' 
    });
    
    console.log(`🚀 Server running on port ${config.PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();