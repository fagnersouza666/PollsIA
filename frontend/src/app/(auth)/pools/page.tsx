import { Suspense } from 'react';
import type { Metadata } from 'next';
import { PoolExplorer } from '@/components/PoolExplorer';
import PoolsLoading from './loading';

export const metadata: Metadata = {
  title: 'Pools - Explore DeFi Liquidity Pools',
  description: 'Descubra e explore pools de liquidez DeFi na blockchain Solana. Encontre as melhores oportunidades de yield farming e staking.',
  openGraph: {
    title: 'Pools - PollsIA',
    description: 'Descubra e explore pools de liquidez DeFi na blockchain Solana.',
    images: ['/og-pools.png'],
  },
};

// Server Component - fetches data on the server
async function getPoolsData() {
  try {
    // In a real app, this would fetch from your API
    // For now, we'll return mock data
    const pools = [
      {
        id: '1',
        name: 'SOL/USDC',
        tokenA: 'SOL',
        tokenB: 'USDC',
        tvl: 1250000,
        apr: 0.125,
        volume24h: 850000,
        fees24h: 2500,
        isActive: true,
      },
      {
        id: '2',
        name: 'RAY/SOL',
        tokenA: 'RAY',
        tokenB: 'SOL',
        tvl: 890000,
        apr: 0.185,
        volume24h: 420000,
        fees24h: 1800,
        isActive: true,
      },
    ];

    return { pools, error: null };
  } catch (error) {
    console.error('Failed to fetch pools:', error);
    return { pools: [], error: 'Failed to load pools' };
  }
}

// Server Component
async function PoolsList() {
  const { pools, error } = await getPoolsData();

  if (error) {
    throw new Error(error);
  }

  return <PoolExplorer initialPools={pools} />;
}

// Main page component
export default function PoolsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Explore Pools
          </h1>
          <p className="text-muted-foreground">
            Descubra as melhores oportunidades de liquidez na blockchain Solana
          </p>
        </div>

        <Suspense fallback={<PoolsLoading />}>
          <PoolsList />
        </Suspense>
      </div>
    </div>
  );
}