export interface PerformanceData {
  totalReturn: number;
  alpha: number;
  sharpeRatio: number;
  maxDrawdown: number;
  timeframe: string;
  history: Array<{
    date: string;
    value: number;
  }>;
}

export interface MarketOverview {
  totalTvl: number;
  averageApy: number;
  topPools: Array<{
    protocol: string;
    tvl: number;
    pools: number;
  }>;
  marketTrends: {
    tvlChange24h: number;
    volumeChange24h: number;
    newPools24h: number;
  };
}

export interface Opportunity {
  poolId: string;
  protocol: string;
  tokenA: string;
  tokenB: string;
  estimatedApy: number;
  riskScore: number;
  confidence: number;
  reason: string;
}

export interface OverviewStats {
  totalValueLocked: number;
  totalPools: number;
  dailyVolume: number;
  tvlChange: number;
  volumeChange: number;
  topPerformingPools: Array<{
    id: string;
    tokenA: string;
    tokenB: string;
    apy: number;
    tvl: number;
    volume24h: number;
    change24h: number;
  }>;
  protocolDistribution: Array<{
    protocol: string;
    percentage: number;
    tvl: number;
  }>;
}