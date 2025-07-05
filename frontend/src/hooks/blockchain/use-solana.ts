import { useCallback, useEffect, useState } from 'react'
import { Connection, PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js'

// Configurações da rede Solana
const NETWORK_URLS = {
  mainnet: process.env.NEXT_PUBLIC_SOLANA_MAINNET_RPC || 'https://api.mainnet-beta.solana.com',
  devnet: process.env.NEXT_PUBLIC_SOLANA_DEVNET_RPC || 'https://api.devnet.solana.com',
  testnet: 'https://api.testnet.solana.com',
}

export type SolanaNetwork = keyof typeof NETWORK_URLS

interface SolanaState {
  connection: Connection | null
  network: SolanaNetwork
  networkStatus: 'connected' | 'connecting' | 'error' | 'disconnected'
  blockHeight: number | null
  tps: number | null
  error: string | null
}

/**
 * Hook principal para interação com a rede Solana
 */
export function useSolana(initialNetwork: SolanaNetwork = 'devnet') {
  const [state, setState] = useState<SolanaState>({
    connection: null,
    network: initialNetwork,
    networkStatus: 'disconnected',
    blockHeight: null,
    tps: null,
    error: null,
  })

  // Conectar à rede Solana
  const connect = useCallback(async (network: SolanaNetwork = state.network) => {
    try {
      setState(prev => ({ ...prev, networkStatus: 'connecting', error: null }))
      
      const connection = new Connection(NETWORK_URLS[network], 'confirmed')
      
      // Testar conexão
      const blockHeight = await connection.getBlockHeight()
      
      setState(prev => ({
        ...prev,
        connection,
        network,
        networkStatus: 'connected',
        blockHeight,
      }))

      return connection
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect to Solana network'
      setState(prev => ({
        ...prev,
        networkStatus: 'error',
        error: errorMessage,
      }))
      throw error
    }
  }, [state.network])

  // Desconectar
  const disconnect = useCallback(() => {
    setState(prev => ({
      ...prev,
      connection: null,
      networkStatus: 'disconnected',
      blockHeight: null,
      tps: null,
      error: null,
    }))
  }, [])

  // Trocar rede
  const switchNetwork = useCallback(async (network: SolanaNetwork) => {
    if (network === state.network) return
    
    disconnect()
    await connect(network)
  }, [state.network, disconnect, connect])

  // Obter TPS atual
  const getTPS = useCallback(async () => {
    if (!state.connection) return null

    try {
      const samples = await state.connection.getRecentPerformanceSamples(1)
      if (samples.length > 0) {
        const tps = samples[0].numTransactions / samples[0].samplePeriodSecs
        setState(prev => ({ ...prev, tps }))
        return tps
      }
    } catch (error) {
      console.error('Failed to get TPS:', error)
    }
    return null
  }, [state.connection])

  // Atualizar altura do bloco
  const updateBlockHeight = useCallback(async () => {
    if (!state.connection) return null

    try {
      const blockHeight = await state.connection.getBlockHeight()
      setState(prev => ({ ...prev, blockHeight }))
      return blockHeight
    } catch (error) {
      console.error('Failed to get block height:', error)
    }
    return null
  }, [state.connection])

  // Auto-conectar na inicialização
  useEffect(() => {
    connect()
  }, [])

  // Atualizar dados periodicamente quando conectado
  useEffect(() => {
    if (state.networkStatus !== 'connected') return

    const interval = setInterval(async () => {
      await Promise.all([updateBlockHeight(), getTPS()])
    }, 30000) // Atualizar a cada 30 segundos

    return () => clearInterval(interval)
  }, [state.networkStatus, updateBlockHeight, getTPS])

  return {
    ...state,
    connect,
    disconnect,
    switchNetwork,
    getTPS,
    updateBlockHeight,
    isConnected: state.networkStatus === 'connected',
    isConnecting: state.networkStatus === 'connecting',
    hasError: state.networkStatus === 'error',
  }
}

/**
 * Hook para executar transações na rede Solana
 */
export function useSolanaTransaction() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendTransaction = useCallback(async (
    connection: Connection,
    transaction: Transaction | VersionedTransaction,
    signers?: any[]
  ) => {
    setIsLoading(true)
    setError(null)

    try {
      let signature: string

      if (transaction instanceof VersionedTransaction) {
        signature = await connection.sendTransaction(transaction)
      } else {
        signature = await connection.sendTransaction(transaction, signers || [])
      }

      // Aguardar confirmação
      const confirmation = await connection.confirmTransaction(signature, 'confirmed')
      
      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${confirmation.value.err}`)
      }

      setIsLoading(false)
      return { signature, confirmation }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Transaction failed'
      setError(errorMessage)
      setIsLoading(false)
      throw error
    }
  }, [])

  return {
    sendTransaction,
    isLoading,
    error,
    clearError: () => setError(null),
  }
}

/**
 * Hook para buscar informações de conta
 */
export function useAccountInfo(address: string | null, connection: Connection | null) {
  const [accountInfo, setAccountInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAccountInfo = useCallback(async () => {
    if (!address || !connection) {
      setAccountInfo(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const publicKey = new PublicKey(address)
      const info = await connection.getAccountInfo(publicKey)
      setAccountInfo(info)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch account info'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [address, connection])

  useEffect(() => {
    fetchAccountInfo()
  }, [fetchAccountInfo])

  return {
    accountInfo,
    isLoading,
    error,
    refetch: fetchAccountInfo,
  }
}

/**
 * Hook para buscar balanço SOL
 */
export function useSOLBalance(address: string | null, connection: Connection | null) {
  const [balance, setBalance] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBalance = useCallback(async () => {
    if (!address || !connection) {
      setBalance(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const publicKey = new PublicKey(address)
      const lamports = await connection.getBalance(publicKey)
      const solBalance = lamports / 1e9 // Converter lamports para SOL
      setBalance(solBalance)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch balance'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [address, connection])

  useEffect(() => {
    fetchBalance()
  }, [fetchBalance])

  // Atualizar balanço a cada 30 segundos
  useEffect(() => {
    if (!address || !connection) return

    const interval = setInterval(fetchBalance, 30000)
    return () => clearInterval(interval)
  }, [address, connection, fetchBalance])

  return {
    balance,
    isLoading,
    error,
    refetch: fetchBalance,
  }
}

/**
 * Hook para buscar histórico de transações
 */
export function useTransactionHistory(
  address: string | null,
  connection: Connection | null,
  limit = 10
) {
  const [transactions, setTransactions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = useCallback(async () => {
    if (!address || !connection) {
      setTransactions([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const publicKey = new PublicKey(address)
      const signatures = await connection.getSignaturesForAddress(publicKey, { limit })
      
      const transactions = await Promise.all(
        signatures.map(async (sig) => {
          try {
            const tx = await connection.getTransaction(sig.signature, {
              maxSupportedTransactionVersion: 0
            })
            return { ...sig, details: tx }
          } catch {
            return { ...sig, details: null }
          }
        })
      )

      setTransactions(transactions)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch transactions'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [address, connection, limit])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  return {
    transactions,
    isLoading,
    error,
    refetch: fetchTransactions,
  }
}