import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/types';
import { Result } from '../../shared/result';
import { Logger } from '../../shared/interfaces/logger.interface';
import { 
  PoolRepository, 
  PoolFilters, 
  PoolSortOptions, 
  PaginationOptions,
  PaginatedResult 
} from '../../domain/repositories/pool.repository';
import { Pool } from '../../domain/entities/pool.entity';
import { InternalServerError } from '../../shared/errors';

export interface GetPoolsQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'tvl' | 'volume24h' | 'apr' | 'fees24h' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  minTvl?: number;
  maxTvl?: number;
  minApr?: number;
  maxApr?: number;
  activeOnly?: boolean;
}

@injectable()
export class GetPoolsUseCase {
  constructor(
    @inject(TYPES.PoolRepository) private poolRepository: PoolRepository,
    @inject(TYPES.Logger) private logger: Logger
  ) {}

  async execute(query: GetPoolsQuery = {}): Promise<Result<PaginatedResult<Pool>, Error>> {
    this.logger.info('Fetching pools', { query });

    try {
      // Prepare filters
      const filters: PoolFilters = {
        search: query.search,
        minTvl: query.minTvl,
        maxTvl: query.maxTvl,
        minApr: query.minApr,
        maxApr: query.maxApr,
        isActive: query.activeOnly,
      };

      // Prepare sorting
      const sort: PoolSortOptions = {
        field: query.sortBy || 'tvl',
        direction: query.sortOrder || 'desc',
      };

      // Prepare pagination
      const pagination: PaginationOptions = {
        page: query.page || 1,
        limit: Math.min(query.limit || 20, 100), // Max 100 items per page
      };

      // Fetch pools
      const result = await this.poolRepository.findAll(filters, sort, pagination);

      this.logger.info('Pools fetched successfully', {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        filters,
        sort,
      });

      return Result.success(result);

    } catch (error) {
      this.logger.error('Failed to fetch pools', error as Error);
      return Result.failure(new InternalServerError('Failed to fetch pools'));
    }
  }
}