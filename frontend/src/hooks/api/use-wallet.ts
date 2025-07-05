import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Portfolio, Position, Transaction, WalletInfo, WalletService } from '@/services/api/wallet.service'

// Service instance
const walletService = new WalletService()

// Query keys
export const walletKeys = {
  all: ['wallet'] as const,
  info: (address: string) => [...walletKeys.all, 'info', address] as const,
  portfolio: (address: string) => [...walletKeys.all, 'portfolio', address] as const,
  positions: (address: string) => [...walletKeys.all, 'positions', address] as const,
  transactions: (address: string, filters?: any) => [...walletKeys.all, 'transactions', address, filters] as const,
  transaction: (hash: string) => [...walletKeys.all, 'transaction', hash] as const,
  tokens: (address: string) => [...walletKeys.all, 'tokens', address] as const,
  prices: (addresses: string[]) => [...walletKeys.all, 'prices', addresses] as const,
}

/**
 * Hook para buscar informações da carteira
 */
export function useWalletInfo(address: string) {
  return useQuery({
    queryKey: walletKeys.info(address),
    queryFn: () => walletService.getWalletInfo(address),
    enabled: !!address,
    staleTime: 30 * 1000, // 30 segundos
    refetchInterval: 30 * 1000, // Refetch a cada 30 segundos
  })
}

/**
 * Hook para buscar portfolio do usuário
 */
export function usePortfolio(address: string) {
  return useQuery({
    queryKey: walletKeys.portfolio(address),
    queryFn: () => walletService.getPortfolio(address),
    enabled: !!address,
    staleTime: 1 * 60 * 1000, // 1 minuto
    refetchInterval: 1 * 60 * 1000, // Refetch a cada 1 minuto
  })
}

/**
 * Hook para buscar posições do usuário
 */
export function usePositions(address: string) {
  return useQuery({
    queryKey: walletKeys.positions(address),
    queryFn: () => walletService.getPositions(address),
    enabled: !!address,
    staleTime: 1 * 60 * 1000, // 1 minuto
    refetchInterval: 2 * 60 * 1000, // Refetch a cada 2 minutos
  })
}

/**
 * Hook para buscar transações do usuário
 */
export function useTransactions(
  address: string,
  filters?: {
    type?: Transaction['type']
    limit?: number
    offset?: number
  }
) {
  return useQuery({
    queryKey: walletKeys.transactions(address, filters),
    queryFn: () => walletService.getTransactions(address, filters),
    enabled: !!address,
    staleTime: 2 * 60 * 1000, // 2 minutos
  })
}

/**
 * Hook para buscar transação específica
 */
export function useTransaction(hash: string) {
  return useQuery({
    queryKey: walletKeys.transaction(hash),
    queryFn: () => walletService.getTransaction(hash),
    enabled: !!hash,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

/**
 * Hook para buscar tokens disponíveis
 */
export function useAvailableTokens(address: string) {
  return useQuery({
    queryKey: walletKeys.tokens(address),
    queryFn: () => walletService.getAvailableTokens(address),
    enabled: !!address,
    staleTime: 2 * 60 * 1000, // 2 minutos
  })
}

/**
 * Hook para buscar preços de tokens
 */
export function useTokenPrices(addresses: string[]) {
  return useQuery({
    queryKey: walletKeys.prices(addresses),
    queryFn: () => walletService.getTokenPrices(addresses),
    enabled: addresses.length > 0,
    staleTime: 1 * 60 * 1000, // 1 minuto
    refetchInterval: 1 * 60 * 1000, // Refetch a cada 1 minuto
  })
}

/**
 * Hook para conectar carteira
 */
export function useConnectWallet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ address, signature }: { address: string; signature: string }) =>
      walletService.connectWallet(address, signature),
    onSuccess: (data, variables) => {
      // Salvar token no localStorage
      localStorage.setItem('pollsia_auth', JSON.stringify({
        token: data.token,
        walletAddress: variables.address,
        connectedAt: data.user.connectedAt
      }))

      // Invalidar dados da carteira para forçar refetch
      queryClient.invalidateQueries({ 
        queryKey: walletKeys.info(variables.address) 
      })
      queryClient.invalidateQueries({ 
        queryKey: walletKeys.portfolio(variables.address) 
      })
    },
    onError: (error) => {
      console.error('Failed to connect wallet:', error)
    },
  })
}

/**
 * Hook para desconectar carteira
 */
export function useDisconnectWallet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => walletService.disconnectWallet(),
    onSuccess: () => {
      // Limpar localStorage
      localStorage.removeItem('pollsia_auth')
      
      // Limpar todo o cache do React Query
      queryClient.clear()
    },
    onError: (error) => {
      console.error('Failed to disconnect wallet:', error)
    },
  })
}

/**
 * Hook para atualizar dados da carteira
 */
export function useRefreshWallet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (address: string) => walletService.refreshWallet(address),
    onSuccess: (data, address) => {
      // Atualizar cache com novos dados
      queryClient.setQueryData(walletKeys.info(address), data)
      
      // Invalidar dados relacionados
      queryClient.invalidateQueries({ 
        queryKey: walletKeys.portfolio(address) 
      })
      queryClient.invalidateQueries({ 
        queryKey: walletKeys.positions(address) 
      })
      queryClient.invalidateQueries({ 
        queryKey: walletKeys.tokens(address) 
      })
    },
  })
}

/**
 * Hook para estimar taxas
 */
export function useEstimateFees() {
  return useMutation({
    mutationFn: (params: {
      type: 'swap' | 'add_liquidity' | 'remove_liquidity'
      fromToken?: string
      toToken?: string
      amount?: number
      poolId?: string
    }) => walletService.estimateFees(params),
  })
}

/**
 * Hook para validar endereço
 */
export function useValidateAddress() {
  return useMutation({
    mutationFn: (address: string) => walletService.validateAddress(address),
  })
}

/**
 * Hook para invalidar cache da carteira
 */
export function useInvalidateWallet() {
  const queryClient = useQueryClient()

  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: walletKeys.all }),
    invalidateInfo: (address: string) => 
      queryClient.invalidateQueries({ queryKey: walletKeys.info(address) }),
    invalidatePortfolio: (address: string) => 
      queryClient.invalidateQueries({ queryKey: walletKeys.portfolio(address) }),
    invalidatePositions: (address: string) => 
      queryClient.invalidateQueries({ queryKey: walletKeys.positions(address) }),
    invalidateTransactions: (address: string) => 
      queryClient.invalidateQueries({ queryKey: walletKeys.transactions(address) }),
    invalidateTokens: (address: string) => 
      queryClient.invalidateQueries({ queryKey: walletKeys.tokens(address) }),
  }
}

/**
 * Hook combinado para dados principais da carteira
 */
export function useWalletData(address: string) {
  const walletInfo = useWalletInfo(address)
  const portfolio = usePortfolio(address)
  const positions = usePositions(address)

  return {
    walletInfo,
    portfolio,
    positions,
    isLoading: walletInfo.isLoading || portfolio.isLoading || positions.isLoading,
    isError: walletInfo.isError || portfolio.isError || positions.isError,
    error: walletInfo.error || portfolio.error || positions.error,
  }
}