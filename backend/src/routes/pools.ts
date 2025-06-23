import { FastifyPluginAsync } from 'fastify';
import { PoolService } from '../services/PoolService';
import { poolIdSchema, poolDiscoveryQuerySchema, poolAnalysisQuerySchema } from '../schemas/pool';
import { ApiResponse, Pool, PoolRanking, PoolAnalysis } from '../types/pool';

export const poolRoutes: FastifyPluginAsync = async (fastify) => {
  const poolService = new PoolService();

  // Descobrir pools otimizados
  fastify.get<{
    Querystring: any;
    Reply: ApiResponse<Pool[]>;
  }>('/discover', {
    schema: {
      tags: ['Pools'],
      summary: 'Descobrir pools otimizados',
      description: `
Descobre pools de liquidez otimizados baseado em critérios específicos.

### Algoritmo de Descoberta
O algoritmo considera múltiplos fatores:
- **APY**: Retorno anualizado histórico e projetado
- **TVL**: Liquidez total bloqueada
- **Volume**: Atividade de trading 24h/7d
- **Risco**: Volatilidade e correlação de tokens
- **Protocolo**: Confiabilidade e auditoria

### Filtros Inteligentes
- **protocol**: Protocolo específico ou 'all' para todos
- **minTvl**: TVL mínimo para garantir liquidez
- **maxRisk**: Nível máximo de risco tolerado
- **sortBy**: Priorização (apy, tvl, volume)
- **limit**: Quantidade de pools retornados

### Casos de Uso
- **Iniciantes**: protocol=all, maxRisk=low, sortBy=tvl
- **Agressivos**: minTvl=100000, maxRisk=high, sortBy=apy
- **Conservadores**: maxRisk=low, sortBy=tvl, limit=5
      `,
      querystring: {
        type: 'object',
        properties: {
          protocol: {
            type: 'string',
            enum: ['raydium', 'orca', 'all'],
            description: 'Protocolo DEX específico ou todos'
          },
          minTvl: {
            type: 'string',
            description: 'TVL mínimo em USD (ex: 100000)',
            pattern: '^[0-9]+$'
          },
          maxRisk: {
            type: 'string',
            enum: ['low', 'medium', 'high'],
            description: 'Nível máximo de risco tolerado'
          },
          sortBy: {
            type: 'string',
            enum: ['apy', 'tvl', 'volume'],
            description: 'Critério de ordenação'
          },
          limit: {
            type: 'string',
            description: 'Número máximo de pools (1-50)',
            pattern: '^[1-9][0-9]?$|^50$'
          }
        }
      },
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
                  volume24h: { type: 'number' },
                  protocol: { type: 'string' }
                }
              }
            },
            timestamp: { type: 'string', format: 'date-time' }
          }
        },
        400: {
          description: 'Requisição inválida',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        },
        500: {
          description: 'Erro interno do servidor',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      // Parse and validate query parameters
      const query = poolDiscoveryQuerySchema.parse(request.query);
      const pools = await poolService.discoverPools(query);
      return {
        success: true,
        data: pools,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      fastify.log.error('Pool discovery error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Erro ao descobrir pools',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Rankings de pools
  fastify.get<{
    Reply: ApiResponse<PoolRanking[]>;
  }>('/rankings', {
    schema: {
      tags: ['Pools'],
      summary: 'Rankings de pools por performance',
      description: `
Retorna rankings de pools baseado em algoritmo proprietário de scoring.

### Metodologia de Ranking
O score é calculado considerando:

1. **Performance (40%)**
   - APY histórico e projetado
   - Consistência de retornos
   - Tendência de crescimento

2. **Liquidez (25%)**
   - TVL total
   - Profundidade do order book
   - Estabilidade da liquidez

3. **Atividade (20%)**
   - Volume de trading
   - Frequência de transações
   - Crescimento de usuários

4. **Risco (15%)**
   - Volatilidade dos tokens
   - Correlação entre pares
   - Histórico de perdas

### Scores Explicados
- **Score Geral**: 0-100 (combinação ponderada)
- **Risk Score**: 0-10 (0=menor risco, 10=maior risco)
- **Liquidity Score**: 0-10 (qualidade da liquidez)

### Atualização
Rankings são atualizados a cada 15 minutos com dados em tempo real.
      `,
      response: {
        200: {
          description: 'Rankings retornados com sucesso',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  poolId: { type: 'string' },
                  score: { type: 'number' },
                  riskScore: { type: 'number' },
                  rank: { type: 'number' }
                }
              }
            },
            timestamp: { type: 'string', format: 'date-time' }
          }
        },
        500: {
          description: 'Erro interno do servidor',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const rankings = await poolService.getRankings();
      return {
        success: true,
        data: rankings,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      fastify.log.error('Pool rankings error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Erro ao obter rankings',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Análise detalhada de pool
  fastify.get<{
    Params: any;
    Querystring: any;
    Reply: ApiResponse<PoolAnalysis>;
  }>('/:poolId/analysis', {
    schema: {
      tags: ['Pools'],
      summary: 'Análise detalhada de pool específico',
      description: `
Fornece análise aprofundada de um pool específico incluindo métricas avançadas.

### Análises Incluídas

#### 1. Perda Impermanente (IL)
- **IL Atual**: Perda impermanente no momento
- **IL Projetada**: Estimativa para próximos 30 dias
- **Histórico**: Evolução da IL ao longo do tempo
- **Cenários**: IL em diferentes movimentos de preço

#### 2. Análise de Volume
- **Tendência**: Direção do volume (crescente/decrescente)
- **Volatilidade**: Estabilidade do volume
- **Predição**: Volume esperado para próximas 24h
- **Padrões**: Identificação de padrões sazonais

#### 3. Métricas de Risco
- **Risco Geral**: Avaliação consolidada
- **Risco de Liquidez**: Possibilidade de baixa liquidez
- **Risco de Protocolo**: Segurança do protocolo
- **Risco de Token**: Volatilidade dos tokens

#### 4. Comparação de Mercado
- **Benchmarks**: Comparação com pools similares
- **Percentis**: Posição relativa no mercado
- **Correlações**: Correlação com outros ativos

### Parâmetros
- **timeframe**: Período de análise (1h, 24h, 7d, 30d)
- **includeHistory**: Incluir dados históricos detalhados
      `,
      params: {
        type: 'object',
        required: ['poolId'],
        properties: {
          poolId: {
            type: 'string',
            description: 'ID único do pool para análise',
            minLength: 1,
            maxLength: 100
          }
        }
      },
      querystring: {
        type: 'object',
        properties: {
          timeframe: {
            type: 'string',
            enum: ['1h', '24h', '7d', '30d'],
            description: 'Período de análise'
          },
          includeHistory: {
            type: 'boolean',
            description: 'Incluir dados históricos detalhados'
          }
        }
      },
      response: {
        200: {
          description: 'Análise retornada com sucesso',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                poolId: { type: 'string' },
                impermanentLoss: { type: 'object' },
                volumeAnalysis: { type: 'object' },
                riskMetrics: { type: 'object' }
              }
            },
            timestamp: { type: 'string', format: 'date-time' }
          }
        },
        404: {
          description: 'Pool não encontrado',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        },
        500: {
          description: 'Erro interno do servidor',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { poolId } = poolIdSchema.parse(request.params);
      const query = poolAnalysisQuerySchema.parse(request.query);

      const analysis = await poolService.analyzePool(poolId, query);

      if (!analysis) {
        return reply.status(404).send({
          success: false,
          error: 'Pool não encontrado ou dados insuficientes para análise',
          timestamp: new Date().toISOString()
        });
      }

      return {
        success: true,
        data: analysis,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      fastify.log.error('Pool analysis error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Erro ao analisar pool',
        timestamp: new Date().toISOString()
      });
    }
  });
};