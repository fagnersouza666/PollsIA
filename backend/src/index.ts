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
import { redisCache } from './utils/RedisCache';
import { container } from './shared/container';
import { TYPES } from './shared/types';
import { Logger } from './shared/interfaces/logger.interface';

const fastify = Fastify({
  logger: true
});

const logger = container.get<Logger>(TYPES.Logger);

async function start() {
  try {
    // Initialize logger from DI container
    logger.info('🚀 Starting PollsIA Backend Server...');

    // Inicializar Redis Cache (não bloquear se falhar)
    logger.info('🔄 Inicializando Redis cache...');
    try {
      await redisCache.connect();
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

const redisInstance = redisCache.getInstance();

async function closeGracefully(signal: NodeJS.Signals) {
  logger.info(`*️⃣ Received signal: ${signal}. Shutting down gracefully...`);

  try {
    // Close Fastify server
    await fastify.close();
    logger.info('✅ Fastify server closed.');

    // Disconnect Redis
    await redisInstance.disconnect();
    logger.info('✅ Redis connection closed.');

    process.exit(0);
  } catch (err) {
    logger.error('Error during graceful shutdown', err as Error);
    process.exit(1);
  }
}

// Graceful shutdown listeners
process.on('SIGINT', closeGracefully);
process.on('SIGTERM', closeGracefully);

start();