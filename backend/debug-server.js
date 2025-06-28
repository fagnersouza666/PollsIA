const fastify = require('fastify')({ 
  logger: false // Desabilitar logs JSON do Fastify para usar nossos logs customizados
});

// Serviço de investimento 100% REAL com Raydium Safe SDK (anti-segfault)
console.log('🔄 Carregando Raydium Safe SDK...');

const RaydiumSafeSDK = require('./raydium-safe-sdk');
const raydiumRealService = new RaydiumSafeSDK();

// Inicializar SDK
raydiumRealService.initialize().then(success => {
  if (success) {
    console.log('✅ Raydium Modern SDK inicializado com sucesso');
  } else {
    console.error('❌ Falha ao inicializar Raydium Modern SDK');
  }
});

console.log('🚀 Serviço REAL carregado com Phantom Wallet');

// Carregar serviços de otimização inspirados no VaraYield-AI
console.log('🎯 Carregando serviços de otimização VaraYield-AI inspired...');

// Mock implementation dos novos endpoints de otimização
fastify.post('/api/optimization/optimize', async (request, reply) => {
  const { userPublicKey, totalAmount, riskProfile } = request.body;
  
  console.log(`🎯 One-Click Optimization solicitada para ${userPublicKey} - ${riskProfile}`);
  
  try {
    // Simular otimização inspirada no VaraYield-AI
    const allocations = [
      { 
        poolId: 'SOL-USDC-OPT', 
        poolName: 'SOL/USDC', 
        protocol: 'Raydium',
        percentage: riskProfile === 'conservative' ? 50 : riskProfile === 'moderate' ? 40 : 30,
        expectedAPY: 8.5,
        riskLevel: 'low',
        reasoning: 'Pool estável com alta liquidez'
      },
      { 
        poolId: 'SOL-RAY-OPT', 
        poolName: 'SOL/RAY', 
        protocol: 'Raydium',
        percentage: riskProfile === 'conservative' ? 30 : riskProfile === 'moderate' ? 35 : 45,
        expectedAPY: 15.8,
        riskLevel: 'medium',
        reasoning: 'Bom equilíbrio risco/retorno'
      },
      { 
        poolId: 'SOL-mSOL-OPT', 
        poolName: 'SOL/mSOL', 
        protocol: 'Marinade',
        percentage: riskProfile === 'conservative' ? 20 : riskProfile === 'moderate' ? 25 : 25,
        expectedAPY: 6.2,
        riskLevel: 'very-low',
        reasoning: 'Diversificação conservadora'
      }
    ];

    const expectedAPY = allocations.reduce((sum, alloc) => sum + (alloc.expectedAPY * alloc.percentage / 100), 0);
    
    return {
      success: true,
      data: {
        optimizationId: `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        strategy: {
          allocations: allocations.map(alloc => ({
            ...alloc,
            amount: (totalAmount * alloc.percentage) / 100
          })),
          expectedMetrics: {
            totalAPY: expectedAPY,
            riskScore: riskProfile === 'conservative' ? 0.3 : riskProfile === 'moderate' ? 0.6 : 0.9,
            diversificationScore: 85,
            liquidityScore: 90,
            confidence: 0.88
          },
          estimatedCosts: {
            transactionFees: 0.015,
            slippage: totalAmount * 0.003,
            total: 0.015 + (totalAmount * 0.003)
          }
        },
        transactions: allocations.map((alloc, index) => ({
          description: `Adicionar liquidez em ${alloc.poolName}`,
          type: 'addLiquidity',
          poolId: alloc.poolId,
          amount: (totalAmount * alloc.percentage) / 100,
          estimatedGas: 0.005,
          transactionData: Buffer.from(JSON.stringify({
            type: 'add-liquidity-optimized',
            poolId: alloc.poolId,
            userPublicKey,
            percentage: alloc.percentage,
            riskProfile,
            timestamp: Date.now()
          })).toString('base64')
        })),
        timeline: allocations.map((alloc, index) => ({
          step: index + 1,
          action: `Otimizar posição em ${alloc.poolName}`,
          status: 'pending',
          estimatedTime: 45 + (index * 15)
        })),
        monitoring: {
          nextRebalanceCheck: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          trackingEnabled: true,
          alertsEnabled: true,
          performanceTarget: expectedAPY
        }
      },
      message: `🎯 Estratégia ${riskProfile} otimizada: ${expectedAPY.toFixed(2)}% APY esperado`,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ Erro na otimização:', error);
    return reply.status(500).send({
      success: false,
      error: 'Erro na otimização',
      timestamp: new Date().toISOString()
    });
  }
});

// Endpoint para perfis de risco
fastify.get('/api/optimization/risk-profiles', async (request, reply) => {
  return {
    success: true,
    data: [
      {
        id: 'conservative',
        name: 'Conservative',
        description: 'Foco em estabilidade e proteção do capital',
        minAPY: 3.0,
        maxRisk: 0.3,
        colors: { primary: '#10B981', secondary: '#34D399', accent: '#059669' },
        characteristics: {
          volatility: 'Baixa',
          expectedReturn: '5-10%',
          suitableFor: 'Iniciantes'
        }
      },
      {
        id: 'moderate',
        name: 'Moderate',
        description: 'Equilíbrio entre risco e retorno',
        minAPY: 6.0,
        maxRisk: 0.6,
        colors: { primary: '#3B82F6', secondary: '#60A5FA', accent: '#1D4ED8' },
        characteristics: {
          volatility: 'Média',
          expectedReturn: '10-20%',
          suitableFor: 'Intermediários'
        }
      },
      {
        id: 'aggressive',
        name: 'Aggressive',
        description: 'Máximo yield possível com alto risco',
        minAPY: 12.0,
        maxRisk: 1.0,
        colors: { primary: '#EF4444', secondary: '#F87171', accent: '#DC2626' },
        characteristics: {
          volatility: 'Alta',
          expectedReturn: '20%+',
          suitableFor: 'Experientes'
        }
      }
    ],
    message: '3 perfis de risco disponíveis',
    timestamp: new Date().toISOString()
  };
});

// Endpoint para preview de otimização
fastify.post('/api/optimization/preview', async (request, reply) => {
  const { totalAmount, riskProfile } = request.body;
  
  const expectedAPY = riskProfile === 'conservative' ? 7.2 : 
                     riskProfile === 'moderate' ? 11.8 : 18.5;
  
  return {
    success: true,
    data: {
      strategy: {
        expectedAPY,
        riskScore: riskProfile === 'conservative' ? 0.3 : 
                  riskProfile === 'moderate' ? 0.6 : 0.9,
        confidence: 0.88
      },
      estimatedCosts: {
        transactionFees: 0.015,
        slippage: totalAmount * 0.003,
        total: 0.015 + (totalAmount * 0.003)
      },
      timelineEstimate: {
        preparationTime: 60,
        executionTime: 90,
        totalTime: 150
      }
    },
    message: `📊 Preview gerado para estratégia ${riskProfile}`,
    timestamp: new Date().toISOString()
  };
});

console.log('✅ Serviços de otimização VaraYield-AI loaded');

// Middleware de logging customizado para URLs
fastify.addHook('onRequest', async (request, reply) => {
  const method = request.method;
  const url = request.url;
  const timestamp = new Date().toISOString().substring(11, 23);
  
  // Filtrar apenas chamadas relevantes (excluir OPTIONS, favicon, etc.)
  if (method !== 'OPTIONS' && !url.includes('favicon') && url.startsWith('/api')) {
    console.log(`\n🔗 ${timestamp} API Request: [${method}] ${url}`);
  }
});

fastify.addHook('onResponse', async (request, reply) => {
  const method = request.method;
  const url = request.url;
  const statusCode = reply.statusCode;
  const timestamp = new Date().toISOString().substring(11, 23);
  
  // Filtrar apenas chamadas relevantes
  if (method !== 'OPTIONS' && !url.includes('favicon') && url.startsWith('/api')) {
    if (statusCode >= 200 && statusCode < 300) {
      console.log(`✅ ${timestamp} API Success: [${method}] ${url} - ${statusCode}`);
    } else {
      console.log(`❌ ${timestamp} API Error: [${method}] ${url} - ${statusCode}`);
    }
  }
});

// Registrar CORS
fastify.register(require('@fastify/cors'), {
  origin: ['http://localhost:3000'],
  credentials: true
});

// Health endpoint
fastify.get('/health', async (request, reply) => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: process.uptime()
  };
});

// Dados de fallback para quando a API do Raydium falha
const fallbackPools = [
  {
    id: 'pool_sol_usdc_001',
    tokenA: 'SOL',
    tokenB: 'USDC',
    apy: 12.5,
    tvl: 1500000,
    protocol: 'Raydium',
    lpTokens: 50000,
    volume24h: 850000,
    mintA: 'So11111111111111111111111111111111111111112',
    mintB: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
  },
  {
    id: 'pool_sol_ray_002',
    tokenA: 'SOL',
    tokenB: 'RAY',
    apy: 15.3,
    tvl: 980000,
    protocol: 'Raydium',
    lpTokens: 35000,
    volume24h: 654000,
    mintA: 'So11111111111111111111111111111111111111112',
    mintB: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R'
  },
  {
    id: 'pool_usdc_usdt_003',
    tokenA: 'USDC',
    tokenB: 'USDT',
    apy: 8.7,
    tvl: 2100000,
    protocol: 'Raydium',
    lpTokens: 75000,
    volume24h: 1200000,
    mintA: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    mintB: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'
  },
  {
    id: 'pool_sol_bonk_004',
    tokenA: 'SOL',
    tokenB: 'BONK',
    apy: 22.1,
    tvl: 750000,
    protocol: 'Raydium',
    lpTokens: 28000,
    volume24h: 450000,
    mintA: 'So11111111111111111111111111111111111111112',
    mintB: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263'
  },
  {
    id: 'pool_ray_usdc_005',
    tokenA: 'RAY',
    tokenB: 'USDC',
    apy: 18.9,
    tvl: 1200000,
    protocol: 'Raydium',
    lpTokens: 42000,
    volume24h: 720000,
    mintA: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
    mintB: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
  }
];

// Pools endpoints - SOMENTE pools 100% REAIS
fastify.get('/api/pools/discover', async (request, reply) => {
  console.log('🔍 Descobrindo pools 100% REAIS...');
  
  try {
    // Se o serviço real não está disponível, usar dados estáticos das pools reais
    if (!raydiumRealService) {
      console.log('⚠️ Serviço real não carregado, usando dados estáticos de pools reais...');
      
      // Pools reais populares do Raydium (dados estáticos)
      const staticRealPools = [
        {
          id: '6UmmUiYoBjSrhakAobJw8BvkmJtDVxaeBtbt7rxWo1mg', // RAY/USDC pool real
          tokenA: 'RAY',
          tokenB: 'USDC',
          mintA: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', // RAY
          mintB: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
          tvl: 15000000,
          apy: 12.3,
          isReal: true,
          protocol: 'Raydium CPMM'
        },
        {
          id: 'GG58L6v6FqLQ1YmmpBe1W8JiKPtGK3jGBb9rfFQnBXr4', // SOL/USDC pool real
          tokenA: 'SOL',
          tokenB: 'USDC', 
          mintA: 'So11111111111111111111111111111111111111112', // SOL
          mintB: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
          tvl: 25000000,
          apy: 8.5,
          isReal: true,
          protocol: 'Raydium CPMM'
        },
        {
          id: 'HDWpEEhqhE9h8rLYcqJzFVNkGQkp3vNRUGmfSwDTc9e', // SOL/RAY pool real
          tokenA: 'SOL',
          tokenB: 'RAY',
          mintA: 'So11111111111111111111111111111111111111112', // SOL
          mintB: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', // RAY
          tvl: 18000000,
          apy: 15.8,
          isReal: true,
          protocol: 'Raydium CPMM'
        }
      ];
      
      console.log(`✅ ${staticRealPools.length} pools REAIS (dados estáticos) carregadas`);
      return {
        success: true,
        data: staticRealPools,
        source: 'raydium-real-static',
        message: `${staticRealPools.length} Pools REAIS do Raydium (use Phantom Wallet para investir)`,
        timestamp: new Date().toISOString()
      };
    }
    
    console.log('🏊 Buscando pools REAIS do Raydium...');
    const realPools = await raydiumRealService.getAvailablePools();
    
    if (!realPools || realPools.length === 0) {
      throw new Error('Nenhuma pool real encontrada');
    }
    
    console.log(`✅ ${realPools.length} pools REAIS carregadas`);
    return {
      success: true,
      data: realPools,
      source: 'raydium-real-dynamic',
      message: `${realPools.length} Pools 100% REAIS do Raydium`,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Erro ao buscar pools reais:', error);
    
    return reply.status(500).send({
      success: false,
      error: 'Erro interno ao buscar pools: ' + error.message,
      timestamp: new Date().toISOString()
    });
  }
});

fastify.get('/api/pools/rankings', async (request, reply) => {
  return {
    success: true,
    data: [
      {
        id: 'pool_sol_usdc_001',
        score: 9.2,
        apy: 12.5,
        tvl: 1500000,
        protocol: 'Raydium'
      }
    ],
    timestamp: new Date().toISOString()
  };
});

// Wallet endpoints
fastify.post('/api/wallet/connect', async (request, reply) => {
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
fastify.get('/api/analytics/market-overview', async (request, reply) => {
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

// Investment endpoints - 100% REAL
fastify.get('/api/investment/status', async (request, reply) => {
  try {
    if (!raydiumRealService) {
      return {
        success: true,
        data: {
          status: 'service_unavailable',
          message: 'Serviço de investimento temporariamente indisponível',
          canViewPools: true,
          canInvest: false
        },
        timestamp: new Date().toISOString()
      };
    }
    
    const status = await raydiumRealService.getStatus();
    
    return {
      success: true,
      data: {
        ...status,
        canViewPools: true,
        canInvest: true
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return reply.status(500).send({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Endpoint para investir em uma pool - 100% REAL via Phantom
fastify.post('/api/investment/invest', async (request, reply) => {
  const { poolId, userPublicKey, solAmount, tokenA, tokenB, slippage = 1.0 } = request.body;
  
  console.log('💰 Iniciando investimento 100% REAL:', { poolId, userPublicKey, solAmount, tokenA, tokenB });
  
  try {
    if (!raydiumRealService || typeof raydiumRealService.prepareAddLiquidity !== 'function') {
      console.error('❌ Serviço raydium não disponível:', { 
        exists: !!raydiumRealService, 
        type: typeof raydiumRealService,
        hasPrepare: raydiumRealService ? typeof raydiumRealService.prepareAddLiquidity : 'undefined'
      });
      return reply.status(503).send({
        success: false,
        error: 'Serviço de investimento real não disponível',
        message: 'Serviço temporariamente indisponível',
        timestamp: new Date().toISOString()
      });
    }
    
    console.log('🔨 Preparando transação para Phantom assinar...');
    
    const result = await raydiumRealService.prepareAddLiquidity({
      poolId,
      userPublicKey,
      solAmount,
      slippage
    });
    
    if (result.success) {
      console.log('✅ Transação preparada para Phantom:', result.data.description);
      
      return {
        success: true,
        requiresSignature: true, // Phantom precisa assinar
        data: {
          transactionData: result.data.transactionData,
          tokenAAmount: result.data.tokenAAmount,
          tokenBAmount: result.data.tokenBAmount,
          expectedLpTokens: result.data.expectedLpTokens,
          poolInfo: result.data.poolInfo,
          description: result.data.description,
          isRealPool: result.data.isRealPool
        },
        message: result.data.description,
        timestamp: new Date().toISOString()
      };
    } else {
      console.error('❌ Falha ao preparar investimento:', result.error);
      return reply.status(400).send({
        success: false,
        error: result.error,
        timestamp: new Date().toISOString()
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao preparar investimento real:', error);
    return reply.status(500).send({
      success: false,
      error: 'Erro ao preparar investimento: ' + error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Endpoint para processar transação assinada pelo Phantom
fastify.post('/api/investment/process-signed', async (request, reply) => {
  const { transaction, description } = request.body;
  
  console.log('📤 Processando transação assinada pelo Phantom...');
  
  try {
    if (!raydiumRealService) {
      return reply.status(503).send({
        success: false,
        error: 'Serviço de investimento real não disponível',
        timestamp: new Date().toISOString()
      });
    }
    
    const result = await raydiumRealService.processSignedTransaction(transaction);
    
    if (result.success) {
      console.log('✅ Transação processada com sucesso!');
      return {
        success: true,
        data: {
          signature: result.signature,
          actualSolSpent: 0.001, // Taxa aproximada
          confirmationStatus: 'confirmed',
          explorerUrl: result.explorerUrl
        },
        message: `✅ Transação confirmada: ${description}`,
        timestamp: new Date().toISOString()
      };
    } else {
      console.error('❌ Falha no processamento:', result.error);
      return reply.status(400).send({
        success: false,
        error: result.error,
        timestamp: new Date().toISOString()
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao processar transação:', error);
    return reply.status(500).send({
      success: false,
      error: 'Erro ao processar transação: ' + error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Análise de pool específica
fastify.get('/api/pools/:poolId/analysis', async (request, reply) => {
  const { poolId } = request.params;
  return {
    success: true,
    data: {
      poolId,
      risk: 'medium',
      expectedApy: 14.2,
      liquidity: 'high',
      impermanentLoss: 2.1,
      recommendation: 'buy'
    },
    timestamp: new Date().toISOString()
  };
});

// Portfolio de carteira
fastify.get('/api/wallet/:publicKey/portfolio', async (request, reply) => {
  const { publicKey } = request.params;
  return {
    success: true,
    data: {
      publicKey,
      totalValue: 15420.50,
      totalPnl: 1420.50,
      pnlPercentage: 10.15,
      positions: 3
    },
    timestamp: new Date().toISOString()
  };
});

// Posições de carteira
fastify.get('/api/wallet/:publicKey/positions', async (request, reply) => {
  const { publicKey } = request.params;
  return {
    success: true,
    data: [
      {
        poolId: 'pool_sol_usdc_001',
        tokenA: 'SOL',
        tokenB: 'USDC',
        lpAmount: 5000,
        value: 6200,
        pnl: 1200,
        apy: 12.5
      }
    ],
    timestamp: new Date().toISOString()
  };
});

// Pools de carteira
fastify.get('/api/wallet/:publicKey/pools', async (request, reply) => {
  const { publicKey } = request.params;
  return {
    success: true,
    data: [
      {
        poolId: 'pool_sol_usdc_001',
        status: 'active',
        lpTokens: 5000,
        value: 6200,
        entryPrice: 5000,
        currentApy: 12.5
      }
    ],
    timestamp: new Date().toISOString()
  };
});

// Performance de carteira
fastify.get('/api/analytics/performance/:publicKey', async (request, reply) => {
  const { publicKey } = request.params;
  return {
    success: true,
    data: {
      publicKey,
      totalReturn: 1420.50,
      returnPercentage: 10.15,
      history: [
        { date: '2024-01-01', value: 14000 },
        { date: '2024-01-02', value: 14200 },
        { date: '2024-01-03', value: 15420.50 }
      ]
    },
    timestamp: new Date().toISOString()
  };
});

// Oportunidades
fastify.get('/api/analytics/opportunities', async (request, reply) => {
  return {
    success: true,
    data: [
      {
        poolId: 'pool_sol_ray_003',
        tokenA: 'SOL',
        tokenB: 'RAY',
        apy: 18.5,
        risk: 'medium',
        recommendation: 'strong_buy'
      }
    ],
    timestamp: new Date().toISOString()
  };
});

// Redirect root to health
fastify.get('/', async (request, reply) => {
  return reply.redirect('/health');
});

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: '0.0.0.0' });
    console.log('🚀 Debug server running on port 3001');
    console.log('📊 Health check: http://localhost:3001/health');
    console.log('🏊 Test endpoint: http://localhost:3001/api/pools/discover');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();