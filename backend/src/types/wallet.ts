// Tipos para integração com Solana usando padrões modernos
export interface SolanaWallet {
  address: string;
  signer: unknown; // Será tipado corretamente após instalação das dependências
  balance: number;
  tokenAccounts: TokenAccount[];
}

export interface TokenAccount {
  mint: string;
  balance: bigint;
  decimals: number;
  owner: string;
}

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
  performance: PerformanceData[];
}

export interface PerformanceData {
  date: string;
  value: number;
  change: number;
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