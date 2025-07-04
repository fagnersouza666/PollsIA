export interface Pool {
  id: string;
  address: string;
  name: string;
  tokenA: Token;
  tokenB: Token;
  liquidity: number;
  volume24h: number;
  fees24h: number;
  apr: number;
  tvl: number;
  price: number;
  priceChange24h: number;
  createdAt: string;
  updatedAt: string;
}

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  price?: number;
}

export interface PoolPosition {
  id: string;
  poolId: string;
  pool: Pool;
  userPublicKey: string;
  liquidityAmount: number;
  tokenAAmount: number;
  tokenBAmount: number;
  sharePercentage: number;
  value: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePoolRequest {
  tokenAAddress: string;
  tokenBAddress: string;
  initialLiquidityA: number;
  initialLiquidityB: number;
  fee: number;
}

export interface AddLiquidityRequest {
  poolAddress: string;
  tokenAAmount: number;
  tokenBAmount: number;
  slippage: number;
}

export interface RemoveLiquidityRequest {
  poolAddress: string;
  liquidityAmount: number;
  minimumTokenAAmount: number;
  minimumTokenBAmount: number;
}

export interface GetPoolsQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'tvl' | 'volume' | 'apr' | 'fees';
  sortOrder?: 'asc' | 'desc';
  minTvl?: number;
  maxTvl?: number;
  minApr?: number;
  maxApr?: number;
}