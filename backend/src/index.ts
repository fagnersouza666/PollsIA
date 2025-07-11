import 'reflect-metadata';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { config } from './config/env';
import { swaggerConfig } from './config/swagger-simple';
import { poolRoutes } from './presentation/routes/pool.routes';
import solanaRoutes from './presentation/routes/solana.routes';
import { walletRoutes } from './routes/wallet';
import { analyticsRoutes } from './routes/analytics';
import { investmentRoutes } from './routes/investment';
import { errorHandler } from './middleware/errorHandler';
import { RedisCache } from './utils/RedisCache';
import { connectionPool } from './utils/ConnectionPool';
import { container } from './shared/container';
import { TYPES } from './shared/types';
import { Logger } from './shared/interfaces/logger.interface';

const fastify = Fastify({
  logger: true
});

const logger = container.get<Logger>(TYPES.Logger);

// Flag para controlar se o shutdown já foi iniciado
let isShuttingDown = false;

async function start() {
  try {
    // Initialize logger from DI container
    logger.info('🚀 Starting PollsIA Backend Server...');

    // Inicializar Redis Cache (não bloquear se falhar)
    logger.info('🔄 Inicializando Redis cache...');
    try {
      await RedisCache.getInstance().connect();
      logger.info('✅ Redis cache conectado');
    } catch (error) {
      logger.warn('⚠️ Continuando sem Redis cache', error as Error);
    }

    // Register error handler
    fastify.setErrorHandler(errorHandler);

    // Register Swagger documentation
    await fastify.register(swagger, swaggerConfig);

    // Register Swagger UI
    await fastify.register(swaggerUi, {
      routePrefix: '/docs'
    });

    await fastify.register(cors, {
      origin: [config.FRONTEND_URL, 'http://localhost:3000'],
      credentials: true
    });

    // Register routes
    await fastify.register(poolRoutes, { prefix: '/api/pools' });
    await fastify.register(solanaRoutes, { prefix: '/api/solana' });
    await fastify.register(walletRoutes, { prefix: '/api/wallet' });
    await fastify.register(analyticsRoutes, { prefix: '/api/analytics' });
    await fastify.register(investmentRoutes, { prefix: '/api/investment' });

    fastify.get('/health', {
      schema: {
        tags: ['Health'],
        summary: 'Verificar status da API',
        description: 'Endpoint para verificar se a API está funcionando corretamente e obter informações do sistema',
        response: {
          200: {
            description: 'API funcionando corretamente',
            type: 'object',
            properties: {
              status: {
                type: 'string',
                example: 'ok',
                description: 'Status da API'
              },
              timestamp: {
                type: 'string',
                format: 'date-time',
                description: 'Timestamp da verificação'
              },
              version: {
                type: 'string',
                example: '1.0.0',
                description: 'Versão da API'
              },
              uptime: {
                type: 'number',
                example: 3600,
                description: 'Tempo de atividade em segundos'
              }
            }
          }
        }
      }
    }, async (_request, _reply) => {
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        uptime: process.uptime()
      };
    });

    // Redirect root to docs
    fastify.get('/', async (_request, reply) => {
      return reply.redirect('/docs');
    });

    await fastify.listen({
      port: config.PORT,
      host: '0.0.0.0'
    });

    logger.info(`🚀 Server running on port ${config.PORT}`);
    logger.info(`📚 API Documentation: http://localhost:${config.PORT}/docs`);
    logger.info(`🔍 OpenAPI Spec: http://localhost:${config.PORT}/documentation/json`);
  } catch (err) {
    logger.error('Failed to start server', err as Error);
    process.exit(1);
  }
}

const redisInstance = RedisCache.getInstance();

async function closeGracefully(signal: NodeJS.Signals) {
  if (isShuttingDown) {
    logger.info('⚠️ Shutdown already in progress, ignoring signal');
    return;
  }

  isShuttingDown = true;
  logger.info(`*️⃣ Received signal: ${signal}. Shutting down gracefully...`);

  // Timeout para forçar saída se demorar muito
  const shutdownTimeout = setTimeout(() => {
    logger.error('❌ Graceful shutdown timeout. Forcing exit...');
    process.exit(1);
  }, 3000); // 3 segundos

  try {
    // Close Fastify server
    logger.info('🔄 Closing Fastify server...');
    await fastify.close();
    logger.info('✅ Fastify server closed.');

    // Disconnect Redis
    logger.info('🔄 Closing Redis connection...');
    await redisInstance.disconnect();
    logger.info('✅ Redis connection closed.');

    // Shutdown connection pools
    logger.info('🔄 Shutting down connection pools...');
    connectionPool.shutdown();
    logger.info('✅ Connection pools shut down.');

    // Clear timeout
    clearTimeout(shutdownTimeout);

    logger.info('✅ Graceful shutdown completed successfully');

    // Force exit to ensure process terminates
    process.exit(0);
  } catch (err) {
    logger.error('❌ Error during graceful shutdown', err as Error);
    clearTimeout(shutdownTimeout);
    process.exit(1);
  }
}

// Graceful shutdown listeners
process.on('SIGINT', closeGracefully);
process.on('SIGTERM', closeGracefully);

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  closeGracefully('SIGTERM');
});

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  closeGracefully('SIGTERM');
});

start();