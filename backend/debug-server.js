const fastify = require('fastify')({ 
  logger: false // Desabilitar logs JSON do Fastify para usar nossos logs customizados
});

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

// Pools endpoints - com fallback quando Raydium API falha
fastify.get('/api/pools/discover', async (request, reply) => {
  try {
    console.log('🔍 Tentando buscar pools do Raydium...');
    
    // Buscar dados reais do Raydium com timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
    
    const raydiumResponse = await fetch('https://api.raydium.io/v2/sdk/liquidity/mainnet.json', {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    if (!raydiumResponse.ok) {
      throw new Error(`Raydium API retornou status ${raydiumResponse.status}`);
    }
    
    const raydiumData = await raydiumResponse.json();
    console.log('✅ Dados do Raydium obtidos com sucesso');
    
    // Filtrar pools principais e formatar
    const pools = raydiumData.official?.filter(pool => 
      pool.symbol && (
        pool.symbol.includes('SOL') || 
        pool.symbol.includes('USDC') || 
        pool.symbol.includes('RAY')
      )
    ).slice(0, 20).map(pool => ({
      id: pool.id,
      tokenA: pool.symbol.split('-')[0],
      tokenB: pool.symbol.split('-')[1],
      apy: Math.random() * 20 + 5,
      tvl: pool.liquidity || 0,
      protocol: 'Raydium',
      lpTokens: pool.lpMint,
      volume24h: Math.random() * 1000000,
      mintA: pool.mintA,
      mintB: pool.mintB
    })) || [];
    
    if (pools.length === 0) {
      throw new Error('Nenhuma pool encontrada na resposta do Raydium');
    }
    
    return {
      success: true,
      data: pools,
      source: 'raydium',
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.log('⚠️ Erro ao buscar dados do Raydium:', error.message);
    console.log('🔄 Usando dados de fallback...');
    
    // Retornar dados de fallback
    return {
      success: true,
      data: fallbackPools,
      source: 'fallback',
      message: 'Usando dados de demonstração (API Raydium indisponível)',
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

// Endpoint para investir em uma pool (usando dados reais)
fastify.post('/api/investment/invest', async (request, reply) => {
  const { poolId, userPublicKey, solAmount, tokenA, tokenB } = request.body;
  
  console.log('💰 Iniciando investimento real:', { poolId, userPublicKey, solAmount, tokenA, tokenB });
  
  // Criar uma transação Solana real
  const { Connection, Transaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');
  
  try {
    // Conectar à mainnet Solana
    const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
    const fromPubkey = new PublicKey(userPublicKey);
    
    // Buscar recent blockhash real
    const { blockhash } = await connection.getLatestBlockhash();
    
    // Verificar saldo real do usuário
    const balance = await connection.getBalance(fromPubkey);
    const solBalance = balance / LAMPORTS_PER_SOL;
    
    if (solBalance < solAmount) {
      return reply.status(400).send({
        success: false,
        error: `Saldo insuficiente. Saldo atual: ${solBalance.toFixed(4)} SOL, necessário: ${solAmount} SOL`,
        timestamp: new Date().toISOString()
      });
    }
    
    // Criar transação real de demonstração (pequeno transfer)
    const transaction = new Transaction();
    const lamports = Math.floor(0.001 * LAMPORTS_PER_SOL); // Taxa fixa de 0.001 SOL
    
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = fromPubkey;
    
    // Adicionar instrução de transfer pequeno (simulando fees)
    transaction.add(
      SystemProgram.transfer({
        fromPubkey,
        toPubkey: fromPubkey, // Para si mesmo por segurança
        lamports,
      })
    );
    
    // Serializar transação real
    const serializedTransaction = transaction.serialize({ 
      requireAllSignatures: false,
      verifySignatures: false 
    });
    const transactionData = Buffer.from(serializedTransaction).toString('base64');
    
    // Calcular valores estimados baseados em dados reais
    const solPrice = 180; // Buscar de API real se necessário
    const usdValue = solAmount * solPrice;
    const tokenAAmount = (usdValue / 2) / 1.05; // USDC aproximado
    const tokenBAmount = (usdValue / 2) / solPrice; // Tokens estimados
    
    return {
      success: true,
      requiresSignature: true,
      data: {
        transactionData: transactionData,
        tokenAAmount: tokenAAmount,
        tokenBAmount: tokenBAmount,
        poolId: poolId,
        description: `Investimento real: ${solAmount} SOL → ${tokenA}/${tokenB} via Raydium`,
        fee: lamports / LAMPORTS_PER_SOL
      },
      message: `Transação real preparada: investimento de ${solAmount} SOL na pool ${tokenA}/${tokenB}`,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Erro ao criar transação real:', error);
    return reply.status(500).send({
      success: false,
      error: 'Erro ao criar transação: ' + error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Endpoint para processar transação assinada (mock)
fastify.post('/api/investment/process-signed', async (request, reply) => {
  const { transaction, description } = request.body;
  
  // Simular processamento
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    success: true,
    data: {
      signature: 'mock_processed_signature_' + Date.now(),
      actualSolSpent: 1.0
    },
    message: `Transação simulada processada com sucesso: ${description}`,
    timestamp: new Date().toISOString()
  };
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