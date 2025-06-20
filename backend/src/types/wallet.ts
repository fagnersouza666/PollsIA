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
  tokens: TokenBalance[];
  positions: PoolPosition[];
}

export interface Position {
  id: string;
  poolId: string;
  protocol: string;
  tokenA: {
    symbol: string;
    amount: number;
  };
  tokenB: {
    symbol: string;
    amount: number;
  };
  lpTokens: number;
  currentValue: number;
  entryValue: number;
  pnl: number;
  pnlPercent: number;
  impermanentLoss: number;
  entryDate: string;
}