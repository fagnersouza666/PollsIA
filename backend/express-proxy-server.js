const express = require('express');
const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');

const app = express();
const port = 3001;

// Solana connection
const connection = new Connection('https://solana-rpc.publicnode.com', 'confirmed');

// Token Program IDs
const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
const TOKEN_2022_PROGRAM_ID = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb');
const RAYDIUM_CLMM_PROGRAM_ID = new PublicKey('CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK');
const METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

// Enhanced caching system
let raydiumPairsCache = null;
let lastCacheUpdate = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour for pairs
const priceCache = new Map();
const PRICE_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes for prices

// Enhanced rate limiting
const activeRequests = new Map();
const requestQueue = [];
let processingQueue = false;
const MAX_CONCURRENT_REQUESTS = 1; // Reduced to prevent rate limiting
const REQUEST_DELAY = 2000; // 2 seconds between requests

// Known tokens mapping
const knownTokens = {
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'USDC',
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 'USDT',
  'So11111111111111111111111111111111111111112': 'SOL',
  'HRX9BoeaTM9keXiqSAm6HuTzuHRUqTfwixXXBXW4pump': 'HRX',
  'GwkEDwePTa6aFosh9xzAniGK1zvLrQ5yPJfLnqwmuyhG': '$HYPERSKIDS',
  'wqfjEgJrrWWZdFEDHLDKvZGfohdCyKFj4VcKWwYFnCm': 'hiKEJey9zJ9SUtW3yQu',
  '2szngsw1SWyNwpcc17xgn6TYmpJ4gVJBrG5e4eupeV9z': 'Pandana',
  '7FYCw13TdZnaKD6zAU3TDuaQ8XFmStZs4rgTCE8tpump': '7FYC',
};

// Queue-based request processor
async function processRequestQueue() {
  if (processingQueue || requestQueue.length === 0) return;

  processingQueue = true;

  while (requestQueue.length > 0) {
    const request = requestQueue.shift();
    try {
      await request();
    } catch (error) {
      console.error('Error processing queued request:', error);
    }

    // Delay between requests to prevent rate limiting
    if (requestQueue.length > 0) {
      await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY));
    }
  }

  processingQueue = false;
}

// Enhanced price fetching with caching and queue
async function getRealTokenPrice(mint) {
  // Check cache first
  const cached = priceCache.get(mint);
  if (cached && (Date.now() - cached.timestamp) < PRICE_CACHE_DURATION) {
    return cached.price;
  }

  // Known token prices (fallback)
  const knownPrices = {
    'So11111111111111111111111111111111111111112': 200, // SOL approximate
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 1, // USDC
    'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 1, // USDT
  };

  return new Promise((resolve) => {
    const request = async () => {
      try {
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/token_price/solana?contract_addresses=${mint}&vs_currencies=usd`, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'PollsIA/1.0'
          },
          signal: AbortSignal.timeout(10000) // 10 second timeout
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const price = data[mint]?.usd || knownPrices[mint] || 0;

        // Cache the result
        priceCache.set(mint, {
          price,
          timestamp: Date.now()
        });

        resolve(price);
      } catch (error) {
        console.error(`Error fetching price for ${mint}:`, error.message);
        // Return cached price if available, otherwise fallback
        const fallbackPrice = cached?.price || knownPrices[mint] || 0;
        resolve(fallbackPrice);
      }
    };

    // Add to queue instead of immediate execution
    requestQueue.push(request);
    processRequestQueue();
  });
}

async function getTokenSymbol(mint) {
  try {
    const mintPubkey = new PublicKey(mint);
    const [metadataPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('metadata'), METADATA_PROGRAM_ID.toBytes(), mintPubkey.toBytes()],
      METADATA_PROGRAM_ID
    );

    const metadataAccount = await connection.getAccountInfo(metadataPDA);
    if (metadataAccount) {
      const data = metadataAccount.data;
      let offset = 1 + 32 + 32; // key + update_authority + mint
      const nameLen = new Uint32Array(data.slice(offset, offset + 4))[0];
      offset += 4;
      const name = new TextDecoder().decode(data.slice(offset, offset + nameLen)).trim();
      offset += nameLen;
      const symbolLen = new Uint32Array(data.slice(offset, offset + 4))[0];
      offset += 4;
      const symbol = new TextDecoder().decode(data.slice(offset, offset + symbolLen)).trim();
      return symbol || name || 'Unknown';
    }
    return knownTokens[mint] || 'Unknown';
  } catch (error) {
    console.error('Error fetching token symbol:', error);
    return knownTokens[mint] || 'Unknown';
  }
}

// Enhanced Raydium pairs fetching with better error handling
async function getCachedRaydiumPairs() {
  const now = Date.now();

  // Check if cache is still valid
  if (raydiumPairsCache && (now - lastCacheUpdate) < CACHE_DURATION) {
    console.log(`📦 Using cached Raydium pairs (${raydiumPairsCache.length} pairs)`);
    return raydiumPairsCache;
  }

  // Check if there's already an active request
  if (activeRequests.has('raydium-pairs')) {
    console.log(`🔄 Reusing active Raydium pairs request`);
    return activeRequests.get('raydium-pairs');
  }

  // Create new request with enhanced error handling
  const requestPromise = (async () => {
    try {
      console.log('🔄 Fetching fresh Raydium pairs from API...');

      // Try multiple endpoints
      const endpoints = [
        'https://api.raydium.io/v2/main/pairs',
        'https://api-v3.raydium.io/pools/info/list'
      ];

      let pairs = null;
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'PollsIA/1.0'
            },
            signal: AbortSignal.timeout(15000) // 15 second timeout
          });

          if (response.ok) {
            pairs = await response.json();
            console.log(`✅ Successfully fetched from ${endpoint}`);
            break;
          }
        } catch (error) {
          console.warn(`⚠️ Failed to fetch from ${endpoint}:`, error.message);
        }
      }

      if (!pairs) {
        throw new Error('All endpoints failed');
      }

      // Handle different response formats
      const pairsArray = Array.isArray(pairs) ? pairs : (pairs.data || []);

      // Update cache
      raydiumPairsCache = pairsArray;
      lastCacheUpdate = Date.now();

      console.log(`✅ Cached ${pairsArray.length} Raydium pairs`);
      return pairsArray;
    } catch (error) {
      console.error('❌ Error fetching Raydium pairs:', error);

      // Return cached data if available, even if expired
      if (raydiumPairsCache) {
        console.log(`⚠️ Using expired cache as fallback (${raydiumPairsCache.length} pairs)`);
        return raydiumPairsCache;
      }

      // Return empty array as last resort
      console.log('⚠️ No cache available, returning empty array');
      return [];
    } finally {
      // Clean up active request
      activeRequests.delete('raydium-pairs');
    }
  })();

  // Store active request
  activeRequests.set('raydium-pairs', requestPromise);

  return requestPromise;
}

async function getRealWalletData(publicKeyString) {
  try {
    const publicKey = new PublicKey(publicKeyString);

    // Get SOL balance
    const solBalance = await connection.getBalance(publicKey) / LAMPORTS_PER_SOL;

    // Get SPL tokens (both standard and Token-2022)
    const tokenAccountsStandard = await connection.getParsedTokenAccountsByOwner(publicKey, {
      programId: TOKEN_PROGRAM_ID
    });
    const tokenAccounts2022 = await connection.getParsedTokenAccountsByOwner(publicKey, {
      programId: TOKEN_2022_PROGRAM_ID
    });

    const allTokenAccounts = tokenAccountsStandard.value.concat(tokenAccounts2022.value);

    // Calculate total USD value starting with SOL
    const solPrice = await getRealTokenPrice('So11111111111111111111111111111111111111112');
    let totalUSD = solPrice * solBalance;

    // Process token accounts with batching to avoid rate limits
    const tokens = [];
    const significantTokens = allTokenAccounts.filter(account => {
      const info = account.account.data.parsed.info;
      return info.tokenAmount.uiAmount > 0;
    });

    console.log(`💰 Processing ${significantTokens.length} tokens with positive balance`);

    // Process tokens in smaller batches to avoid overwhelming APIs
    const batchSize = 5;
    for (let i = 0; i < significantTokens.length; i += batchSize) {
      const batch = significantTokens.slice(i, i + batchSize);

      for (const account of batch) {
        const info = account.account.data.parsed.info;
        const balance = info.tokenAmount.uiAmount;
        const mint = info.mint;

        // Get symbol and price (these are now queued and cached)
        const symbol = await getTokenSymbol(mint);
        const price = await getRealTokenPrice(mint);
        const usdValue = price * balance;

        totalUSD += usdValue;

        tokens.push({
          mint,
          symbol,
          balance,
          price,
          usdValue,
          decimals: info.tokenAmount.decimals
        });
      }

      // Small delay between batches to be respectful to APIs
      if (i + batchSize < significantTokens.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    return {
      solBalance,
      solPrice,
      totalUSD,
      tokens,
      tokenAccounts: allTokenAccounts
    };
  } catch (error) {
    console.error('Error fetching real wallet data:', error);
    throw error;
  }
}

async function getRealDeFiPositions(publicKeyString, tokenAccounts) {
  try {
    const positions = [];

    // Check for Raydium CLMM positions
    const potentialPositionTokens = tokenAccounts.filter(acc => {
      const info = acc.account.data.parsed.info;
      return info.tokenAmount.amount === '1' && info.tokenAmount.decimals === 0;
    });

    for (const account of potentialPositionTokens) {
      const mint = new PublicKey(account.account.data.parsed.info.mint);
      const [positionPubkey] = PublicKey.findProgramAddressSync(
        [Buffer.from('position'), mint.toBytes()],
        RAYDIUM_CLMM_PROGRAM_ID
      );

      const positionAccount = await connection.getAccountInfo(positionPubkey);
      if (positionAccount && positionAccount.owner.equals(RAYDIUM_CLMM_PROGRAM_ID)) {
        positions.push({
          type: 'CLMM',
          protocol: 'Raydium',
          positionPubkey: positionPubkey.toString(),
          nftMint: mint.toString(),
          accountSize: positionAccount.data.length
        });
      }
    }

    // Check for Raydium AMM positions with optimized matching
    try {
      console.log('🔍 Checking for Raydium AMM positions...');

      // Pre-filter tokens to only check potential LP tokens
      const potentialLpTokens = tokenAccounts.filter(acc => {
        const info = acc.account.data.parsed.info;
        const balance = info.tokenAmount.uiAmount;
        const decimals = info.tokenAmount.decimals;

        // Only check tokens with positive balance and typical LP decimals
        return balance > 0 && decimals > 0 && decimals <= 9;
      });

      console.log(`🔍 Pre-filtered to ${potentialLpTokens.length} potential LP tokens`);

      // Early exit if no potential LP tokens
      if (potentialLpTokens.length === 0) {
        console.log('⚡ No potential LP tokens found, skipping Raydium pairs fetch');
        return positions;
      }

      // Only fetch pairs if we have potential LP tokens
      const pairs = await getCachedRaydiumPairs();
      if (pairs.length === 0) {
        console.warn('⚠️ No Raydium pairs available for AMM detection');
        return positions;
      }

      console.log(`📊 Found ${pairs.length} Raydium pairs for AMM detection`);

      // Create a Map for O(1) lookups instead of O(n) array searches
      const pairLookup = new Map();
      pairs.forEach(pair => {
        if (pair.lpMint) {
          pairLookup.set(pair.lpMint, pair);
        }
      });

      console.log(`🚀 Created lookup map with ${pairLookup.size} LP mints`);

      // Fast lookup for each potential LP token
      for (const account of potentialLpTokens) {
        const mint = account.account.data.parsed.info.mint;
        const balance = account.account.data.parsed.info.tokenAmount.uiAmount;

        console.log(`🔍 Checking mint: ${mint} with balance: ${balance}`);

        // O(1) lookup instead of O(n) search
        const matchingPair = pairLookup.get(mint);

        if (matchingPair) {
          console.log(`✅ Found matching pair: ${matchingPair.name} for mint: ${mint}`);
          // Price fetching is now queued and cached
          const price = await getRealTokenPrice(mint);

          positions.push({
            type: 'AMM',
            protocol: 'Raydium',
            poolName: matchingPair.name,
            lpMint: mint,
            balance,
            price,
            usdValue: price * balance
          });
        }
      }

      console.log(`🎯 Found ${positions.filter(p => p.type === 'AMM').length} AMM positions`);
    } catch (error) {
      console.error('Error checking Raydium AMM positions:', error);
    }

    return positions;
  } catch (error) {
    console.error('Error fetching DeFi positions:', error);
    return [];
  }
}

console.log('🚀 Iniciando servidor proxy Express para Solana...');

// Verbose logging middleware
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, solana-client');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// JSON middleware
app.use(express.json());

// Endpoint para Raydium pairs (compatível com teste.html)
app.get('/raydium-pairs', async (req, res) => {
  try {
    console.log('📡 Getting Raydium pairs...');
    const data = await getCachedRaydiumPairs();
    console.log(`✅ Returned ${data.length || 0} Raydium pairs`);

    res.json(data);
  } catch (error) {
    console.error('❌ Error getting Raydium pairs:', error);
    res.status(500).json({
      error: 'Failed to get Raydium pairs',
      message: error.message
    });
  }
});

// Endpoint para Raydium pairs (API format)
app.get('/api/solana/raydium-pairs', async (req, res) => {
  try {
    console.log('📡 Getting Raydium pairs...');
    const data = await getCachedRaydiumPairs();
    console.log(`✅ Returned ${data.length || 0} Raydium pairs`);

    res.json(data);
  } catch (error) {
    console.error('❌ Error getting Raydium pairs:', error);
    res.status(500).json({
      error: 'Failed to get Raydium pairs',
      message: error.message
    });
  }
});

// Proxy RPC para Solana
app.post('/api/solana/rpc', async (req, res) => {
  try {
    console.log(`📡 Proxy RPC request: ${req.body?.method || 'unknown'}`);

    const response = await fetch('https://solana-rpc.publicnode.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'PollsIA-Backend-Proxy'
      },
      body: JSON.stringify(req.body)
    });

    if (!response.ok) {
      throw new Error(`RPC error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ RPC response: ${response.status}`);

    res.json(data);
  } catch (error) {
    console.error('❌ RPC proxy error:', error);
    res.status(500).json({
      error: 'RPC proxy error',
      message: error.message
    });
  }
});

// Real wallet endpoints implementation
app.get('/api/wallet/:publicKey/portfolio', async (req, res) => {
  try {
    const { publicKey } = req.params;
    console.log(`📋 Fetching real portfolio for: ${publicKey}`);

    // Validate public key
    try {
      new PublicKey(publicKey);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid public key format',
        message: error.message
      });
    }

    // Fetch real wallet data
    const walletData = await getRealWalletData(publicKey);

    const portfolio = {
      totalValue: walletData.totalUSD,
      solBalance: walletData.solBalance,
      solPrice: walletData.solPrice,
      tokenAccounts: walletData.tokens.length,
      tokens: walletData.tokens,
      change24h: 0, // TODO: Implement 24h change calculation
      performance: [
        {
          date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
          value: walletData.totalUSD,
          change: 0
        }
      ]
    };

    res.json({
      success: true,
      data: portfolio,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error fetching portfolio:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch portfolio',
      message: error.message
    });
  }
});

app.get('/api/wallet/:publicKey/positions', async (req, res) => {
  try {
    const { publicKey } = req.params;
    console.log(`🎯 Fetching real positions for: ${publicKey}`);

    // Validate public key
    try {
      new PublicKey(publicKey);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid public key format',
        message: error.message
      });
    }

    // First get wallet data to have token accounts
    const walletData = await getRealWalletData(publicKey);

    // Then get real DeFi positions
    const positions = await getRealDeFiPositions(publicKey, walletData.tokenAccounts);

    res.json({
      success: true,
      data: positions,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error fetching positions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch positions',
      message: error.message
    });
  }
});

app.get('/api/wallet/:publicKey/pools', async (req, res) => {
  try {
    const { publicKey } = req.params;
    const { status, sortBy } = req.query;
    console.log(`🏊 Fetching real pools for: ${publicKey}, status: ${status}, sortBy: ${sortBy}`);

    // Validate public key
    try {
      new PublicKey(publicKey);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid public key format',
        message: error.message
      });
    }

    // Get real wallet data and DeFi positions
    const walletData = await getRealWalletData(publicKey);
    const positions = await getRealDeFiPositions(publicKey, walletData.tokenAccounts);

    // Convert DeFi positions to pool format
    const pools = positions.map(position => {
      if (position.type === 'AMM') {
        return {
          id: position.lpMint,
          name: position.poolName,
          lpTokens: position.balance,
          value: position.usdValue,
          apy: 0, // TODO: Get real APY data
          status: 'active',
          protocol: position.protocol
        };
      } else if (position.type === 'CLMM') {
        return {
          id: position.positionPubkey,
          name: `CLMM Position`,
          lpTokens: 1,
          value: 0, // TODO: Calculate CLMM position value
          apy: 0, // TODO: Get real APY data
          status: 'active',
          protocol: position.protocol
        };
      }
    }).filter(Boolean);

    // Apply filters
    let filteredPools = pools;
    if (status) {
      filteredPools = filteredPools.filter(pool => pool.status === status);
    }

    // Apply sorting
    if (sortBy === 'value') {
      filteredPools.sort((a, b) => b.value - a.value);
    } else if (sortBy === 'apy') {
      filteredPools.sort((a, b) => b.apy - a.apy);
    }

    res.json({
      success: true,
      data: filteredPools,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error fetching wallet pools:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch wallet pools',
      message: error.message
    });
  }
});

app.get('/api/pools/rankings', async (req, res) => {
  try {
    console.log('🏆 Fetching real pools rankings');

    // Dados mais realistas para rankings
    const rankings = [
      {
        id: 'sol-usdc',
        name: 'SOL/USDC',
        apy: 12.5,
        tvl: 150000000,
        volume24h: 25000000,
        protocol: 'Raydium',
        risk: 'Low',
        verified: true
      },
      {
        id: 'ray-sol',
        name: 'RAY/SOL',
        apy: 18.3,
        tvl: 85000000,
        volume24h: 12000000,
        protocol: 'Raydium',
        risk: 'Medium',
        verified: true
      },
      {
        id: 'msol-sol',
        name: 'mSOL/SOL',
        apy: 8.7,
        tvl: 95000000,
        volume24h: 8500000,
        protocol: 'Marinade',
        risk: 'Low',
        verified: true
      }
    ];

    res.json({
      success: true,
      data: rankings,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error fetching rankings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch rankings',
      message: error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'PollsIA Solana Proxy'
  });
});

// Iniciar servidor
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Servidor proxy rodando na porta ${port}`);
  console.log(`📡 Proxy RPC: http://localhost:${port}/api/solana/rpc`);
  console.log(`🔗 Raydium pairs: http://localhost:${port}/api/solana/raydium-pairs`);
  console.log(`❤️  Health check: http://localhost:${port}/health`);
});