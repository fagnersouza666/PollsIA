import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { config } from './config/env';
import { swaggerConfig } from './config/swagger-simple';

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

        // Pools endpoints
        fastify.get('/api/pools/discover', {
            schema: {
                tags: ['Pools'],
                summary: 'Descobrir pools otimizados',
                description: 'Descobre pools de liquidez otimizados baseado em critérios específicos',
                response: {
                    200: {
                        description: 'Pools descobertos com sucesso',
                        type: 'object',
                        properties: {
                            success: { type: 'boolean' },
                            data: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'string' },
                                        tokenA: { type: 'string' },
                                        tokenB: { type: 'string' },
                                        apy: { type: 'number' },
                                        tvl: { type: 'number' },
                                        protocol: { type: 'string' }
                                    }
                                }
                            },
                            timestamp: { type: 'string', format: 'date-time' }
                        }
                    }
                }
            }
        }, async (_request, _reply) => {
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

        // Wallet endpoints
        fastify.post('/api/wallet/connect', {
            schema: {
                tags: ['Wallet'],
                summary: 'Conectar carteira Solana',
                description: 'Conecta uma carteira Solana à plataforma',
                response: {
                    200: {
                        description: 'Carteira conectada com sucesso',
                        type: 'object',
                        properties: {
                            success: { type: 'boolean' },
                            data: {
                                type: 'object',
                                properties: {
                                    publicKey: { type: 'string' },
                                    connected: { type: 'boolean' },
                                    balance: { type: 'number' }
                                }
                            },
                            timestamp: { type: 'string', format: 'date-time' }
                        }
                    }
                }
            }
        }, async (_request, _reply) => {
            return {
                success: true,
                data: {
                    publicKey: 'HM5ZgL6J9fRsrM8fj5dbJtVVq7Bz8J4eW48Caa1hT337',
                    connected: true,
                    balance: 10.5
                },
                timestamp: new Date().toISOString()
            };
        });

        // Analytics endpoints
        fastify.get('/api/analytics/market-overview', {
            schema: {
                tags: ['Analytics'],
                summary: 'Visão geral do mercado DeFi Solana',
                description: 'Fornece uma visão abrangente do estado atual do mercado DeFi na Solana',
                response: {
                    200: {
                        description: 'Visão geral do mercado retornada com sucesso',
                        type: 'object',
                        properties: {
                            success: { type: 'boolean' },
                            data: {
                                type: 'object',
                                properties: {
                                    totalTvl: { type: 'number' },
                                    averageApy: { type: 'number' },
                                    topPools: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                protocol: { type: 'string' },
                                                tvl: { type: 'number' },
                                                pools: { type: 'number' }
                                            }
                                        }
                                    }
                                }
                            },
                            timestamp: { type: 'string', format: 'date-time' }
                        }
                    }
                }
            }
        }, async (_request, _reply) => {
            return {
                success: true,
                data: {
                    totalTvl: 250000000,
                    averageApy: 8.5,
                    topPools: [
                        { protocol: 'Raydium', tvl: 150000000, pools: 450 },
                        { protocol: 'Orca', tvl: 100000000, pools: 320 }
                    ]
                },
                timestamp: new Date().toISOString()
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

        console.log(`🚀 Server running on port ${config.PORT}`);
        console.log(`📚 API Documentation: http://localhost:${config.PORT}/docs`);
        console.log(`🔍 OpenAPI Spec: http://localhost:${config.PORT}/documentation/json`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}

start(); 