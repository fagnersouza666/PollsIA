import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { config } from './config/env';
import { swaggerConfig } from './config/swagger-simple';
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

    await fastify.register(poolRoutes, { prefix: '/api/pools' });
    await fastify.register(walletRoutes, { prefix: '/api/wallet' });
    await fastify.register(analyticsRoutes, { prefix: '/api/analytics' });

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
    }, async (request, reply) => {
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        uptime: process.uptime()
      };
    });

    // Redirect root to docs
    fastify.get('/', async (request, reply) => {
      return reply.redirect('/docs');
    });

    await fastify.listen({
      port: config.PORT,
      host: '0.0.0.0'
    });

    console.log(`🚀 Server running on port ${config.PORT}`);
    console.log(`📚 API Documentation: http://localhost:${config.PORT}/docs`);
    console.log(`🔍 OpenAPI Spec: http://localhost:${config.PORT}/documentation/json`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();