import { injectable } from 'inversify';
import { Pool } from '../../domain/entities/pool.entity';
import { 
  PoolRepository, 
  PoolFilters, 
  PoolSortOptions, 
  PaginationOptions, 
  PaginatedResult 
} from '../../domain/repositories/pool.repository';

@injectable()
export class MockPoolRepository implements PoolRepository {
  private pools: Pool[] = [];

  async findById(id: string): Promise<Pool | null> {
    return this.pools.find(pool => pool.id === id) || null;
  }

  async findByAddress(address: string): Promise<Pool | null> {
    return this.pools.find(pool => pool.address === address) || null;
  }

  async findAll(
    filters?: PoolFilters,
    sort?: PoolSortOptions,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<Pool>> {
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

    return {
      items: paginatedItems,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async save(pool: Pool): Promise<Pool> {
    this.pools.push(pool);
    return pool;
  }

  async update(pool: Pool): Promise<Pool> {
    const index = this.pools.findIndex(p => p.id === pool.id);
    if (index !== -1) {
      this.pools[index] = pool;
    }
    return pool;
  }

  async delete(id: string): Promise<void> {
    const index = this.pools.findIndex(pool => pool.id === id);
    if (index !== -1) {
      this.pools.splice(index, 1);
    }
  }

  async count(filters?: PoolFilters): Promise<number> {
    const result = await this.findAll(filters);
    return result.total;
  }

  async findHighPerformingPools(limit: number = 10): Promise<Pool[]> {
    const sorted = [...this.pools].sort((a, b) => b.apr - a.apr);
    return sorted.slice(0, limit);
  }

  async findByTokenPair(tokenA: string, tokenB: string): Promise<Pool[]> {
    return this.pools.filter(pool => 
      (pool.tokenAAddress === tokenA && pool.tokenBAddress === tokenB) ||
      (pool.tokenAAddress === tokenB && pool.tokenBAddress === tokenA)
    );
  }
}