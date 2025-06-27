const fastify = require('fastify')({ 
  logger: false // Desabilitar logs JSON do Fastify para usar nossos logs customizados
});

// Importar serviço de investimento real
let raydiumService;
try {
  const { RaydiumInvestmentService } = require('./raydium-investment.js');
  raydiumService = new RaydiumInvestmentService();
  console.log('✅ Serviço de investimento real carregado');
} catch (error) {
  console.log('⚠️ Serviço de investimento não disponível:', error.message);
  raydiumService = null;
}

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

// Pools endpoints - Com pools reais quando disponível
fastify.get('/api/pools/discover', async (request, reply) => {
  console.log('🔍 Descobrindo pools...');
  
  try {
    // Tentar usar pools reais primeiro
    if (raydiumService) {
      console.log('🏊 Buscando pools reais do Raydium...');
      const realPools = await raydiumService.getAvailablePools();
      
      if (realPools && realPools.length > 0) {
        console.log(`✅ ${realPools.length} pools reais carregadas`);
        return {
          success: true,
          data: realPools,
          source: 'raydium-real',
          message: `Pools REAIS do Raydium (${realPools.length} disponíveis)`,
          timestamp: new Date().toISOString()
        };
      }
    }
    
    // Fallback para dados de demonstração
    console.log('🔄 Usando pools de demonstração...');
    return {
      success: true,
      data: fallbackPools,
      source: 'fallback',
      message: 'Pools de demonstração (Raydium indisponível)',
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Erro ao descobrir pools:', error);
    
    // Fallback em caso de erro
    return {
      success: true,
      data: fallbackPools,
      source: 'fallback-error',
      message: 'Pools de demonstração (erro ao acessar Raydium)',
      timestamp: new Date().toISOString()
    };
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

// Investment endpoints
fastify.get('/api/investment/status', async (request, reply) => {
  return {
    success: true,
    data: {
      status: 'ready',
      message: 'Serviço de investimento funcionando'
    },
    timestamp: new Date().toISOString()
  };
});

// Endpoint para investir em uma pool (REAL usando Raydium)
fastify.post('/api/investment/invest', async (request, reply) => {
  const { poolId, userPublicKey, solAmount, tokenA, tokenB, slippage = 0.5 } = request.body;
  
  console.log('💰 Iniciando investimento:', { poolId, userPublicKey, solAmount, tokenA, tokenB });
  
  try {
    // Tentar usar serviço real primeiro
    if (raydiumService) {
      console.log('🏊 Usando serviço de investimento REAL...');
      
      const result = await raydiumService.prepareRealInvestment({
        poolId,
        userPublicKey,
        solAmount,
        slippage
      });
      
      if (result.success) {
        console.log('✅ Investimento REAL preparado:', result.data.description);
        return {
          success: true,
          requiresSignature: true,
          data: result.data,
          message: result.data.description,
          timestamp: new Date().toISOString()
        };
      } else {
        console.log('⚠️ Falha no investimento real:', result.error);
        // Continuar para fallback
      }
    }
    
    // Fallback: método anterior (demonstração)
    console.log('🔄 Usando investimento de demonstração...');
    
    const { Connection, Transaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');
    const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
    const fromPubkey = new PublicKey(userPublicKey);
    
    // Verificar saldo
    const balance = await connection.getBalance(fromPubkey);
    const solBalance = balance / LAMPORTS_PER_SOL;
    
    if (solBalance < solAmount) {
      return reply.status(400).send({
        success: false,
        error: `Saldo insuficiente. Atual: ${solBalance.toFixed(4)} SOL, necessário: ${solAmount} SOL`,
        timestamp: new Date().toISOString()
      });
    }
    
    // Criar transação de demonstração
    const { blockhash } = await connection.getLatestBlockhash();
    const transaction = new Transaction();
    const lamports = Math.floor(0.001 * LAMPORTS_PER_SOL);
    
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = fromPubkey;
    
    transaction.add(
      SystemProgram.transfer({
        fromPubkey,
        toPubkey: fromPubkey,
        lamports,
      })
    );
    
    const transactionData = Buffer.from(transaction.serialize({ 
      requireAllSignatures: false,
      verifySignatures: false 
    })).toString('base64');
    
    const tokenAAmount = solAmount / 2;
    const tokenBAmount = solAmount / 2;
    
    return {
      success: true,
      requiresSignature: true,
      data: {
        transactionData,
        tokenAAmount,
        tokenBAmount,
        poolId,
        description: `⚠️ DEMONSTRAÇÃO: ${solAmount} SOL → ${tokenA}/${tokenB}`,
        fee: lamports / LAMPORTS_PER_SOL,
        isRealPool: false
      },
      message: `Transação de demonstração preparada: ${solAmount} SOL`,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Erro ao preparar investimento:', error);
    return reply.status(500).send({
      success: false,
      error: 'Erro ao preparar investimento: ' + error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Endpoint para processar transação assinada (REAL)
fastify.post('/api/investment/process-signed', async (request, reply) => {
  const { transaction, description } = request.body;
  
  console.log('📤 Processando transação assinada...');
  
  try {
    // Tentar usar serviço real primeiro
    if (raydiumService) {
      console.log('🏊 Usando processamento REAL...');
      
      const result = await raydiumService.processRealInvestment(transaction);
      
      if (result.success) {
        console.log('✅ Investimento REAL processado com sucesso!');
        return {
          success: true,
          data: {
            signature: result.signature,
            actualSolSpent: 0.001,
            confirmationStatus: 'confirmed',
            explorerUrl: result.explorerUrl
          },
          message: `✅ Transação REAL confirmada: ${description}`,
          timestamp: new Date().toISOString()
        };
      } else {
        console.log('⚠️ Falha no processamento real:', result.error);
        // Continuar para fallback
      }
    }
    
    // Fallback: método anterior
    console.log('🔄 Usando processamento de demonstração...');
    
    const { Connection, Transaction } = require('@solana/web3.js');
    const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
    
    const transactionBuffer = Buffer.from(transaction, 'base64');
    const signedTransaction = Transaction.from(transactionBuffer);
    
    console.log('🚀 Enviando transação para blockchain...');
    const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
      skipPreflight: false,
      preflightCommitment: 'confirmed'
    });
    
    console.log('⏳ Aguardando confirmação...');
    const confirmation = await connection.confirmTransaction(signature, 'confirmed');
    
    if (confirmation.value.err) {
      throw new Error(`Transação falhou: ${JSON.stringify(confirmation.value.err)}`);
    }
    
    console.log('🎉 Transação confirmada!');
    
    return {
      success: true,
      data: {
        signature,
        actualSolSpent: 0.001,
        confirmationStatus: 'confirmed',
        blockHash: confirmation.value.blockHeight,
        explorerUrl: `https://solscan.io/tx/${signature}`
      },
      message: `✅ Transação processada: ${description}`,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Erro ao processar transação:', error);
    
    // Fallback final: simular
    console.log('🔄 Fallback: simulando...');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      data: {
        signature: 'simulated_' + Date.now(),
        actualSolSpent: 0.001,
        confirmationStatus: 'simulated',
        error: error.message
      },
      message: `⚠️ Processamento simulado: ${description}`,
      timestamp: new Date().toISOString()
    };
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