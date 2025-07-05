import { z } from 'zod'
import { BaseService } from '../base.service'
import { PaginatedResponse } from '../types/api.types'
import { 
  AddLiquidityRequest, 
  CreatePoolRequest, 
  GetPoolsQuery, 
  Pool, 
  PoolHistory,
  PoolPosition,
  PoolStats,
  RemoveLiquidityRequest
} from '../types/pool.types'

// Validation schemas
const CreatePoolSchema = z.object({
  tokenAAddress: z.string().min(1, 'Token A address is required'),
  tokenBAddress: z.string().min(1, 'Token B address is required'),
  initialLiquidityA: z.number().positive('Initial liquidity A must be positive'),
  initialLiquidityB: z.number().positive('Initial liquidity B must be positive'),
  fee: z.number().min(0).max(1, 'Fee must be between 0 and 1'),
})

const AddLiquiditySchema = z.object({
  poolAddress: z.string().min(1, 'Pool address is required'),
  tokenAAmount: z.number().positive('Token A amount must be positive'),
  tokenBAmount: z.number().positive('Token B amount must be positive'),
  slippage: z.number().min(0).max(1, 'Slippage must be between 0 and 1'),
})

export class PoolService extends BaseService {
  constructor() {
    super('/api/pools')
  }

  /**
   * Busca pools com filtros e paginação
   */
  async getPools(query: GetPoolsQuery = {}): Promise<PaginatedResponse<Pool>> {
    const queryParams = this.buildQueryParams({
      page: query.page || 1,
      limit: query.limit || 20,
      search: query.search,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      minTvl: query.minTvl,
      maxTvl: query.maxTvl,
      minApr: query.minApr,
      maxApr: query.maxApr
    })
    
    return this.getCached(
      `pools_${JSON.stringify(query)}`,
      () => this.get<PaginatedResponse<Pool>>(queryParams),
      2 * 60 * 1000 // Cache por 2 minutos
    )
  }

  /**
   * Busca pools populares (cache mais longo)
   */
  async getPopularPools(): Promise<Pool[]> {
    return this.getCached(
      'popular_pools',
      () => this.get<Pool[]>('/popular'),
      5 * 60 * 1000 // Cache por 5 minutos
    )
  }

  /**
   * Busca pool específico por ID
   */
  async getPoolById(id: string): Promise<Pool> {
    if (!id) {
      throw new Error('Pool ID is required')
    }

    return this.getCached(
      `pool_${id}`,
      () => this.get<Pool>(`/${id}`),
      1 * 60 * 1000 // Cache por 1 minuto
    )
  }

  /**
   * Busca posições do usuário
   */
  async getUserPositions(userPublicKey: string): Promise<PoolPosition[]> {
    if (!userPublicKey) {
      throw new Error('User public key is required')
    }

    return this.get<PoolPosition[]>(`/positions/${userPublicKey}`, this.withAuth())
  }

  /**
   * Cria novo pool (requer autenticação)
   */
  async createPool(data: CreatePoolRequest): Promise<Pool> {
    const validatedData = CreatePoolSchema.parse(data)
    
    const result = await this.post<Pool>('', validatedData, this.withAuth())
    
    // Limpar cache relacionado
    this.clearCache('popular_pools')
    this.clearAllCache() // Limpar cache de listagens
    
    return result
  }

  /**
   * Adiciona liquidez a um pool (requer autenticação)
   */
  async addLiquidity(data: AddLiquidityRequest): Promise<PoolPosition> {
    const validatedData = AddLiquiditySchema.parse(data)
    
    return this.post<PoolPosition>('/add-liquidity', validatedData, this.withAuth())
  }

  /**
   * Remove liquidez de um pool (requer autenticação)
   */
  async removeLiquidity(data: RemoveLiquidityRequest): Promise<void> {
    if (!data.poolAddress) {
      throw new Error('Pool address is required')
    }

    await this.post<void>('/remove-liquidity', data, this.withAuth())
  }

  /**
   * Busca histórico de um pool
   */
  async getPoolHistory(id: string, days = 30): Promise<PoolHistory[]> {
    const queryParams = this.buildQueryParams({ days })
    
    return this.getCached(
      `pool_history_${id}_${days}`,
      () => this.get<PoolHistory[]>(`/${id}/history${queryParams}`),
      10 * 60 * 1000 // Cache por 10 minutos
    )
  }

  /**
   * Busca estatísticas de um pool
   */
  async getPoolStats(id: string): Promise<PoolStats> {
    return this.getCached(
      `pool_stats_${id}`,
      () => this.get<PoolStats>(`/${id}/stats`),
      2 * 60 * 1000 // Cache por 2 minutos
    )
  }

  /**
   * Busca pools do usuário (requer autenticação)
   */
  async getUserPools(walletAddress: string): Promise<Pool[]> {
    const queryParams = this.buildQueryParams({ wallet: walletAddress })
    
    return this.get<Pool[]>(`/user${queryParams}`, this.withAuth())
  }

  /**
   * Busca pools recomendados para um usuário
   */
  async getRecommendedPools(walletAddress: string): Promise<Pool[]> {
    const queryParams = this.buildQueryParams({ wallet: walletAddress })
    
    return this.getCached(
      `recommended_pools_${walletAddress}`,
      () => this.get<Pool[]>(`/recommended${queryParams}`),
      15 * 60 * 1000 // Cache por 15 minutos
    )
  }

  /**
   * Busca estatísticas gerais da plataforma
   */
  async getPlatformStats(): Promise<{
    totalPools: number
    totalTvl: number
    averageApy: number
    totalUsers: number
  }> {
    return this.getCached(
      'platform_stats',
      () => this.get<any>('/stats'),
      5 * 60 * 1000 // Cache por 5 minutos
    )
  }

  /**
   * Atualiza pool existente (requer autenticação)
   */
  async updatePool(id: string, updates: Partial<Pool>): Promise<Pool> {
    const result = await this.put<Pool>(`/${id}`, updates, this.withAuth())
    
    // Limpar cache específico
    this.clearCache(`pool_${id}`)
    this.clearCache('popular_pools')
    
    return result
  }

  /**
   * Remove pool (requer autenticação)
   */
  async deletePool(id: string): Promise<void> {
    await this.delete<void>(`/${id}`, this.withAuth())
    
    // Limpar cache
    this.clearCache(`pool_${id}`)
    this.clearAllCache()
  }
}