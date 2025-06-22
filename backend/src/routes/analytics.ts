import { FastifyPluginAsync } from 'fastify';
import { AnalyticsService } from '../services/AnalyticsService';
import { performanceQuerySchema, opportunitiesQuerySchema } from '../schemas/analytics';
import { ApiResponse } from '../types/pool';
import { PerformanceData, MarketOverview, Opportunity } from '../types/analytics';

export const analyticsRoutes: FastifyPluginAsync = async (fastify) => {
  const analyticsService = new AnalyticsService();

  fastify.get<{
    Params: any;
    Querystring: any;
    Reply: ApiResponse<PerformanceData>;
  }>('/performance/:publicKey', {
    schema: {
      params: {
        type: 'object',
        required: ['publicKey'],
        properties: {
          publicKey: { type: 'string', minLength: 32, maxLength: 50 }
        }
      },
      querystring: {
        type: 'object',
        properties: {
          timeframe: { type: 'string', enum: ['7d', '30d', '90d', '1y'] }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
            timestamp: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const params = { publicKey: (request.params as any).publicKey };
      const query = performanceQuerySchema.parse(request.query);
      const performance = await analyticsService.getPerformance(params.publicKey, query.timeframe);
      return {
        success: true,
        data: performance,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      fastify.log.error('Performance analytics error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to get performance data',
        timestamp: new Date().toISOString()
      });
    }
  });

  fastify.get<{
    Reply: ApiResponse<MarketOverview>;
  }>('/market-overview', {
    schema: {
      tags: ['Analytics'],
      summary: 'Visão geral do mercado DeFi Solana',
      description: `
Fornece uma visão abrangente do estado atual do mercado DeFi na Solana.

### Métricas Incluídas

#### 1. TVL Global
- **Total**: TVL agregado de todos os protocolos
- **Distribuição**: TVL por protocolo (Raydium, Orca, etc.)
- **Tendência**: Mudança nas últimas 24h/7d/30d
- **Comparação**: vs outras blockchains

#### 2. Volume de Trading
- **24h**: Volume total nas últimas 24 horas
- **Tendência**: Crescimento/declínio
- **Top Pares**: Pares mais negociados
- **Distribuição**: Volume por DEX

#### 3. APY Médio
- **Geral**: APY médio ponderado por TVL
- **Por Protocolo**: APY médio de cada DEX
- **Faixas**: Distribuição de APYs
- **Histórico**: Evolução dos APYs

#### 4. Novos Pools
- **24h**: Pools criados nas últimas 24h
- **Qualidade**: Análise dos novos pools
- **Tendências**: Tipos de tokens em alta
- **Alertas**: Pools suspeitos ou arriscados

#### 5. Indicadores de Mercado
- **Fear & Greed**: Índice de sentimento
- **Volatilidade**: Volatilidade média do mercado
- **Correlações**: Correlação entre principais tokens
- **Liquidez**: Profundidade média dos pools

### Atualização
Dados atualizados a cada 10 minutos com informações em tempo real.
      `,
      response: {
        200: {
          description: 'Visão geral do mercado retornada com sucesso',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { $ref: '#/components/schemas/MarketOverview' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        },
        500: { $ref: '#/components/responses/InternalServerError' }
      }
    }
  }, async (request, reply) => {
    try {
      const overview = await analyticsService.getMarketOverview();
      return {
        success: true,
        data: overview,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      fastify.log.error('Market overview error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Erro ao obter visão geral do mercado',
        timestamp: new Date().toISOString()
      });
    }
  });

  fastify.get<{
    Querystring: any;
    Reply: ApiResponse<Opportunity[]>;
  }>('/opportunities', {
    schema: {
      tags: ['Analytics'],
      summary: 'Identificar oportunidades de investimento',
      description: `
Identifica oportunidades de investimento baseado em análise algorítmica avançada.

### Algoritmo de Identificação

#### 1. Análise Técnica
- **Momentum**: Identificação de tendências
- **Support/Resistance**: Níveis técnicos
- **Volume Profile**: Análise de volume
- **RSI/MACD**: Indicadores técnicos

#### 2. Análise Fundamental
- **Tokenomics**: Análise da economia do token
- **Desenvolvimento**: Atividade no GitHub
- **Adoção**: Crescimento de usuários
- **Partnerships**: Parcerias estratégicas

#### 3. Análise de Risco-Retorno
- **Sharpe Ratio**: Retorno ajustado ao risco
- **Sortino Ratio**: Foco no downside risk
- **Maximum Drawdown**: Maior perda histórica
- **Value at Risk**: VaR 95%

#### 4. Análise de Liquidez
- **Depth**: Profundidade do order book
- **Spread**: Bid-ask spread
- **Slippage**: Impacto de grandes ordens
- **Stability**: Estabilidade da liquidez

### Tipos de Oportunidades
- **High Yield**: APY > 15% com risco médio
- **Low Risk**: APY > 5% com baixo risco
- **Arbitrage**: Diferenças de preço entre DEXs
- **New Listings**: Novos tokens promissores
- **Undervalued**: Tokens subvalorizados

### Filtros Disponíveis
- **riskLevel**: Nível de risco tolerado
- **minApy**: APY mínimo esperado
- **timeframe**: Horizonte de investimento
- **amount**: Valor a ser investido
- **strategy**: Estratégia preferida
      `,
      querystring: {
        type: 'object',
        properties: {
          riskLevel: {
            type: 'string',
            enum: ['low', 'medium', 'high', 'all'],
            description: 'Nível de risco tolerado',
            default: 'medium'
          },
          minApy: {
            type: 'number',
            minimum: 0,
            maximum: 1000,
            description: 'APY mínimo esperado (%)',
            default: 5
          },
          timeframe: {
            type: 'string',
            enum: ['short', 'medium', 'long'],
            description: 'Horizonte de investimento',
            default: 'medium'
          },
          amount: {
            type: 'number',
            minimum: 1,
            description: 'Valor a ser investido (USD)',
            example: 1000
          },
          strategy: {
            type: 'string',
            enum: ['conservative', 'balanced', 'aggressive', 'yield-farming'],
            description: 'Estratégia de investimento',
            default: 'balanced'
          },
          limit: {
            type: 'integer',
            minimum: 1,
            maximum: 20,
            description: 'Número máximo de oportunidades',
            default: 10
          }
        }
      },
      response: {
        200: {
          description: 'Oportunidades identificadas com sucesso',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/Opportunity' }
            },
            timestamp: { type: 'string', format: 'date-time' }
          }
        },
        400: { $ref: '#/components/responses/BadRequest' },
        500: { $ref: '#/components/responses/InternalServerError' }
      }
    }
  }, async (request, reply) => {
    try {
      const opportunities = await analyticsService.getOpportunities(request.query as any);
      return {
        success: true,
        data: opportunities,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      fastify.log.error('Opportunities error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Erro ao identificar oportunidades',
        timestamp: new Date().toISOString()
      });
    }
  });

  fastify.get<{
    Querystring: any;
    Reply: ApiResponse<any>;
  }>('/performance', {
    schema: {
      tags: ['Analytics'],
      summary: 'Análise de performance histórica',
      description: `
Fornece análise detalhada da performance histórica do mercado e estratégias.

### Análises Disponíveis

#### 1. Performance por Estratégia
- **Conservative**: Pools de baixo risco
- **Balanced**: Mix de risco/retorno
- **Aggressive**: High yield pools
- **Yield Farming**: Estratégias complexas

#### 2. Performance por Protocolo
- **Raydium**: Análise específica do Raydium
- **Orca**: Performance do Orca
- **Jupiter**: Dados do Jupiter
- **Comparação**: Ranking entre protocolos

#### 3. Performance por Token
- **SOL**: Performance do Solana
- **USDC**: Estabilidade do USDC
- **Majors**: Principais tokens
- **Correlações**: Matriz de correlação

#### 4. Análise Temporal
- **Intraday**: Performance intraday
- **Semanal**: Análise semanal
- **Mensal**: Tendências mensais
- **Anual**: Performance anualizada

#### 5. Métricas de Risco
- **Volatilidade**: Histórico de volatilidade
- **Drawdowns**: Períodos de perda
- **Recovery**: Tempo de recuperação
- **Stress Tests**: Cenários extremos

### Períodos Disponíveis
- **24h**: Últimas 24 horas
- **7d**: Última semana
- **30d**: Último mês
- **90d**: Últimos 3 meses
- **1y**: Último ano
- **all**: Histórico completo

### Comparações
- **vs SOL**: Performance vs holding SOL
- **vs USDC**: Performance vs USDC
- **vs Market**: Performance vs mercado geral
- **vs Strategy**: Comparação entre estratégias
      `,
      querystring: {
        type: 'object',
        properties: {
          period: {
            type: 'string',
            enum: ['24h', '7d', '30d', '90d', '1y', 'all'],
            description: 'Período de análise',
            default: '30d'
          },
          strategy: {
            type: 'string',
            enum: ['conservative', 'balanced', 'aggressive', 'yield-farming', 'all'],
            description: 'Estratégia específica ou todas',
            default: 'all'
          },
          protocol: {
            type: 'string',
            enum: ['raydium', 'orca', 'jupiter', 'all'],
            description: 'Protocolo específico ou todos',
            default: 'all'
          },
          benchmark: {
            type: 'string',
            enum: ['sol', 'usdc', 'market', 'none'],
            description: 'Benchmark para comparação',
            default: 'sol'
          },
          includeRisk: {
            type: 'boolean',
            description: 'Incluir métricas de risco detalhadas',
            default: true
          }
        }
      },
      response: {
        200: {
          description: 'Análise de performance retornada com sucesso',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                period: { type: 'string', example: '30d' },
                totalReturn: { type: 'number', example: 12.5 },
                annualizedReturn: { type: 'number', example: 150.0 },
                volatility: { type: 'number', example: 25.3 },
                sharpeRatio: { type: 'number', example: 1.85 },
                maxDrawdown: { type: 'number', example: -8.2 },
                winRate: { type: 'number', example: 68.5 },
                benchmark: {
                  type: 'object',
                  properties: {
                    name: { type: 'string', example: 'SOL' },
                    return: { type: 'number', example: 8.3 },
                    outperformance: { type: 'number', example: 4.2 }
                  }
                },
                byStrategy: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      strategy: { type: 'string', example: 'conservative' },
                      return: { type: 'number', example: 8.5 },
                      risk: { type: 'number', example: 15.2 },
                      sharpe: { type: 'number', example: 1.25 }
                    }
                  }
                }
              }
            },
            timestamp: { type: 'string', format: 'date-time' }
          }
        },
        400: { $ref: '#/components/responses/BadRequest' },
        500: { $ref: '#/components/responses/InternalServerError' }
      }
    }
  }, async (request, reply) => {
    try {
      const performance = await analyticsService.getPerformance('default', '30d');
      return {
        success: true,
        data: performance,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      fastify.log.error('Performance analysis error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Erro ao analisar performance',
        timestamp: new Date().toISOString()
      });
    }
  });
};