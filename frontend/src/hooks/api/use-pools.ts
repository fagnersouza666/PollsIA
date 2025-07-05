import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PoolService } from '@/services/api/pool.service'
import { AddLiquidityRequest, CreatePoolRequest, GetPoolsQuery, Pool, RemoveLiquidityRequest } from '@/services/types/pool.types'
import { PaginatedResponse } from '@/services/types/api.types'

// Service instance
const poolService = new PoolService()

// Query keys
export const poolKeys = {
  all: ['pools'] as const,
  lists: () => [...poolKeys.all, 'list'] as const,
  list: (filters: GetPoolsQuery) => [...poolKeys.lists(), filters] as const,
  details: () => [...poolKeys.all, 'detail'] as const,
  detail: (id: string) => [...poolKeys.details(), id] as const,
  popular: () => [...poolKeys.all, 'popular'] as const,
  stats: (id: string) => [...poolKeys.all, 'stats', id] as const,
  history: (id: string, days: number) => [...poolKeys.all, 'history', id, days] as const,
  userPools: (address: string) => [...poolKeys.all, 'user', address] as const,
  recommended: (address: string) => [...poolKeys.all, 'recommended', address] as const,
  platform: () => [...poolKeys.all, 'platform'] as const,
}

/**
 * Hook para buscar pools com filtros e paginação
 */
export function usePools(query: GetPoolsQuery = {}) {
  return useQuery({
    queryKey: poolKeys.list(query),
    queryFn: () => poolService.getPools(query),
    staleTime: 2 * 60 * 1000, // 2 minutos
    placeholderData: (previousData) => previousData,
  })
}

/**
 * Hook para buscar pools populares
 */
export function usePopularPools() {
  return useQuery({
    queryKey: poolKeys.popular(),
    queryFn: () => poolService.getPopularPools(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

/**
 * Hook para buscar um pool específico
 */
export function usePool(id: string) {
  return useQuery({
    queryKey: poolKeys.detail(id),
    queryFn: () => poolService.getPoolById(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minuto
  })
}

/**
 * Hook para buscar estatísticas de um pool
 */
export function usePoolStats(id: string) {
  return useQuery({
    queryKey: poolKeys.stats(id),
    queryFn: () => poolService.getPoolStats(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutos
  })
}

/**
 * Hook para buscar histórico de um pool
 */
export function usePoolHistory(id: string, days = 30) {
  return useQuery({
    queryKey: poolKeys.history(id, days),
    queryFn: () => poolService.getPoolHistory(id, days),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutos
  })
}

/**
 * Hook para buscar pools do usuário
 */
export function useUserPools(address: string) {
  return useQuery({
    queryKey: poolKeys.userPools(address),
    queryFn: () => poolService.getUserPools(address),
    enabled: !!address,
    staleTime: 1 * 60 * 1000, // 1 minuto
  })
}

/**
 * Hook para buscar pools recomendados
 */
export function useRecommendedPools(address: string) {
  return useQuery({
    queryKey: poolKeys.recommended(address),
    queryFn: () => poolService.getRecommendedPools(address),
    enabled: !!address,
    staleTime: 15 * 60 * 1000, // 15 minutos
  })
}

/**
 * Hook para buscar estatísticas da plataforma
 */
export function usePlatformStats() {
  return useQuery({
    queryKey: poolKeys.platform(),
    queryFn: () => poolService.getPlatformStats(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

/**
 * Hook para criar um novo pool
 */
export function useCreatePool() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePoolRequest) => poolService.createPool(data),
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: poolKeys.lists() })
      queryClient.invalidateQueries({ queryKey: poolKeys.popular() })
      queryClient.invalidateQueries({ queryKey: poolKeys.platform() })
    },
    onError: (error) => {
      console.error('Failed to create pool:', error)
    },
  })
}

/**
 * Hook para atualizar um pool
 */
export function useUpdatePool() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Pool> }) =>
      poolService.updatePool(id, updates),
    onSuccess: (data, variables) => {
      // Atualizar cache específico
      queryClient.setQueryData(poolKeys.detail(variables.id), data)
      // Invalidar listas
      queryClient.invalidateQueries({ queryKey: poolKeys.lists() })
      queryClient.invalidateQueries({ queryKey: poolKeys.popular() })
    },
  })
}

/**
 * Hook para deletar um pool
 */
export function useDeletePool() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => poolService.deletePool(id),
    onSuccess: (_, id) => {
      // Remover do cache
      queryClient.removeQueries({ queryKey: poolKeys.detail(id) })
      // Invalidar listas
      queryClient.invalidateQueries({ queryKey: poolKeys.lists() })
      queryClient.invalidateQueries({ queryKey: poolKeys.popular() })
    },
  })
}

/**
 * Hook para adicionar liquidez
 */
export function useAddLiquidity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AddLiquidityRequest) => poolService.addLiquidity(data),
    onSuccess: (_, variables) => {
      // Invalidar dados do pool
      queryClient.invalidateQueries({ 
        queryKey: poolKeys.detail(variables.poolAddress) 
      })
      // Invalidar posições do usuário
      queryClient.invalidateQueries({ 
        queryKey: ['pools', 'user']
      })
    },
  })
}

/**
 * Hook para remover liquidez
 */
export function useRemoveLiquidity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RemoveLiquidityRequest) => poolService.removeLiquidity(data),
    onSuccess: (_, variables) => {
      // Invalidar dados do pool
      queryClient.invalidateQueries({ 
        queryKey: poolKeys.detail(variables.poolAddress) 
      })
      // Invalidar posições do usuário
      queryClient.invalidateQueries({ 
        queryKey: ['pools', 'user']
      })
    },
  })
}

/**
 * Hook para invalidar cache de pools
 */
export function useInvalidatePools() {
  const queryClient = useQueryClient()

  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: poolKeys.all }),
    invalidateLists: () => queryClient.invalidateQueries({ queryKey: poolKeys.lists() }),
    invalidatePool: (id: string) => queryClient.invalidateQueries({ queryKey: poolKeys.detail(id) }),
    invalidatePopular: () => queryClient.invalidateQueries({ queryKey: poolKeys.popular() }),
    invalidateUserPools: (address: string) => 
      queryClient.invalidateQueries({ queryKey: poolKeys.userPools(address) }),
  }
}