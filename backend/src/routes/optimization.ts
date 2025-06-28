/**
 * Optimization Routes - Inspirado no VaraYield-AI
 * 
 * Endpoints para otimização automática de yield farming
 * Implementa funcionalidades similares ao VaraYield-AI
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import OneClickOptimizerService from '../services/OneClickOptimizerService';
import RiskManagementService from '../services/RiskManagementService';
import AutoRebalanceService from '../services/AutoRebalanceService';

interface OptimizeRequest {
  Body: {
    userPublicKey: string;
    totalAmount: number;
    riskProfile: 'conservative' | 'moderate' | 'aggressive';
    preferences?: {
      preferredProtocols?: string[];
      excludeProtocols?: string[];
      maxPositions?: number;
      rebalanceFrequency?: 'daily' | 'weekly' | 'monthly' | 'manual';
    };
  };
}

interface ExecuteOptimizationRequest {
  Body: {
    userPublicKey: string;
    optimizationId: string;
    signedTransactions: string[];
  };
}

interface RebalanceCheckRequest {
  Body: {
    userPublicKey: string;
    currentPositions: {
      poolId: string;
      amount: number;
      percentage: number;
      currentAPY: number;
    }[];
    riskProfile: string;
  };
}

export default async function optimizationRoutes(fastify: FastifyInstance) {
  const oneClickService = new OneClickOptimizerService();
  const riskService = new RiskManagementService();
  const rebalanceService = new AutoRebalanceService();

  // Endpoint principal - One-Click Optimization (inspirado no VaraYield-AI)
  fastify.post<OptimizeRequest>('/api/optimization/optimize', async (request, reply) => {
    const { userPublicKey, totalAmount, riskProfile, preferences } = request.body;
    
    console.log(`🎯 One-Click Optimization solicitada para ${userPublicKey}`);
    
    try {
      if (!userPublicKey || !totalAmount || !riskProfile) {
        return reply.status(400).send({
          success: false,
          error: 'Parâmetros obrigatórios: userPublicKey, totalAmount, riskProfile',
          timestamp: new Date().toISOString()
        });
      }

      if (totalAmount < 0.01) {
        return reply.status(400).send({
          success: false,
          error: 'Valor mínimo para otimização: 0.01 SOL',
          timestamp: new Date().toISOString()
        });
      }

      const result = await oneClickService.optimizeOneClick({
        userPublicKey,
        totalAmount,
        riskProfile,
        preferences
      });

      if (result.success) {
        console.log(`✅ Otimização gerada com sucesso: ${result.strategy.allocations.length} posições`);
        
        return {
          success: true,
          data: {
            optimizationId: `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            strategy: result.strategy,
            transactions: result.transactions,
            timeline: result.timeline,
            monitoring: result.monitoring,
            summary: {
              totalPositions: result.strategy.allocations.length,
              expectedAPY: result.strategy.expectedMetrics.totalAPY,
              riskScore: result.strategy.expectedMetrics.riskScore,
              estimatedCosts: result.strategy.estimatedCosts.total,
              confidence: result.strategy.expectedMetrics.confidence
            }
          },
          message: `🎯 Estratégia ${riskProfile} otimizada: ${result.strategy.expectedMetrics.totalAPY.toFixed(2)}% APY esperado`,
          timestamp: new Date().toISOString()
        };
      } else {
        return reply.status(500).send({
          success: false,
          error: 'Falha na geração da estratégia de otimização',
          timestamp: new Date().toISOString()
        });
      }

    } catch (error) {
      console.error('❌ Erro na otimização one-click:', error);
      return reply.status(500).send({
        success: false,
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Endpoint para obter perfis de risco disponíveis
  fastify.get('/api/optimization/risk-profiles', async (request, reply) => {
    try {
      const profiles = riskService.getRiskProfiles();
      
      return {
        success: true,
        data: profiles.map(profile => ({
          id: profile.id,
          name: profile.name,
          description: profile.description,
          minAPY: profile.minAPY,
          maxRisk: profile.maxRisk,
          colors: profile.colors,
          allowedProtocols: profile.allowedProtocols,
          characteristics: {
            volatility: profile.id === 'conservative' ? 'Baixa' : 
                       profile.id === 'moderate' ? 'Média' : 'Alta',
            expectedReturn: profile.id === 'conservative' ? '5-10%' : 
                           profile.id === 'moderate' ? '10-20%' : '20%+',
            suitableFor: profile.id === 'conservative' ? 'Iniciantes' : 
                        profile.id === 'moderate' ? 'Intermediários' : 'Experientes'
          }
        })),
        message: `${profiles.length} perfis de risco disponíveis`,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Erro ao buscar perfis de risco:', error);
      return reply.status(500).send({
        success: false,
        error: 'Erro ao buscar perfis de risco',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Endpoint para executar otimização com transações assinadas
  fastify.post<ExecuteOptimizationRequest>('/api/optimization/execute', async (request, reply) => {
    const { userPublicKey, optimizationId, signedTransactions } = request.body;
    
    console.log(`⚡ Executando otimização ${optimizationId} para ${userPublicKey}`);
    
    try {
      if (!signedTransactions || signedTransactions.length === 0) {
        return reply.status(400).send({
          success: false,
          error: 'Transações assinadas são obrigatórias',
          timestamp: new Date().toISOString()
        });
      }

      const result = await oneClickService.executeOptimization(
        {
          userPublicKey,
          totalAmount: 1, // Mock - em produção viria do optimization ID
          riskProfile: 'moderate' // Mock
        },
        signedTransactions
      );

      console.log(`✅ Execução concluída: ${result.executedTransactions.length} transações bem-sucedidas`);

      return {
        success: result.success,
        data: {
          optimizationId,
          executedTransactions: result.executedTransactions,
          failedTransactions: result.failedTransactions,
          finalPositions: result.finalPositions,
          performanceMetrics: result.performanceMetrics,
          summary: {
            successRate: result.executedTransactions.length / signedTransactions.length,
            totalTransactions: signedTransactions.length,
            executedCount: result.executedTransactions.length,
            failedCount: result.failedTransactions.length
          }
        },
        message: result.success ? 
          `🎉 Otimização executada: ${result.executedTransactions.length}/${signedTransactions.length} transações` :
          '⚠️ Otimização parcialmente executada',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Erro na execução da otimização:', error);
      return reply.status(500).send({
        success: false,
        error: 'Erro na execução da otimização',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Endpoint para verificar necessidade de rebalanceamento
  fastify.post<RebalanceCheckRequest>('/api/optimization/rebalance-check', async (request, reply) => {
    const { userPublicKey, currentPositions, riskProfile } = request.body;
    
    console.log(`🔍 Verificando rebalanceamento para ${userPublicKey}`);
    
    try {
      // Simular dados de mercado
      const mockPortfolio = {
        totalValue: currentPositions.reduce((sum, pos) => sum + pos.amount, 0),
        positions: currentPositions.map(pos => ({
          ...pos,
          entryAPY: pos.currentAPY * 0.9, // Mock entry APY
          value: pos.amount
        })),
        riskProfile,
        lastRebalance: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 dias atrás
        performance: {
          totalReturn: 0.05,
          timeWeightedReturn: 0.04,
          sharpeRatio: 1.2
        }
      };

      const mockMarketData = {
        pools: currentPositions.map(pos => ({
          id: pos.poolId,
          currentAPY: pos.currentAPY + (Math.random() - 0.5) * 2, // Simular mudança de APY
          tvl: 10000000 + Math.random() * 20000000,
          volume24h: 1000000 + Math.random() * 5000000,
          priceImpact: Math.random() * 0.02
        })),
        marketVolatility: 0.15 + Math.random() * 0.1,
        totalMarketTVL: 500000000
      };

      const rebalanceStrategy = await rebalanceService.analyzeRebalanceNeed(
        mockPortfolio,
        mockMarketData
      );

      return {
        success: true,
        data: {
          shouldRebalance: rebalanceStrategy.shouldRebalance,
          strategy: rebalanceStrategy,
          currentMetrics: {
            totalValue: mockPortfolio.totalValue,
            currentAPY: currentPositions.reduce((sum, pos) => sum + (pos.currentAPY * pos.percentage), 0) / 100,
            riskScore: mockPortfolio.riskProfile === 'conservative' ? 0.3 : 
                      mockPortfolio.riskProfile === 'moderate' ? 0.6 : 0.9,
            diversification: currentPositions.length
          },
          recommendations: rebalanceStrategy.reasoning,
          nextCheck: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
        },
        message: rebalanceStrategy.shouldRebalance ? 
          `🔄 Rebalanceamento recomendado: ${rebalanceStrategy.actions.length} ações` :
          '✅ Portfolio otimizado, nenhuma ação necessária',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Erro na verificação de rebalanceamento:', error);
      return reply.status(500).send({
        success: false,
        error: 'Erro na verificação de rebalanceamento',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Endpoint para obter status dos serviços de otimização
  fastify.get('/api/optimization/status', async (request, reply) => {
    try {
      const oneClickStatus = oneClickService.getServiceStatus();
      const rebalanceStatus = rebalanceService.getStatus();

      return {
        success: true,
        data: {
          oneClickOptimizer: {
            ...oneClickStatus,
            status: 'operational'
          },
          autoRebalancer: {
            ...rebalanceStatus,
            status: rebalanceStatus.isRunning ? 'monitoring' : 'standby'
          },
          riskManagement: {
            availableProfiles: riskService.getRiskProfiles().length,
            status: 'operational'
          },
          systemHealth: {
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            version: '2.0.0-varayield-inspired'
          }
        },
        message: 'Serviços de otimização operacionais',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Erro ao obter status dos serviços:', error);
      return reply.status(500).send({
        success: false,
        error: 'Erro ao obter status dos serviços',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Endpoint para simulação de otimização (preview)
  fastify.post('/api/optimization/preview', async (request: FastifyRequest<OptimizeRequest>, reply) => {
    const { userPublicKey, totalAmount, riskProfile, preferences } = request.body;
    
    console.log(`👁️ Preview de otimização para ${userPublicKey}`);
    
    try {
      // Versão simplificada da otimização para preview
      const mockPools = [
        { id: 'SOL-USDC', apy: 8.5, tvl: 25000000, protocol: 'Raydium CPMM' },
        { id: 'SOL-RAY', apy: 15.8, tvl: 18000000, protocol: 'Raydium CPMM' },
        { id: 'SOL-mSOL', apy: 6.2, tvl: 12000000, protocol: 'Marinade Finance' }
      ];

      const optimization = await riskService.optimizeAllocation(
        riskProfile,
        mockPools,
        totalAmount
      );

      return {
        success: true,
        data: {
          strategy: {
            allocations: optimization.allocation.map(alloc => ({
              poolId: alloc.poolId,
              percentage: alloc.percentage,
              amount: (totalAmount * alloc.percentage) / 100,
              reasoning: alloc.reasoning
            })),
            expectedAPY: optimization.expectedAPY,
            riskScore: optimization.riskScore,
            confidence: optimization.confidence
          },
          estimatedCosts: {
            transactionFees: optimization.allocation.length * 0.005,
            slippage: totalAmount * 0.003,
            total: (optimization.allocation.length * 0.005) + (totalAmount * 0.003)
          },
          timelineEstimate: {
            preparationTime: 60, // segundos
            executionTime: optimization.allocation.length * 30,
            totalTime: 60 + (optimization.allocation.length * 30)
          }
        },
        message: `📊 Preview gerado para estratégia ${riskProfile}`,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Erro no preview de otimização:', error);
      return reply.status(500).send({
        success: false,
        error: 'Erro no preview de otimização',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString()
      });
    }
  });
}

// Adicionar ao debug-server.js
export const registerOptimizationRoutes = (fastify: FastifyInstance) => {
  fastify.register(optimizationRoutes);
};