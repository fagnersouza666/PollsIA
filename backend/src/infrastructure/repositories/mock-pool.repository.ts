import { injectable } from 'inversify';
import { Pool } from '../../domain/entities/pool.entity';
import {
  IPoolRepository,
  PoolFilters,
  PoolSortOptions,
  PaginationOptions,
  PaginatedResult
} from '../../domain/repositories/pool.repository';
import { Result } from '../../shared/result';
import { DomainError } from '../../shared/errors/domain.errors';

@injectable()
export class MockPoolRepository implements IPoolRepository {
  private pools: Pool[] = [];

  async findById(id: string): Promise<Result<Pool | null, DomainError>> {
    try {
      const pool = this.pools.find(pool => pool.id === id) || null;
      return Result.ok(pool);
    } catch (error) {
      return Result.fail(new DomainError('REPOSITORY_ERROR', 'Failed to find pool by id'));
    }
  }

  async findByAddress(address: string): Promise<Result<Pool | null, DomainError>> {
    try {
      const pool = this.pools.find(pool => pool.address === address) || null;
      return Result.ok(pool);
    } catch (error) {
      return Result.fail(new DomainError('REPOSITORY_ERROR', 'Failed to find pool by address'));
    }
  }

  async findAll(
    filters?: PoolFilters,
    sort?: PoolSortOptions,
    pagination?: PaginationOptions
  ): Promise<Result<PaginatedResult<Pool>, DomainError>> {
    try {
      let filteredPools = [...this.pools];

      // Apply filters
      if (filters) {
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filteredPools = filteredPools.filter(pool =>
            pool.name.toLowerCase().includes(searchLower) ||
            pool.address.toLowerCase().includes(searchLower)
          );
        }

        if (filters.minTvl !== undefined) {
          filteredPools = filteredPools.filter(pool => pool.tvl >= filters.minTvl!);
        }

        if (filters.maxTvl !== undefined) {
          filteredPools = filteredPools.filter(pool => pool.tvl <= filters.maxTvl!);
        }

        if (filters.minApr !== undefined) {
          filteredPools = filteredPools.filter(pool => pool.apr >= filters.minApr!);
        }

        if (filters.maxApr !== undefined) {
          filteredPools = filteredPools.filter(pool => pool.apr <= filters.maxApr!);
        }

        if (filters.isActive !== undefined) {
          filteredPools = filteredPools.filter(pool => pool.isActive === filters.isActive);
        }
      }

      // Apply sorting
      if (sort) {
        filteredPools.sort((a, b) => {
          let aValue: number;
          let bValue: number;

          switch (sort.field) {
            case 'tvl':
              aValue = a.tvl;
              bValue = b.tvl;
              break;
            case 'volume24h':
              aValue = a.volume24h;
              bValue = b.volume24h;
              break;
            case 'apr':
              aValue = a.apr;
              bValue = b.apr;
              break;
            case 'fees24h':
              aValue = a.fees24h;
              bValue = b.fees24h;
              break;
            case 'createdAt':
              aValue = a.createdAt.getTime();
              bValue = b.createdAt.getTime();
              break;
            default:
              return 0;
          }

          if (sort.direction === 'asc') {
            return aValue - bValue;
          } else {
            return bValue - aValue;
          }
        });
      }

      // Apply pagination
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 20;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const paginatedItems = filteredPools.slice(startIndex, endIndex);
      const total = filteredPools.length;
      const totalPages = Math.ceil(total / limit);

      const result: PaginatedResult<Pool> = {
        items: paginatedItems,
        total,
        page,
        limit,
        totalPages,
      };

      return Result.ok(result);
    } catch (error) {
      return Result.fail(new DomainError('REPOSITORY_ERROR', 'Failed to find pools'));
    }
  }

  async save(pool: Pool): Promise<Result<Pool, DomainError>> {
    try {
      this.pools.push(pool);
      return Result.ok(pool);
    } catch (error) {
      return Result.fail(new DomainError('REPOSITORY_ERROR', 'Failed to save pool'));
    }
  }

  async update(pool: Pool): Promise<Result<Pool, DomainError>> {
    try {
      const index = this.pools.findIndex(p => p.id === pool.id);
      if (index !== -1) {
        this.pools[index] = pool;
        return Result.ok(pool);
      }
      return Result.fail(new DomainError('POOL_NOT_FOUND', 'Pool not found'));
    } catch (error) {
      return Result.fail(new DomainError('REPOSITORY_ERROR', 'Failed to update pool'));
    }
  }

  async delete(id: string): Promise<Result<void, DomainError>> {
    try {
      const index = this.pools.findIndex(pool => pool.id === id);
      if (index !== -1) {
        this.pools.splice(index, 1);
        return Result.ok();
      }
      return Result.fail(new DomainError('POOL_NOT_FOUND', 'Pool not found'));
    } catch (error) {
      return Result.fail(new DomainError('REPOSITORY_ERROR', 'Failed to delete pool'));
    }
  }

  async count(filters?: PoolFilters): Promise<Result<number, DomainError>> {
    try {
      const result = await this.findAll(filters);
      if (result.isFailure) {
        return Result.fail(result.getError());
      }
      return Result.ok(result.getValue().total);
    } catch (error) {
      return Result.fail(new DomainError('REPOSITORY_ERROR', 'Failed to count pools'));
    }
  }

  async findHighPerformingPools(limit: number = 10): Promise<Result<Pool[], DomainError>> {
    try {
      const sorted = [...this.pools].sort((a, b) => b.apr - a.apr);
      return Result.ok(sorted.slice(0, limit));
    } catch (error) {
      return Result.fail(new DomainError('REPOSITORY_ERROR', 'Failed to find high performing pools'));
    }
  }

  async findByTokenPair(tokenA: string, tokenB: string): Promise<Result<Pool[], DomainError>> {
    try {
      const pools = this.pools.filter(pool =>
        (pool.tokenA === tokenA && pool.tokenB === tokenB) ||
        (pool.tokenA === tokenB && pool.tokenB === tokenA)
      );
      return Result.ok(pools);
    } catch (error) {
      return Result.fail(new DomainError('REPOSITORY_ERROR', 'Failed to find pools by token pair'));
    }
  }
}