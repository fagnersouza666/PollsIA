export interface WalletConnection {
  publicKey: string;
  connected: boolean;
  balance: number;
}

export interface TokenBalance {
  symbol: string;
  balance: number;
  value: number;
}

export interface PoolPosition {
  poolId: string;
  tokenA: string;
  tokenB: string;
  value: number;
  apy: number;
  impermanentLoss: number;
}

export interface Portfolio {
  totalValue: number;
  solBalance: number;
  tokenAccounts: number;
  change24h: number;
  performance: any[];
}

export interface Position {
  poolId: string;
  tokenA: string;
  tokenB: string;
  liquidity: number;
  value: number;
  apy: number;
  entryDate: string;
}