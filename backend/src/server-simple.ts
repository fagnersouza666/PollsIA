import 'reflect-metadata';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { container } from './shared/container';
import { TYPES } from './shared/types';
import { Logger } from './shared/interfaces/logger.interface';
import { poolRoutes } from './presentation/routes/pool.routes';

const fastify = Fastify({
  logger: true
});

async function start() {
  try {
    // Initialize logger from DI container
    const logger = container.get<Logger>(TYPES.Logger);
    logger.info('🚀 Starting PollsIA Backend Server (Simple Mode)...');
    
    // Register CORS
    await fastify.register(cors, {
      origin: ['http://localhost:3000', 'http://localhost:3001'],
      credentials: true
    });

    // Register routes
    await fastify.register(poolRoutes, { prefix: '/api/pools' });

    // Health check
    fastify.get('/health', async (_request, _reply) => {
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        uptime: process.uptime(),
        mode: 'simple'
      };
    });

    // Redirect root to health
    fastify.get('/', async (_request, reply) => {
      return reply.redirect('/health');
    });

    const port = parseInt(process.env.PORT || '3001');
    await fastify.listen({
      port,
      host: '0.0.0.0'
    });

    logger.info(`🚀 Server running on port ${port}`);
    logger.info(`🔍 Health check: http://localhost:${port}/health`);
    logger.info(`📊 Pools API: http://localhost:${port}/api/pools`);
  } catch (err) {
    const logger = container.get<Logger>(TYPES.Logger);
    logger.error('Failed to start server', err as Error);
    process.exit(1);
  }
}

start();