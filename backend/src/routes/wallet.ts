import { FastifyPluginAsync } from 'fastify';
import { WalletService } from '../services/WalletService';
import { walletConnectSchema } from '../schemas/wallet';
import { ApiResponse } from '../types/pool';
import { Portfolio, Position, WalletConnection, WalletPool } from '../types/wallet';

const BadRequestResponse = {
  description: 'Requisição inválida',
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    error: { type: 'string' },
    timestamp: { type: 'string', format: 'date-time' }
  }
};

const NotFoundResponse = {
  description: 'Recurso não encontrado',
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    error: { type: 'string' },
    timestamp: { type: 'string', format: 'date-time' }
  }
};

const InternalServerErrorResponse = {
  description: 'Erro interno do servidor',
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    error: { type: 'string' },
    timestamp: { type: 'string', format: 'date-time' }
  }
};

const PortfolioSchema = {
  $id: 'Portfolio',
  type: 'object',
  properties: {
    totalValue: { type: 'number' },
    solBalance: { type: 'number' },
    tokenAccounts: { type: 'number' },
    change24h: { type: 'number' },
    performance: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          date: { type: 'string' },
          value: { type: 'number' },
          change: { type: 'number' }
        }
      }
    }
  }
};

const PositionSchema = {
  $id: 'Position',
  type: 'object',
  properties: {
    poolId: { type: 'string' },
    tokenA: { type: 'string' },
    tokenB: { type: 'string' },
    liquidity: { type: 'number' },
    value: { type: 'number' },
    apy: { type: 'number' },
    entryDate: { type: 'string' }
  }
};

const WalletConnectionSchema = {
  $id: 'WalletConnection',
  type: 'object',
  required: ['publicKey', 'connected', 'balance'],
  properties: {
    publicKey: { type: 'string' },
    connected: { type: 'boolean' },
    balance: { type: 'number' }
  }
};

const WalletPoolSchema = {
  $id: 'WalletPool',
  type: 'object',
  properties: {
    id: { type: 'string' },
    tokenA: { type: 'string' },
    tokenB: { type: 'string' },
    myLiquidity: { type: 'number' },
    myValue: { type: 'number' },
    apy: { type: 'number' },
    entryDate: { type: 'string' },
    currentValue: { type: 'number' },
    pnl: { type: 'number' },
    rewardsEarned: { type: 'number' },
    status: { type: 'string', enum: ['active', 'inactive', 'pending'] }
  }
};

export const walletRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addSchema(WalletConnectionSchema);
  fastify.addSchema(PortfolioSchema);
  fastify.addSchema(PositionSchema);
  fastify.addSchema(WalletPoolSchema);
  const walletService = new WalletService();

  // Conectar carteira
  fastify.post<{
    Body: any;
    Reply: ApiResponse<WalletConnection>;
  }>('/connect', {
    schema: {
      tags: ['Wallet'],
      summary: 'Conectar carteira Solana',
      description: `
Conecta uma carteira Solana à plataforma e valida a propriedade.

### Processo de Conexão
1. **Validação**: Verifica se a chave pública é válida
2. **Assinatura**: Valida a assinatura fornecida
3. **Registro**: Registra a carteira no sistema
4. **Análise**: Inicia análise do portfólio

### Requisitos
- **publicKey**: Chave pública válida da carteira Solana
- **signature**: Assinatura de uma mensagem específica

### Phantom Wallet
Para carteiras Phantom, use o método \`signMessage\` para gerar a assinatura:
\`\`\`javascript
const message = "Conectar à PollsIA";
const signature = await window.solana.signMessage(
  new TextEncoder().encode(message)
);
\`\`\`

### Segurança
- Assinaturas são validadas usando criptografia ed25519
- Nenhuma chave privada é armazenada
- Conexões expiram em 24 horas
      `,
      body: {
        type: 'object',
        required: ['publicKey', 'signature'],
        properties: {
          publicKey: {
            type: 'string',
            description: 'Chave pública da carteira Solana',
            pattern: '^[1-9A-HJ-NP-Za-km-z]{32,44}$'
          },
          signature: {
            type: 'string',
            description: 'Assinatura da mensagem de autenticação',
            minLength: 64
          }
        }
      },
      response: {
        200: {
          description: 'Carteira conectada com sucesso',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { $ref: 'WalletConnection#' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        },
        400: BadRequestResponse,
        401: {
          description: 'Assinatura inválida',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        },
        500: InternalServerErrorResponse
      }
    }
  }, async (request, reply) => {
    try {
      const body = walletConnectSchema.parse(request.body);
      const connection = await walletService.connectWallet(body.publicKey, body.signature);
      return {
        success: true,
        data: connection,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      fastify.log.error('Wallet connection error:', error);

      if (error instanceof Error && error.message.includes('Invalid signature')) {
        return reply.status(401).send({
          success: false,
          error: 'Assinatura inválida',
          timestamp: new Date().toISOString()
        });
      }

      return reply.status(500).send({
        success: false,
        error: 'Erro ao conectar carteira',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Obter portfólio
  fastify.get<{
    Params: any;
    Reply: ApiResponse<Portfolio>;
  }>('/:publicKey/portfolio', {
    schema: {
      tags: ['Wallet'],
      summary: 'Obter portfólio da carteira',
      description: `
Retorna análise completa do portfólio de uma carteira conectada.

### Informações Incluídas

#### 1. Visão Geral
- **Valor Total**: Soma de todos os ativos em USD
- **Saldo SOL**: Saldo nativo da carteira
- **Token Accounts**: Número de contas de token
- **Mudança 24h**: Variação percentual do portfólio

#### 2. Distribuição de Ativos
- **Tokens**: Lista de todos os tokens com valores
- **Percentuais**: Distribuição por token
- **Preços**: Preços atuais de cada token

#### 3. Posições em Pools
- **Pools Ativos**: Posições em pools de liquidez
- **Rewards**: Recompensas acumuladas
- **IL**: Perda impermanente atual

#### 4. Histórico de Performance
- **Gráficos**: Evolução do valor do portfólio
- **Métricas**: ROI, Sharpe ratio, drawdown
- **Comparação**: Performance vs SOL, vs mercado

#### 5. Análise de Risco
- **Concentração**: Diversificação do portfólio
- **Volatilidade**: Risco histórico
- **Correlações**: Correlação entre ativos

### Cache
Dados são atualizados a cada 5 minutos para otimizar performance.
      `,
      params: {
        type: 'object',
        required: ['publicKey'],
        properties: {
          publicKey: {
            type: 'string',
            description: 'Chave pública da carteira',
            pattern: '^[1-9A-HJ-NP-Za-km-z]{32,44}$'
          }
        }
      },
      response: {
        200: {
          description: 'Portfólio retornado com sucesso',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { $ref: 'Portfolio#' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        },
        404: NotFoundResponse,
        500: InternalServerErrorResponse
      }
    }
  }, async (request, reply) => {
    try {
      const { publicKey } = request.params as { publicKey: string };
      const portfolio = await walletService.getPortfolio(publicKey);

      if (!portfolio) {
        return reply.status(404).send({
          success: false,
          error: 'Carteira não encontrada ou não conectada',
          timestamp: new Date().toISOString()
        });
      }

      return {
        success: true,
        data: portfolio,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      fastify.log.error('Portfolio error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Erro ao obter portfólio',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Obter posições
  fastify.get<{
    Params: any;
    Reply: ApiResponse<Position[]>;
  }>('/:publicKey/positions', {
    schema: {
      tags: ['Wallet'],
      summary: 'Obter posições em pools de liquidez',
      description: `
Retorna todas as posições ativas da carteira em pools de liquidez.

### Informações por Posição

#### 1. Dados Básicos
- **Pool ID**: Identificador único do pool
- **Tokens**: Par de tokens (tokenA/tokenB)
- **Liquidez**: Quantidade de liquidez fornecida
- **Valor**: Valor atual da posição em USD

#### 2. Performance
- **APY**: Retorno anualizado da posição
- **Rewards**: Recompensas acumuladas
- **Fees Earned**: Taxas ganhas até o momento
- **Entry Date**: Data de entrada na posição

#### 3. Análise de Risco
- **IL Atual**: Perda impermanente atual
- **IL Máximo**: Maior IL registrado
- **Volatilidade**: Volatilidade dos tokens
- **Correlação**: Correlação entre os tokens

#### 4. Sugestões
- **Rebalanceamento**: Sugestões de otimização
- **Exit Signals**: Sinais de saída
- **Opportunities**: Oportunidades de migração

### Filtros
- **active**: Apenas posições ativas
- **minValue**: Valor mínimo da posição
- **protocol**: Filtrar por protocolo
      `,
      params: {
        type: 'object',
        required: ['publicKey'],
        properties: {
          publicKey: {
            type: 'string',
            description: 'Chave pública da carteira',
            pattern: '^[1-9A-HJ-NP-Za-km-z]{32,44}$'
          }
        }
      },
      querystring: {
        type: 'object',
        properties: {
          active: {
            type: 'boolean',
            description: 'Filtrar apenas posições ativas',
            default: true
          },
          minValue: {
            type: 'number',
            minimum: 0,
            description: 'Valor mínimo da posição em USD'
          },
          protocol: {
            type: 'string',
            enum: ['raydium', 'orca', 'all'],
            description: 'Filtrar por protocolo',
            default: 'all'
          }
        }
      },
      response: {
        200: {
          description: 'Posições retornadas com sucesso',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: { $ref: 'Position#' }
            },
            timestamp: { type: 'string', format: 'date-time' }
          }
        },
        404: NotFoundResponse,
        500: InternalServerErrorResponse
      }
    }
  }, async (request, reply) => {
    try {
      const { publicKey } = request.params as { publicKey: string };
      const positions = await walletService.getPositions(publicKey);

      if (!positions) {
        return reply.status(404).send({
          success: false,
          error: 'Carteira não encontrada ou sem posições',
          timestamp: new Date().toISOString()
        });
      }

      return {
        success: true,
        data: positions,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      fastify.log.error('Positions error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Erro ao obter posições',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Obter pools da carteira
  fastify.get<{
    Params: any;
    Reply: ApiResponse<WalletPool[]>;
  }>('/:publicKey/pools', {
    schema: {
      tags: ['Wallet'],
      summary: 'Obter pools de liquidez da carteira',
      description: `
Retorna todas as pools de liquidez nas quais a carteira possui posições ativas.

### Informações por Pool

#### 1. Dados da Posição
- **Pool ID**: Identificador único do pool
- **Tokens**: Par de tokens da pool (tokenA/tokenB)
- **Minha Liquidez**: Quantidade de liquidez fornecida
- **Meu Valor**: Valor atual da posição em USD

#### 2. Performance da Posição
- **APY**: Retorno anualizado da posição
- **Valor Atual**: Valor atualizado da posição
- **P&L**: Lucro ou prejuízo desde a entrada
- **Rewards**: Recompensas acumuladas em USD
- **Data Entrada**: Quando a posição foi iniciada

#### 3. Status
- **Active**: Posição ativa gerando rendimentos
- **Inactive**: Posição inativa ou removida
- **Pending**: Posição em processamento

### Métricas Calculadas
- **Total Investido**: Soma de todas as posições
- **Total P&L**: Lucro/prejuízo consolidado
- **Total Rewards**: Recompensas totais acumuladas
- **APY Médio**: Média ponderada dos APYs

### Filtros Disponíveis
- **status**: Filtrar por status da posição
- **minValue**: Valor mínimo da posição
- **sortBy**: Ordenar por valor, APY, P&L, ou data
      `,
      params: {
        type: 'object',
        required: ['publicKey'],
        properties: {
          publicKey: {
            type: 'string',
            description: 'Chave pública da carteira',
            pattern: '^[1-9A-HJ-NP-Za-km-z]{32,44}$'
          }
        }
      },
      querystring: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['active', 'inactive', 'pending', 'all'],
            description: 'Filtrar por status',
            default: 'active'
          },
          minValue: {
            type: 'number',
            minimum: 0,
            description: 'Valor mínimo da posição em USD'
          },
          sortBy: {
            type: 'string',
            enum: ['value', 'apy', 'pnl', 'date'],
            description: 'Critério de ordenação',
            default: 'value'
          }
        }
      },
      response: {
        200: {
          description: 'Pools da carteira retornadas com sucesso',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: { $ref: 'WalletPool#' }
            },
            timestamp: { type: 'string', format: 'date-time' }
          }
        },
        404: NotFoundResponse,
        500: InternalServerErrorResponse
      }
    }
  }, async (request, reply) => {
    try {
      const { publicKey } = request.params as { publicKey: string };
      const { status = 'active', minValue, sortBy = 'value' } = request.query as any;
      
      let pools = await walletService.getWalletPools(publicKey);

      // Não retornar erro 404 para array vazio - isso é um estado válido
      if (!pools) {
        pools = [];
      }

      // Aplicar filtros
      if (status !== 'all') {
        pools = pools.filter((pool: any) => pool.status === status);
      }

      if (minValue) {
        pools = pools.filter((pool: any) => pool.currentValue >= minValue);
      }

      // Aplicar ordenação
      switch (sortBy) {
        case 'apy':
          pools.sort((a: any, b: any) => b.apy - a.apy);
          break;
        case 'pnl':
          pools.sort((a: any, b: any) => b.pnl - a.pnl);
          break;
        case 'date':
          pools.sort((a: any, b: any) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime());
          break;
        default: // value
          pools.sort((a: any, b: any) => b.currentValue - a.currentValue);
      }

      return {
        success: true,
        data: pools,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      fastify.log.error('Wallet pools error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Erro ao obter pools da carteira',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Desconectar carteira
  fastify.delete<{
    Params: any;
    Reply: ApiResponse<{ disconnected: boolean }>;
  }>('/:publicKey/disconnect', {
    schema: {
      tags: ['Wallet'],
      summary: 'Desconectar carteira',
      description: `
Desconecta uma carteira da plataforma e limpa dados de sessão.

### Processo de Desconexão
1. **Validação**: Verifica se a carteira está conectada
2. **Limpeza**: Remove dados de sessão e cache
3. **Notificação**: Registra evento de desconexão
4. **Confirmação**: Retorna status de desconexão

### Segurança
- Remove todos os dados temporários
- Invalida tokens de sessão
- Limpa cache do portfólio
- Registra log de auditoria

### Reconexão
A carteira pode ser reconectada a qualquer momento usando o endpoint \`/connect\`.
      `,
      params: {
        type: 'object',
        required: ['publicKey'],
        properties: {
          publicKey: {
            type: 'string',
            description: 'Chave pública da carteira',
            pattern: '^[1-9A-HJ-NP-Za-km-z]{32,44}$'
          }
        }
      },
      response: {
        200: {
          description: 'Carteira desconectada com sucesso',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                disconnected: { type: 'boolean' }
              }
            },
            timestamp: { type: 'string', format: 'date-time' }
          }
        },
        404: NotFoundResponse,
        500: InternalServerErrorResponse
      }
    }
  }, async (request, reply) => {
    try {
      const { publicKey } = request.params as { publicKey: string };
      const disconnected = await walletService.disconnectWallet(publicKey);

      if (!disconnected) {
        return reply.status(404).send({
          success: false,
          error: 'Carteira não encontrada ou já desconectada',
          timestamp: new Date().toISOString()
        });
      }

      return {
        success: true,
        data: { disconnected: true },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      fastify.log.error('Disconnect error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Erro ao desconectar carteira',
        timestamp: new Date().toISOString()
      });
    }
  });
};