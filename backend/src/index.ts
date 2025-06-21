import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
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

    // Register Swagger documentation
    await fastify.register(swagger, {
      openapi: {
        openapi: '3.0.0',
        info: {
          title: 'PollsIA API',
          description: 'API REST para sistema automatizado de gestão de pools de liquidez na blockchain Solana',
          version: '1.0.0',
          contact: {
            name: 'PollsIA Team',
            email: 'contato@pollsia.com'
          },
          license: {
            name: 'MIT',
            url: 'https://opensource.org/licenses/MIT'
          }
        },
        servers: [
          {
            url: 'http://localhost:3001',
            description: 'Servidor de desenvolvimento'
          },
          {
            url: 'https://api.pollsia.com',
            description: 'Servidor de produção'
          }
        ],
        tags: [
          {
            name: 'Pools',
            description: 'Operações relacionadas a pools de liquidez'
          },
          {
            name: 'Wallet',
            description: 'Operações de carteira Solana'
          },
          {
            name: 'Analytics',
            description: 'Analytics e métricas de performance'
          },
          {
            name: 'Health',
            description: 'Status e saúde da API'
          }
        ],
        components: {
          schemas: {
            ApiResponse: {
              type: 'object',
              required: ['success', 'timestamp'],
              properties: {
                success: {
                  type: 'boolean',
                  description: 'Indica se a operação foi bem-sucedida'
                },
                data: {
                  description: 'Dados retornados pela operação'
                },
                error: {
                  type: 'string',
                  description: 'Mensagem de erro, se houver'
                },
                timestamp: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Timestamp da resposta'
                }
              }
            },
            Pool: {
              type: 'object',
              required: ['id', 'tokenA', 'tokenB', 'apy', 'tvl', 'volume24h', 'protocol'],
              properties: {
                id: {
                  type: 'string',
                  description: 'ID único do pool'
                },
                tokenA: {
                  type: 'string',
                  description: 'Símbolo do primeiro token'
                },
                tokenB: {
                  type: 'string',
                  description: 'Símbolo do segundo token'
                },
                apy: {
                  type: 'number',
                  format: 'float',
                  description: 'APY anualizado (%)'
                },
                tvl: {
                  type: 'number',
                  format: 'float',
                  description: 'Total Value Locked (USD)'
                },
                volume24h: {
                  type: 'number',
                  format: 'float',
                  description: 'Volume 24h (USD)'
                },
                protocol: {
                  type: 'string',
                  description: 'Protocolo DEX'
                },
                address: {
                  type: 'string',
                  description: 'Endereço do pool na blockchain'
                },
                fees: {
                  type: 'number',
                  format: 'float',
                  description: 'Taxa de trading (%)'
                },
                apr: {
                  type: 'number',
                  format: 'float',
                  description: 'APR anualizado (%)'
                }
              }
            },
            Portfolio: {
              type: 'object',
              required: ['totalValue', 'solBalance', 'tokenAccounts', 'change24h'],
              properties: {
                totalValue: {
                  type: 'number',
                  format: 'float',
                  description: 'Valor total em USD'
                },
                solBalance: {
                  type: 'number',
                  format: 'float',
                  description: 'Saldo SOL'
                },
                tokenAccounts: {
                  type: 'integer',
                  description: 'Número de contas de token'
                },
                change24h: {
                  type: 'number',
                  format: 'float',
                  description: 'Mudança 24h (%)'
                },
                performance: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/PerformanceData'
                  }
                }
              }
            },
            WalletConnection: {
              type: 'object',
              required: ['publicKey', 'connected', 'balance'],
              properties: {
                publicKey: {
                  type: 'string',
                  description: 'Chave pública da carteira'
                },
                connected: {
                  type: 'boolean',
                  description: 'Status da conexão'
                },
                balance: {
                  type: 'number',
                  format: 'float',
                  description: 'Saldo SOL'
                }
              }
            },
            PerformanceData: {
              type: 'object',
              properties: {
                date: {
                  type: 'string',
                  format: 'date'
                },
                value: {
                  type: 'number',
                  format: 'float'
                },
                change: {
                  type: 'number',
                  format: 'float'
                }
              }
            },
            Error: {
              type: 'object',
              required: ['success', 'error', 'timestamp'],
              properties: {
                success: {
                  type: 'boolean',
                  example: false
                },
                error: {
                  type: 'string',
                  description: 'Mensagem de erro'
                },
                timestamp: {
                  type: 'string',
                  format: 'date-time'
                }
              }
            }
          },
          securitySchemes: {
            ApiKeyAuth: {
              type: 'apiKey',
              in: 'header',
              name: 'X-API-Key'
            }
          }
        }
      },
      hideUntagged: true,
      exposeRoute: true
    });

    // Register Swagger UI
    await fastify.register(swaggerUi, {
      routePrefix: '/docs',
      uiConfig: {
        docExpansion: 'list',
        deepLinking: false
      },
      staticCSP: true,
      transformStaticCSP: (header) => header,
      transformSpecification: (swaggerObject) => {
        return swaggerObject;
      },
      transformSpecificationClone: true
    });

    await fastify.register(cors, {
      origin: [config.FRONTEND_URL],
      credentials: true
    });

    await fastify.register(poolRoutes, { prefix: '/api/pools' });
    await fastify.register(walletRoutes, { prefix: '/api/wallet' });
    await fastify.register(analyticsRoutes, { prefix: '/api/analytics' });

    fastify.get('/health', {
      schema: {
        tags: ['Health'],
        summary: 'Verificar status da API',
        description: 'Endpoint para verificar se a API está funcionando corretamente',
        response: {
          200: {
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
              }
            }
          }
        }
      }
    }, async (_request, _reply) => {
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