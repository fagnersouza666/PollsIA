import { FastifyDynamicSwaggerOptions } from '@fastify/swagger';

export const swaggerConfig: FastifyDynamicSwaggerOptions = {
    openapi: {
        openapi: '3.0.0',
        info: {
            title: 'PollsIA API - Gestão de Pools Solana',
            description: `
# 🚀 PollsIA - API REST para Gestão de Pools Solana

Sistema automatizado de gestão e otimização de pools de liquidez na blockchain Solana, maximizando retornos através de rebalanceamento inteligente e gestão automatizada de posições com dados em tempo real do Raydium DEX.

## ✨ Características Principais

- **🔗 Solana 2.0**: Integração moderna usando \`@solana/rpc\`, \`@solana/keys\`, \`@solana-program/token\`
- **📊 Dados em Tempo Real**: Integração direta com Raydium DEX API (695k+ pools)
- **🤖 Analytics Avançado**: Métricas de performance, análise de riscos e oportunidades
- **👛 Phantom Wallet**: Conexão nativa com carteira Phantom usando APIs modernas
- **⚡ Performance**: WebSockets para atualizações em tempo real

## 🛠️ Stack Tecnológico

- **Backend**: Node.js 20+ + TypeScript + Fastify
- **Blockchain**: Solana 2.0 (mainnet-beta)
- **Banco de Dados**: Supabase (PostgreSQL) + Redis
- **APIs Externas**: Raydium DEX, CoinGecko, Solana RPC

## 🔗 Integrações Principais

| Serviço | URL | Descrição |
|---------|-----|-----------|
| **Raydium DEX** | \`https://api.raydium.io/v2\` | Dados de pools e liquidez |
| **Solana RPC** | \`https://api.mainnet-beta.solana.com\` | Estado da blockchain |
| **CoinGecko** | \`https://api.coingecko.com/api/v3\` | Preços de tokens |

## 📊 Rate Limits

| Grupo de Endpoints | Limite | Janela |
|-------------------|--------|--------|
| \`/api/pools/*\` | 60 req | 1 minuto |
| \`/api/wallet/*\` | 120 req | 1 minuto |
| \`/api/analytics/*\` | 30 req | 1 minuto |
| \`/health\` | Ilimitado | - |

## 🔐 Autenticação

### Versão Atual (v1.0)
- **Status**: API pública (sem autenticação)
- **Uso**: Livre para desenvolvimento e testes

### Versão Futura (v2.0)
- **JWT Bearer Token**: Para operações sensíveis
- **API Key**: Para integrações de terceiros
- **Rate Limiting**: Por usuário/API key

## 🚨 Códigos de Status

| Código | Significado | Quando Ocorre |
|--------|-------------|---------------|
| \`200\` | ✅ Success | Operação bem-sucedida |
| \`400\` | ❌ Bad Request | Parâmetros inválidos ou malformados |
| \`401\` | 🔒 Unauthorized | Token inválido ou expirado |
| \`404\` | 🔍 Not Found | Recurso não encontrado |
| \`429\` | 🚫 Too Many Requests | Rate limit excedido |
| \`500\` | 💥 Internal Server Error | Erro interno do servidor |

## 📖 Guia de Uso Rápido

### 1. Descobrir Pools
\`\`\`bash
GET /api/pools/discover?protocol=raydium&minTvl=1000000&sortBy=apy&limit=10
\`\`\`

### 2. Conectar Carteira
\`\`\`bash
POST /api/wallet/connect
{
  "publicKey": "HM5ZgL6J9fRsrM8fj5dbJtVVq7Bz8J4eW48Caa1hT337",
  "signature": "signature_hash_here"
}
\`\`\`

### 3. Obter Portfólio
\`\`\`bash
GET /api/wallet/HM5ZgL6J9fRsrM8fj5dbJtVVq7Bz8J4eW48Caa1hT337/portfolio
\`\`\`

### 4. Analytics de Mercado
\`\`\`bash
GET /api/analytics/market-overview
\`\`\`

## 🐛 Troubleshooting

### Problemas Comuns
- **Timeout**: Algumas operações podem demorar devido à latência da Solana RPC
- **Pool não encontrado**: Verifique se o poolId está correto
- **Carteira inválida**: Certifique-se que a chave pública é válida (base58)

### Suporte
- **GitHub Issues**: [Reportar problemas](https://github.com/pollsia/api/issues)
- **Documentação**: [Docs completas](https://github.com/pollsia/api/blob/main/API_DOCUMENTATION.md)
      `,
            version: '1.0.0',
            contact: {
                name: 'PollsIA Development Team',
                email: 'dev@pollsia.com',
                url: 'https://github.com/pollsia'
            },
            license: {
                name: 'MIT License',
                url: 'https://opensource.org/licenses/MIT'
            },
            termsOfService: 'https://pollsia.com/terms'
        },
        externalDocs: {
            description: '📚 Documentação Técnica Completa',
            url: 'https://github.com/pollsia/api/blob/main/API_DOCUMENTATION.md'
        },
        servers: [
            {
                url: 'http://localhost:3001',
                description: '🔧 Servidor de Desenvolvimento'
            },
            {
                url: 'https://api-dev.pollsia.com',
                description: '🧪 Servidor de Testes'
            },
            {
                url: 'https://api.pollsia.com',
                description: '🚀 Servidor de Produção'
            }
        ],
        tags: [
            {
                name: 'Pools',
                description: '🏊 Operações com pools de liquidez (Raydium, Orca, Jupiter)',
                externalDocs: {
                    description: 'Documentação sobre Pools de Liquidez',
                    url: 'https://docs.raydium.io/raydium/liquidity-providers'
                }
            },
            {
                name: 'Wallet',
                description: '👛 Gestão de carteiras Solana e portfólios',
                externalDocs: {
                    description: 'Guia Phantom Wallet',
                    url: 'https://docs.phantom.app/developer-powertools/connecting-to-phantom'
                }
            },
            {
                name: 'Analytics',
                description: '📊 Analytics, performance e análise de mercado',
                externalDocs: {
                    description: 'Metodologia de Cálculo de Métricas',
                    url: 'https://github.com/pollsia/api/blob/main/docs/analytics-methodology.md'
                }
            },
            {
                name: 'Health',
                description: '❤️ Status e saúde da API'
            }
        ],
        components: {
            schemas: {
                // Resposta padrão da API
                ApiResponse: {
                    type: 'object',
                    required: ['success', 'timestamp'],
                    properties: {
                        success: {
                            type: 'boolean',
                            description: 'Indica se a operação foi bem-sucedida',
                            example: true
                        },
                        data: {
                            description: 'Dados retornados pela operação (tipo varia por endpoint)'
                        },
                        error: {
                            type: 'string',
                            description: 'Mensagem de erro detalhada, presente apenas quando success=false',
                            example: 'Pool não encontrado ou indisponível'
                        },
                        timestamp: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Timestamp ISO 8601 da resposta',
                            example: '2024-12-21T15:30:45.123Z'
                        }
                    }
                },

                // Pool de liquidez
                Pool: {
                    type: 'object',
                    required: ['id', 'tokenA', 'tokenB', 'apy', 'tvl', 'volume24h', 'protocol'],
                    properties: {
                        id: {
                            type: 'string',
                            description: 'Identificador único do pool',
                            example: 'pool_sol_usdc_001',
                            minLength: 1,
                            maxLength: 100
                        },
                        tokenA: {
                            type: 'string',
                            description: 'Símbolo do primeiro token do par',
                            example: 'SOL',
                            minLength: 1,
                            maxLength: 10
                        },
                        tokenB: {
                            type: 'string',
                            description: 'Símbolo do segundo token do par',
                            example: 'USDC',
                            minLength: 1,
                            maxLength: 10
                        },
                        apy: {
                            type: 'number',
                            format: 'float',
                            description: 'APY anualizado em porcentagem',
                            example: 12.45,
                            minimum: 0,
                            maximum: 1000
                        },
                        tvl: {
                            type: 'number',
                            format: 'float',
                            description: 'Total Value Locked em USD',
                            example: 15000000,
                            minimum: 0
                        },
                        volume24h: {
                            type: 'number',
                            format: 'float',
                            description: 'Volume de trading nas últimas 24 horas em USD',
                            example: 2500000,
                            minimum: 0
                        },
                        protocol: {
                            type: 'string',
                            description: 'Protocolo DEX onde o pool está hospedado',
                            example: 'Raydium',
                            enum: ['Raydium', 'Orca', 'Jupiter', 'Serum']
                        },
                        address: {
                            type: 'string',
                            description: 'Endereço do pool na blockchain Solana',
                            example: 'GmGmZyuWpuNFfgqQLQ7DfGRaLevgvWV8Br4J8RdE6zU4',
                            pattern: '^[1-9A-HJ-NP-Za-km-z]{32,44}$'
                        },
                        fees: {
                            type: 'number',
                            format: 'float',
                            description: 'Taxa de trading em porcentagem',
                            example: 0.25,
                            minimum: 0,
                            maximum: 10
                        },
                        apr: {
                            type: 'number',
                            format: 'float',
                            description: 'APR anualizado em porcentagem (sem compound)',
                            example: 11.80,
                            minimum: 0,
                            maximum: 1000
                        }
                    }
                },

                // Ranking de pools
                PoolRanking: {
                    type: 'object',
                    required: ['rank', 'poolId', 'score', 'apy', 'riskScore', 'liquidityScore'],
                    properties: {
                        rank: {
                            type: 'integer',
                            description: 'Posição no ranking (1 = melhor)',
                            example: 1,
                            minimum: 1
                        },
                        poolId: {
                            type: 'string',
                            description: 'ID do pool rankeado',
                            example: 'pool_sol_usdc_001'
                        },
                        score: {
                            type: 'number',
                            format: 'float',
                            description: 'Score geral calculado (0-100, maior = melhor)',
                            example: 89.5,
                            minimum: 0,
                            maximum: 100
                        },
                        apy: {
                            type: 'number',
                            format: 'float',
                            description: 'APY do pool',
                            example: 12.45
                        },
                        riskScore: {
                            type: 'number',
                            format: 'float',
                            description: 'Score de risco (0-10, menor = menos risco)',
                            example: 3.2,
                            minimum: 0,
                            maximum: 10
                        },
                        liquidityScore: {
                            type: 'number',
                            format: 'float',
                            description: 'Score de liquidez (0-10, maior = melhor liquidez)',
                            example: 9.1,
                            minimum: 0,
                            maximum: 10
                        }
                    }
                },

                // Análise detalhada de pool
                PoolAnalysis: {
                    type: 'object',
                    required: ['poolId', 'impermanentLoss', 'volumeAnalysis', 'riskMetrics'],
                    properties: {
                        poolId: {
                            type: 'string',
                            description: 'ID do pool analisado',
                            example: 'pool_sol_usdc_001'
                        },
                        impermanentLoss: {
                            type: 'object',
                            required: ['current', 'predicted30d', 'historical'],
                            properties: {
                                current: {
                                    type: 'number',
                                    format: 'float',
                                    description: 'Perda impermanente atual em %',
                                    example: -2.3
                                },
                                predicted30d: {
                                    type: 'number',
                                    format: 'float',
                                    description: 'Perda impermanente prevista para 30 dias em %',
                                    example: -5.1
                                },
                                historical: {
                                    type: 'array',
                                    items: {
                                        type: 'number',
                                        format: 'float'
                                    },
                                    description: 'Histórico de IL dos últimos períodos',
                                    example: [-1.2, -2.3, -1.8, -2.9]
                                }
                            }
                        },
                        volumeAnalysis: {
                            type: 'object',
                            required: ['trend', 'volatility', 'prediction24h'],
                            properties: {
                                trend: {
                                    type: 'string',
                                    enum: ['increasing', 'decreasing', 'stable'],
                                    description: 'Tendência do volume de trading',
                                    example: 'increasing'
                                },
                                volatility: {
                                    type: 'string',
                                    enum: ['low', 'medium', 'high'],
                                    description: 'Nível de volatilidade do volume',
                                    example: 'medium'
                                },
                                prediction24h: {
                                    type: 'number',
                                    format: 'float',
                                    description: 'Volume previsto para próximas 24h em USD',
                                    example: 2800000
                                }
                            }
                        },
                        riskMetrics: {
                            type: 'object',
                            required: ['overall', 'liquidityRisk', 'protocolRisk', 'tokenRisk'],
                            properties: {
                                overall: {
                                    type: 'string',
                                    enum: ['low', 'medium', 'high'],
                                    description: 'Avaliação geral de risco',
                                    example: 'medium'
                                },
                                liquidityRisk: {
                                    type: 'string',
                                    enum: ['low', 'medium', 'high'],
                                    description: 'Risco relacionado à liquidez',
                                    example: 'low'
                                },
                                protocolRisk: {
                                    type: 'string',
                                    enum: ['low', 'medium', 'high'],
                                    description: 'Risco do protocolo/plataforma',
                                    example: 'low'
                                },
                                tokenRisk: {
                                    type: 'string',
                                    enum: ['low', 'medium', 'high'],
                                    description: 'Risco dos tokens do par',
                                    example: 'medium'
                                }
                            }
                        }
                    }
                },

                // Conexão de carteira
                WalletConnection: {
                    type: 'object',
                    required: ['publicKey', 'connected', 'balance'],
                    properties: {
                        publicKey: {
                            type: 'string',
                            description: 'Chave pública da carteira conectada',
                            example: 'HM5ZgL6J9fRsrM8fj5dbJtVVq7Bz8J4eW48Caa1hT337',
                            pattern: '^[1-9A-HJ-NP-Za-km-z]{32,44}$'
                        },
                        connected: {
                            type: 'boolean',
                            description: 'Status da conexão',
                            example: true
                        },
                        balance: {
                            type: 'number',
                            format: 'float',
                            description: 'Saldo SOL da carteira',
                            example: 12.456789,
                            minimum: 0
                        }
                    }
                },

                // Portfólio
                Portfolio: {
                    type: 'object',
                    required: ['totalValue', 'solBalance', 'tokenAccounts', 'change24h'],
                    properties: {
                        totalValue: {
                            type: 'number',
                            format: 'float',
                            description: 'Valor total do portfólio em USD',
                            example: 1247.89,
                            minimum: 0
                        },
                        solBalance: {
                            type: 'number',
                            format: 'float',
                            description: 'Saldo nativo SOL',
                            example: 12.456789,
                            minimum: 0
                        },
                        tokenAccounts: {
                            type: 'integer',
                            description: 'Número de contas de token diferentes',
                            example: 8,
                            minimum: 0
                        },
                        change24h: {
                            type: 'number',
                            format: 'float',
                            description: 'Mudança percentual do portfólio em 24h',
                            example: 3.45
                        },
                        performance: {
                            type: 'array',
                            items: {
                                $ref: '#/components/schemas/PerformanceData'
                            },
                            description: 'Dados históricos de performance'
                        }
                    }
                },

                // Posição em pool
                Position: {
                    type: 'object',
                    required: ['poolId', 'tokenA', 'tokenB', 'liquidity', 'value', 'apy', 'entryDate'],
                    properties: {
                        poolId: {
                            type: 'string',
                            description: 'ID do pool da posição',
                            example: 'pool_sol_usdc_001'
                        },
                        tokenA: {
                            type: 'string',
                            description: 'Primeiro token do par',
                            example: 'SOL'
                        },
                        tokenB: {
                            type: 'string',
                            description: 'Segundo token do par',
                            example: 'USDC'
                        },
                        liquidity: {
                            type: 'number',
                            format: 'float',
                            description: 'Quantidade de liquidez fornecida',
                            example: 5000,
                            minimum: 0
                        },
                        value: {
                            type: 'number',
                            format: 'float',
                            description: 'Valor atual da posição em USD',
                            example: 5123.45,
                            minimum: 0
                        },
                        apy: {
                            type: 'number',
                            format: 'float',
                            description: 'APY atual da posição',
                            example: 12.45
                        },
                        entryDate: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Data de entrada na posição',
                            example: '2024-12-15T10:00:00.000Z'
                        },
                        impermanentLoss: {
                            type: 'number',
                            format: 'float',
                            description: 'Perda impermanente atual em %',
                            example: -2.3
                        }
                    }
                },

                // Dados de performance
                PerformanceData: {
                    type: 'object',
                    required: ['date', 'value'],
                    properties: {
                        date: {
                            type: 'string',
                            format: 'date',
                            description: 'Data do ponto de performance',
                            example: '2024-12-20'
                        },
                        value: {
                            type: 'number',
                            format: 'float',
                            description: 'Valor do portfólio na data em USD',
                            example: 1200.45,
                            minimum: 0
                        },
                        change: {
                            type: 'number',
                            format: 'float',
                            description: 'Mudança percentual em relação ao período anterior',
                            example: 2.1
                        }
                    }
                },

                // Visão geral do mercado
                MarketOverview: {
                    type: 'object',
                    required: ['totalTvl', 'averageApy', 'topPools', 'marketTrends'],
                    properties: {
                        totalTvl: {
                            type: 'number',
                            format: 'float',
                            description: 'TVL total agregado do mercado em USD',
                            example: 2500000000,
                            minimum: 0
                        },
                        averageApy: {
                            type: 'number',
                            format: 'float',
                            description: 'APY médio ponderado por TVL',
                            example: 8.75,
                            minimum: 0
                        },
                        topPools: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    protocol: {
                                        type: 'string',
                                        example: 'Raydium'
                                    },
                                    tvl: {
                                        type: 'number',
                                        format: 'float',
                                        example: 1500000000
                                    },
                                    pools: {
                                        type: 'integer',
                                        example: 250
                                    }
                                }
                            },
                            description: 'Top protocolos por TVL'
                        },
                        marketTrends: {
                            type: 'object',
                            required: ['tvlChange24h', 'volumeChange24h', 'newPools24h'],
                            properties: {
                                tvlChange24h: {
                                    type: 'number',
                                    format: 'float',
                                    description: 'Mudança no TVL total em 24h (%)',
                                    example: 2.5
                                },
                                volumeChange24h: {
                                    type: 'number',
                                    format: 'float',
                                    description: 'Mudança no volume total em 24h (%)',
                                    example: -1.2
                                },
                                newPools24h: {
                                    type: 'integer',
                                    description: 'Número de novos pools criados em 24h',
                                    example: 3,
                                    minimum: 0
                                }
                            }
                        }
                    }
                },

                // Oportunidade de investimento
                Opportunity: {
                    type: 'object',
                    required: ['poolId', 'protocol', 'tokenA', 'tokenB', 'estimatedApy', 'riskScore', 'confidence', 'reason'],
                    properties: {
                        poolId: {
                            type: 'string',
                            description: 'ID do pool da oportunidade',
                            example: 'pool_sol_usdc_001'
                        },
                        protocol: {
                            type: 'string',
                            description: 'Protocolo DEX',
                            example: 'Raydium'
                        },
                        tokenA: {
                            type: 'string',
                            description: 'Primeiro token',
                            example: 'SOL'
                        },
                        tokenB: {
                            type: 'string',
                            description: 'Segundo token',
                            example: 'USDC'
                        },
                        estimatedApy: {
                            type: 'number',
                            format: 'float',
                            description: 'APY estimado da oportunidade',
                            example: 12.45,
                            minimum: 0
                        },
                        riskScore: {
                            type: 'number',
                            format: 'float',
                            description: 'Score de risco (0-10)',
                            example: 3.2,
                            minimum: 0,
                            maximum: 10
                        },
                        confidence: {
                            type: 'number',
                            format: 'float',
                            description: 'Confiança na predição (0-1)',
                            example: 0.85,
                            minimum: 0,
                            maximum: 1
                        },
                        reason: {
                            type: 'string',
                            description: 'Razão da oportunidade identificada',
                            example: 'High APY potential + Strong liquidity + Low risk profile'
                        }
                    }
                },

                // Request para conectar carteira
                WalletConnectRequest: {
                    type: 'object',
                    required: ['publicKey', 'signature'],
                    properties: {
                        publicKey: {
                            type: 'string',
                            description: 'Chave pública da carteira Solana (base58)',
                            example: 'HM5ZgL6J9fRsrM8fj5dbJtVVq7Bz8J4eW48Caa1hT337',
                            pattern: '^[1-9A-HJ-NP-Za-km-z]{32,44}$'
                        },
                        signature: {
                            type: 'string',
                            description: 'Assinatura da mensagem de autenticação',
                            example: '3yZe7d4xKrEnc8TKvKKKjdjjdjdj...',
                            minLength: 64
                        }
                    }
                },

                // Schema de erro padrão
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
                            description: 'Mensagem de erro detalhada',
                            example: 'Pool não encontrado ou indisponível'
                        },
                        timestamp: {
                            type: 'string',
                            format: 'date-time',
                            example: '2024-12-21T15:30:45.123Z'
                        }
                    }
                }
            },

            // Esquemas de segurança para futuras versões
            securitySchemes: {
                ApiKeyAuth: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'X-API-Key',
                    description: 'Chave de API para autenticação (em desenvolvimento)'
                },
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Token JWT para autenticação (em desenvolvimento)'
                }
            },

            // Respostas padrão reutilizáveis
            responses: {
                NotFound: {
                    description: '🔍 Recurso não encontrado',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            }
                        }
                    }
                },
                BadRequest: {
                    description: '❌ Requisição inválida',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            }
                        }
                    }
                },
                Unauthorized: {
                    description: '🔒 Não autorizado',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            }
                        }
                    }
                },
                TooManyRequests: {
                    description: '🚫 Muitas requisições',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            }
                        }
                    }
                },
                InternalServerError: {
                    description: '💥 Erro interno do servidor',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            }
                        }
                    }
                }
            }
        }
    },
    hideUntagged: true
};

export const swaggerUiConfig = {
    routePrefix: '/docs',
    uiConfig: {
        docExpansion: 'list' as const,
        deepLinking: true,
        defaultModelsExpandDepth: 2,
        defaultModelExpandDepth: 2,
        displayOperationId: true,
        displayRequestDuration: true,
        filter: true,
        showExtensions: true,
        showCommonExtensions: true,
        tryItOutEnabled: true,
        supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
        validatorUrl: null
    },
    uiHooks: {
        onRequest: function (request: any, reply: any, next: any) {
            next();
        },
        preHandler: function (request: any, reply: any, next: any) {
            next();
        }
    },
    staticCSP: true,
    transformStaticCSP: (header: string) => header,
    transformSpecification: (swaggerObject: any, _request: any, _reply: any) => {
        return swaggerObject;
    },
    transformSpecificationClone: true
}; 