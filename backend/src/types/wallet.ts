import { Address } from '@solana/addresses';
import { KeyPairSigner } from '@solana/signers';

// Tipos para integração com Solana usando padrões modernos
export interface SolanaWallet {
  address: Address;
  signer: KeyPairSigner;
  balance: number;
  tokenAccounts: TokenAccount[];
}

export interface TokenAccount {
  mint: Address;
  balance: bigint;
  decimals: number;
  owner: Address;
}

export interface WalletConnection {
  publicKey: Address;
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

export interface WalletPool {
  id: string;
  tokenA: string;
  tokenB: string;
  myLiquidity: number;
  myValue: number;
  apy: number;
  entryDate: string;
  currentValue: number;
  pnl: number;
  rewardsEarned: number;
  status: 'active' | 'inactive' | 'pending';
  protocol?: string; // Nome do protocolo (Raydium, Orca, etc.)
  source?: string;   // Fonte da detecção (API, Transação, etc.)
}