import { Address } from '@solana/addresses';

export interface Pool {
  id: string;
  tokenA: string;
  tokenB: string;
  apy: number;
  tvl: number;
  volume24h: number;
  protocol: string;
  address?: Address;
  fees?: number;
  apr?: number;
}

export interface PoolRanking {
  rank: number;
  poolId: string;
  score: number;
  apy: number;
  riskScore: number;
  liquidityScore: number;
}

export interface PoolAnalysis {
  poolId: string;
  impermanentLoss: {
    current: number;
    predicted30d: number;
    historical: number[];
  };
  volumeAnalysis: {
    trend: 'increasing' | 'decreasing' | 'stable';
    volatility: 'low' | 'medium' | 'high';
    prediction24h: number;
  };
  riskMetrics: {
    overall: 'low' | 'medium' | 'high';
    liquidityRisk: 'low' | 'medium' | 'high';
    protocolRisk: 'low' | 'medium' | 'high';
    tokenRisk: 'low' | 'medium' | 'high';
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp?: string;
}