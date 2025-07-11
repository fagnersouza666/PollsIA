import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { config } from './config/env';
import { swaggerConfig } from './config/swagger-simple';
import { poolRoutes } from './routes/pools';
import { walletRoutes } from './routes/wallet';
import { analyticsRoutes } from './routes/analytics';

const fastify = Fastify({
    logger: true
});

async function start() {
    try {
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

        // Health endpoint
        fastify.get('/health', {
            schema: {
                tags: ['Health'],
                summary: 'Verificar status da API',
                description: 'Endpoint para verificar se a API está funcionando corretamente',
                response: {
                    200: {
                        description: 'API funcionando corretamente',
                        type: 'object',
                        properties: {
                            status: { type: 'string' },
                            timestamp: { type: 'string', format: 'date-time' },
                            version: { type: 'string' },
                            uptime: { type: 'number' }
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

        // Remove mock routes
        // fastify.get('/api/pools/discover', ... );
        // fastify.post('/api/wallet/connect', ... );
        // fastify.get('/api/analytics/market-overview', ... );

        // Register full routes
        await fastify.register(poolRoutes, { prefix: '/api/pools' });
        await fastify.register(walletRoutes, { prefix: '/api/wallet' });
        await fastify.register(analyticsRoutes, { prefix: '/api/analytics' });

        // Redirect root to docs
        fastify.get('/', async (_request, reply) => {
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