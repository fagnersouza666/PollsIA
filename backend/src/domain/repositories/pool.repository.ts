import { Pool } from '../entities/pool.entity';

export interface PoolFilters {
  search?: string;
  minTvl?: number;
  maxTvl?: number;
  minApr?: number;
  maxApr?: number;
  isActive?: boolean;
}

export interface PoolSortOptions {
  field: 'tvl' | 'volume24h' | 'apr' | 'fees24h' | 'createdAt';
  direction: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PoolRepository {
  findById(id: string): Promise<Pool | null>;
  findByAddress(address: string): Promise<Pool | null>;
  findAll(
    filters?: PoolFilters,
    sort?: PoolSortOptions,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<Pool>>;
  save(pool: Pool): Promise<Pool>;
  update(pool: Pool): Promise<Pool>;
  delete(id: string): Promise<void>;
  count(filters?: PoolFilters): Promise<number>;
  findHighPerformingPools(limit?: number): Promise<Pool[]>;
  findByTokenPair(tokenA: string, tokenB: string): Promise<Pool[]>;
}