import { FastifyInstance, FastifyPluginAsync } from 'fastify';

export const walletSimpleRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Get user portfolio
  fastify.get('/wallet/:address/portfolio', async (request, reply) => {
    const { address } = request.params as { address: string };
    
    // Mock portfolio data
    return {
      success: true,
      data: {
        totalValue: 15750.85,
        totalReturn: 2250.85,
        returnPercentage: 16.7,
        positions: [
          {
            id: 'pos_1',
            poolAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
            poolName: 'SOL/USDC',
            value: 8500.50,
            amount: 125.75,
            apy: 42.3,
            pnl: 1250.50,
            pnlPercentage: 17.2
          },
          {
            id: 'pos_2', 
            poolAddress: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
            poolName: 'USDC/USDT',
            value: 4750.25,
            amount: 95.25,
            apy: 18.5,
            pnl: 650.25,
            pnlPercentage: 15.9
          },
          {
            id: 'pos_3',
            poolAddress: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
            poolName: 'RAY/SOL',
            value: 2500.10,
            amount: 45.80,
            apy: 68.5,
            pnl: 350.10,
            pnlPercentage: 16.3
          }
        ],
        chartData: generatePortfolioChart()
      },
      timestamp: new Date().toISOString()
    };
  });

  // Get user pools
  fastify.get('/wallet/:address/pools', async (request, reply) => {
    const { address } = request.params as { address: string };
    const { status, sortBy } = request.query as { status?: string; sortBy?: string };
    
    // Mock user pools
    const pools = [
      {
        id: 'pool_1',
        address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        name: 'SOL/USDC',
        tokenA: { symbol: 'SOL', name: 'Solana' },
        tokenB: { symbol: 'USDC', name: 'USD Coin' },
        userPosition: {
          value: 8500.50,
          amount: 125.75,
          share: 0.025
        },
        apy: 42.3,
        tvl: 12500000,
        volume24h: 8500000,
        status: 'active'
      },
      {
        id: 'pool_2',
        address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', 
        name: 'USDC/USDT',
        tokenA: { symbol: 'USDC', name: 'USD Coin' },
        tokenB: { symbol: 'USDT', name: 'Tether USD' },
        userPosition: {
          value: 4750.25,
          amount: 95.25,
          share: 0.015
        },
        apy: 18.5,
        tvl: 25000000,
        volume24h: 15000000,
        status: 'active'
      }
    ];

    let filteredPools = pools;
    if (status) {
      filteredPools = pools.filter(pool => pool.status === status);
    }

    if (sortBy === 'value') {
      filteredPools.sort((a, b) => b.userPosition.value - a.userPosition.value);
    } else if (sortBy === 'apy') {
      filteredPools.sort((a, b) => b.apy - a.apy);
    }

    return {
      success: true,
      data: filteredPools,
      timestamp: new Date().toISOString()
    };
  });
};

function generatePortfolioChart() {
  const data = [];
  const days = 30;
  let value = 13500;

  for (let i = 0; i < days; i++) {
    value += (Math.random() - 0.3) * 500;
    data.push({
      date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toISOString(),
      value: Math.round(value)
    });
  }

  return data;
}