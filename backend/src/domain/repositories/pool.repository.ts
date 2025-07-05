import { Pool } from '../entities/pool.entity';
import { Result } from '../../shared/result';
import { DomainError } from '../../shared/errors/domain.errors';

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

export interface IPoolRepository {
  findById(id: string): Promise<Result<Pool | null, DomainError>>;
  findByAddress(address: string): Promise<Result<Pool | null, DomainError>>;
  findAll(
    filters?: PoolFilters,
    sort?: PoolSortOptions,
    pagination?: PaginationOptions
  ): Promise<Result<PaginatedResult<Pool>, DomainError>>;
  save(pool: Pool): Promise<Result<Pool, DomainError>>;
  update(pool: Pool): Promise<Result<Pool, DomainError>>;
  delete(id: string): Promise<Result<void, DomainError>>;
  count(filters?: PoolFilters): Promise<Result<number, DomainError>>;
  findHighPerformingPools(limit?: number): Promise<Result<Pool[], DomainError>>;
  findByTokenPair(tokenA: string, tokenB: string): Promise<Result<Pool[], DomainError>>;
}

// Legacy interface for backward compatibility
export interface PoolRepository extends IPoolRepository { }