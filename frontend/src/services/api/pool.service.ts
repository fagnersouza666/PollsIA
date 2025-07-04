import { z } from 'zod';
import { HttpClient } from './http-client';
import { ApiResponse, PaginatedResponse } from '../types/api.types';
import { 
  Pool, 
  PoolPosition, 
  CreatePoolRequest, 
  AddLiquidityRequest, 
  RemoveLiquidityRequest,
  GetPoolsQuery 
} from '../types/pool.types';
import { ValidationError, ApiError } from '../../utils/errors';

// Validation schemas
const CreatePoolSchema = z.object({
  tokenAAddress: z.string().min(1, 'Token A address is required'),
  tokenBAddress: z.string().min(1, 'Token B address is required'),
  initialLiquidityA: z.number().positive('Initial liquidity A must be positive'),
  initialLiquidityB: z.number().positive('Initial liquidity B must be positive'),
  fee: z.number().min(0).max(1, 'Fee must be between 0 and 1'),
});

const AddLiquiditySchema = z.object({
  poolAddress: z.string().min(1, 'Pool address is required'),
  tokenAAmount: z.number().positive('Token A amount must be positive'),
  tokenBAmount: z.number().positive('Token B amount must be positive'),
  slippage: z.number().min(0).max(1, 'Slippage must be between 0 and 1'),
});

export interface PoolService {
  getPools(query?: GetPoolsQuery): Promise<PaginatedResponse<Pool>>;
  getPoolById(id: string): Promise<Pool>;
  getUserPositions(userPublicKey: string): Promise<PoolPosition[]>;
  createPool(data: CreatePoolRequest): Promise<Pool>;
  addLiquidity(data: AddLiquidityRequest): Promise<PoolPosition>;
  removeLiquidity(data: RemoveLiquidityRequest): Promise<void>;
}

export class HttpPoolService implements PoolService {
  constructor(private httpClient: HttpClient) {}

  async getPools(query: GetPoolsQuery = {}): Promise<PaginatedResponse<Pool>> {
    const params = new URLSearchParams();
    
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.search) params.append('search', query.search);
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortOrder) params.append('sortOrder', query.sortOrder);
    if (query.minTvl) params.append('minTvl', query.minTvl.toString());
    if (query.maxTvl) params.append('maxTvl', query.maxTvl.toString());
    if (query.minApr) params.append('minApr', query.minApr.toString());
    if (query.maxApr) params.append('maxApr', query.maxApr.toString());

    const response = await this.httpClient.get<ApiResponse<PaginatedResponse<Pool>>>(
      `/pools?${params}`
    );

    if (!response.success) {
      throw new ApiError(
        response.error?.code || 'UNKNOWN_ERROR',
        response.error?.message || 'Failed to fetch pools'
      );
    }

    return response.data;
  }

  async getPoolById(id: string): Promise<Pool> {
    if (!id) {
      throw new ValidationError('Pool ID is required');
    }

    const response = await this.httpClient.get<ApiResponse<Pool>>(
      `/pools/${id}`
    );

    if (!response.success) {
      throw new ApiError(
        response.error?.code || 'UNKNOWN_ERROR',
        response.error?.message || 'Failed to fetch pool'
      );
    }

    return response.data;
  }

  async getUserPositions(userPublicKey: string): Promise<PoolPosition[]> {
    if (!userPublicKey) {
      throw new ValidationError('User public key is required');
    }

    const response = await this.httpClient.get<ApiResponse<PoolPosition[]>>(
      `/pools/positions/${userPublicKey}`
    );

    if (!response.success) {
      throw new ApiError(
        response.error?.code || 'UNKNOWN_ERROR',
        response.error?.message || 'Failed to fetch user positions'
      );
    }

    return response.data;
  }

  async createPool(data: CreatePoolRequest): Promise<Pool> {
    const validatedData = CreatePoolSchema.parse(data);

    const response = await this.httpClient.post<ApiResponse<Pool>>(
      '/pools',
      validatedData
    );

    if (!response.success) {
      throw new ApiError(
        response.error?.code || 'UNKNOWN_ERROR',
        response.error?.message || 'Failed to create pool'
      );
    }

    return response.data;
  }

  async addLiquidity(data: AddLiquidityRequest): Promise<PoolPosition> {
    const validatedData = AddLiquiditySchema.parse(data);

    const response = await this.httpClient.post<ApiResponse<PoolPosition>>(
      '/pools/add-liquidity',
      validatedData
    );

    if (!response.success) {
      throw new ApiError(
        response.error?.code || 'UNKNOWN_ERROR',
        response.error?.message || 'Failed to add liquidity'
      );
    }

    return response.data;
  }

  async removeLiquidity(data: RemoveLiquidityRequest): Promise<void> {
    if (!data.poolAddress) {
      throw new ValidationError('Pool address is required');
    }

    const response = await this.httpClient.post<ApiResponse<void>>(
      '/pools/remove-liquidity',
      data
    );

    if (!response.success) {
      throw new ApiError(
        response.error?.code || 'UNKNOWN_ERROR',
        response.error?.message || 'Failed to remove liquidity'
      );
    }
  }
}