import { FastifyPluginAsync } from 'fastify';
import { InvestmentService, InvestmentRequest } from '../services/InvestmentService';

export const investmentRoutes: FastifyPluginAsync = async (fastify) => {
  const investmentService = new InvestmentService();

  // Endpoint para investir em uma pool
  fastify.post<{
    Body: InvestmentRequest;
    Reply: any;
  }>('/invest', {
    schema: {
      tags: ['Investment'],
      summary: 'Investir em uma pool de liquidez',
      description: `
Executa investimento real em uma pool de liquidez do Raydium.

### Processo de Investimento
1. **Validação**: Verifica se os parâmetros estão corretos
2. **Swap**: Converte SOL para os tokens da pool (50/50 split)  
3. **Liquidez**: Adiciona liquidez na pool do Raydium
4. **Confirmação**: Retorna assinatura da transação

### Requisitos
- Carteira conectada com saldo suficiente
- SOLANA_PRIVATE_KEY configurada no backend
- Pool válida no Raydium

### Segurança
- Transações assinadas na blockchain
- Slippage configurável para proteção
- Validação de valores mínimos/máximos
      `,
      body: {
        type: 'object',
        required: ['poolId', 'userPublicKey', 'solAmount', 'tokenA', 'tokenB'],
        properties: {
          poolId: {
            type: 'string',
            description: 'ID único da pool no Raydium',
            minLength: 1
          },
          userPublicKey: {
            type: 'string',
            description: 'Chave pública da carteira do usuário',
            minLength: 32,
            maxLength: 44
          },
          solAmount: {
            type: 'number',
            description: 'Quantidade de SOL para investir',
            minimum: 0.001,
            maximum: 1000
          },
          tokenA: {
            type: 'string',
            description: 'Símbolo do primeiro token da pool',
            minLength: 1
          },
          tokenB: {
            type: 'string',
            description: 'Símbolo do segundo token da pool',
            minLength: 1
          },
          slippage: {
            type: 'number',
            description: 'Tolerância de slippage em % (padrão: 0.5%)',
            minimum: 0.1,
            maximum: 5.0
          }
        }
      },
      response: {
        200: {
          description: 'Investimento executado com sucesso',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                signature: { type: 'string' },
                tokenAAmount: { type: 'number' },
                tokenBAmount: { type: 'number' },
                actualSolSpent: { type: 'number' },
                poolId: { type: 'string' }
              }
            },
            message: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        },
        400: {
          description: 'Dados de investimento inválidos',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        },
        500: {
          description: 'Erro interno durante investimento',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        },
        503: {
          description: 'Serviço de investimento não configurado',
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
      // Verificar se o serviço está configurado
      if (!investmentService.isConfigured()) {
        return reply.status(503).send({
          success: false,
          error: 'Serviço de investimento não configurado. Configure SOLANA_PRIVATE_KEY no backend.',
          timestamp: new Date().toISOString()
        });
      }

      const investmentRequest: InvestmentRequest = request.body;

      // Validações básicas
      if (investmentRequest.solAmount <= 0) {
        return reply.status(400).send({
          success: false,
          error: 'Valor de investimento deve ser maior que zero',
          timestamp: new Date().toISOString()
        });
      }

      if (investmentRequest.solAmount > 1000) {
        return reply.status(400).send({
          success: false,
          error: 'Valor máximo de investimento é 1000 SOL',
          timestamp: new Date().toISOString()
        });
      }

      // Log do investimento
      fastify.log.info('💰 Iniciando investimento:', {
        poolId: investmentRequest.poolId,
        userPublicKey: investmentRequest.userPublicKey,
        solAmount: investmentRequest.solAmount,
        tokenA: investmentRequest.tokenA,
        tokenB: investmentRequest.tokenB
      });

      // Executar investimento
      const result = await investmentService.investInPool(investmentRequest);

      if (!result.success) {
        return reply.status(400).send({
          success: false,
          error: result.error || 'Falha no investimento',
          timestamp: new Date().toISOString()
        });
      }

      // Sucesso
      return {
        success: true,
        data: {
          signature: result.signature,
          tokenAAmount: result.tokenAAmount,
          tokenBAmount: result.tokenBAmount,
          actualSolSpent: result.actualSolSpent,
          poolId: investmentRequest.poolId
        },
        message: `Investimento de ${investmentRequest.solAmount} SOL executado com sucesso na pool ${investmentRequest.tokenA}/${investmentRequest.tokenB}`,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      fastify.log.error('❌ Erro no endpoint de investimento:', error);
      return reply.status(500).send({
        success: false,
        error: 'Erro interno durante processamento do investimento',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Endpoint para verificar status do serviço
  fastify.get('/status', {
    schema: {
      tags: ['Investment'],
      summary: 'Status do serviço de investimento',
      description: 'Verifica se o serviço de investimento está configurado e funcionando',
      response: {
        200: {
          type: 'object',
          properties: {
            configured: { type: 'boolean' },
            message: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  }, async (_request, _reply) => {
    const isConfigured = investmentService.isConfigured();
    
    return {
      configured: isConfigured,
      message: isConfigured 
        ? 'Serviço de investimento configurado e pronto'
        : 'Serviço de investimento não configurado - configure SOLANA_PRIVATE_KEY',
      timestamp: new Date().toISOString()
    };
  });

  // Endpoint para simular investimento (teste)
  fastify.post<{
    Body: Pick<InvestmentRequest, 'poolId' | 'solAmount' | 'tokenA' | 'tokenB'>;
    Reply: any;
  }>('/simulate', {
    schema: {
      tags: ['Investment'],
      summary: 'Simular investimento (teste)',
      description: 'Simula um investimento sem executar transações reais',
      body: {
        type: 'object',
        required: ['poolId', 'solAmount', 'tokenA', 'tokenB'],
        properties: {
          poolId: { type: 'string' },
          solAmount: { type: 'number', minimum: 0.001 },
          tokenA: { type: 'string' },
          tokenB: { type: 'string' }
        }
      }
    }
  }, async (request, _reply) => {
    const { poolId, solAmount, tokenA, tokenB } = request.body;

    // Calcular valores simulados
    const solPrice = 180; // USD
    const usdValue = solAmount * solPrice;
    const tokenAAmount = (usdValue / 2) / 1.05; // USDC
    const tokenBAmount = (usdValue / 2) / 0.5;  // Token exemplo

    return {
      success: true,
      simulation: true,
      data: {
        poolId,
        solAmount,
        tokenA,
        tokenB,
        estimatedTokenAAmount: tokenAAmount,
        estimatedTokenBAmount: tokenBAmount,
        estimatedUsdValue: usdValue,
        slippage: 0.5
      },
      message: 'Simulação de investimento (sem transação real)',
      timestamp: new Date().toISOString()
    };
  });
};