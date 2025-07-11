'use client'

import { ReactNode, createContext, useCallback, useContext, useEffect, useReducer } from 'react'
import { Connection, PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js'
import { SOLANA_RPC_URL, SUPPORTED_WALLETS } from '@/lib/constants'

// Types
interface WalletAdapter {
  name: string
  icon: string
  url: string
  readyState: 'Installed' | 'NotDetected' | 'Loadable' | 'Unsupported'
}

interface ConnectedWallet {
  adapter: WalletAdapter
  publicKey: PublicKey
  connected: boolean
  connecting: boolean
  disconnecting: boolean
  signTransaction?: (transaction: Transaction | VersionedTransaction) => Promise<Transaction | VersionedTransaction>
  signAllTransactions?: (transactions: (Transaction | VersionedTransaction)[]) => Promise<(Transaction | VersionedTransaction)[]>
  signMessage?: (message: Uint8Array) => Promise<Uint8Array>
}

interface TokenInfo {
  mint: string
  symbol: string
  balance: number
  usdValue: number
  decimals: number
}

interface DeFiPosition {
  type: 'raydium-clmm' | 'raydium-amm'
  mint: string
  balance: number
  usdValue: number
  poolName?: string
  positionAddress?: string
}

interface WalletState {
  wallet: ConnectedWallet | null
  wallets: WalletAdapter[]
  connecting: boolean
  connected: boolean
  disconnecting: boolean
  error: string | null
  balance: number | null
  connection: Connection
  tokens: TokenInfo[]
  defiPositions: DeFiPosition[]
  totalUsdValue: number
  loadingTokens: boolean
  loadingDefi: boolean
}

type WalletAction =
  | { type: 'SET_WALLETS'; payload: WalletAdapter[] }
  | { type: 'CONNECT_START' }
  | { type: 'CONNECT_SUCCESS'; payload: ConnectedWallet }
  | { type: 'CONNECT_FAILURE'; payload: string }
  | { type: 'DISCONNECT_START' }
  | { type: 'DISCONNECT_SUCCESS' }
  | { type: 'DISCONNECT_FAILURE'; payload: string }
  | { type: 'SET_BALANCE'; payload: number | null }
  | { type: 'SET_TOKENS'; payload: TokenInfo[] }
  | { type: 'SET_DEFI_POSITIONS'; payload: DeFiPosition[] }
  | { type: 'SET_TOTAL_USD_VALUE'; payload: number }
  | { type: 'SET_LOADING_TOKENS'; payload: boolean }
  | { type: 'SET_LOADING_DEFI'; payload: boolean }
  | { type: 'CLEAR_ERROR' }

interface WalletContextType {
  state: WalletState
  connect: (walletName: string) => Promise<void>
  disconnect: () => Promise<void>
  signTransaction: (transaction: Transaction | VersionedTransaction) => Promise<Transaction | VersionedTransaction>
  signAllTransactions: (transactions: (Transaction | VersionedTransaction)[]) => Promise<(Transaction | VersionedTransaction)[]>
  signMessage: (message: string) => Promise<Uint8Array>
  sendTransaction: (transaction: Transaction | VersionedTransaction) => Promise<string>
  getBalance: () => Promise<number | null>
  getTokens: () => Promise<void>
  getDeFiPositions: () => Promise<void>
  refreshWalletData: () => Promise<void>
  clearError: () => void
}

// Initial state
const initialState: WalletState = {
  wallet: null,
  wallets: [],
  connecting: false,
  connected: false,
  disconnecting: false,
  error: null,
  balance: null,
  connection: new Connection(
    process.env.NODE_ENV === 'production' 
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/solana/rpc`
      : 'https://solana-rpc.publicnode.com',
    'confirmed'
  ),
  tokens: [],
  defiPositions: [],
  totalUsdValue: 0,
  loadingTokens: false,
  loadingDefi: false,
}

// Reducer
function walletReducer(state: WalletState, action: WalletAction): WalletState {
  switch (action.type) {
    case 'SET_WALLETS':
      return {
        ...state,
        wallets: action.payload,
      }
    case 'CONNECT_START':
      return {
        ...state,
        connecting: true,
        error: null,
      }
    case 'CONNECT_SUCCESS':
      return {
        ...state,
        wallet: action.payload,
        connecting: false,
        connected: true,
        error: null,
      }
    case 'CONNECT_FAILURE':
      return {
        ...state,
        wallet: null,
        connecting: false,
        connected: false,
        error: action.payload,
      }
    case 'DISCONNECT_START':
      return {
        ...state,
        disconnecting: true,
        error: null,
      }
    case 'DISCONNECT_SUCCESS':
      return {
        ...state,
        wallet: null,
        connecting: false,
        connected: false,
        disconnecting: false,
        balance: null,
        tokens: [],
        defiPositions: [],
        totalUsdValue: 0,
        loadingTokens: false,
        loadingDefi: false,
        error: null,
      }
    case 'DISCONNECT_FAILURE':
      return {
        ...state,
        disconnecting: false,
        error: action.payload,
      }
    case 'SET_BALANCE':
      return {
        ...state,
        balance: action.payload,
      }
    case 'SET_TOKENS':
      return {
        ...state,
        tokens: action.payload,
      }
    case 'SET_DEFI_POSITIONS':
      return {
        ...state,
        defiPositions: action.payload,
      }
    case 'SET_TOTAL_USD_VALUE':
      return {
        ...state,
        totalUsdValue: action.payload,
      }
    case 'SET_LOADING_TOKENS':
      return {
        ...state,
        loadingTokens: action.payload,
      }
    case 'SET_LOADING_DEFI':
      return {
        ...state,
        loadingDefi: action.payload,
      }
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      }
    default:
      return state
  }
}

// Context
const WalletContext = createContext<WalletContextType | undefined>(undefined)

// Provider
interface WalletProviderProps {
  children: ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [state, dispatch] = useReducer(walletReducer, initialState)

  // Initialize wallets
  useEffect(() => {
    const detectWallets = () => {
      const wallets: WalletAdapter[] = []

      // Check for Phantom
      if ((window as any).phantom?.solana?.isPhantom) {
        wallets.push({
          name: 'Phantom',
          icon: '/icons/phantom.png',
          url: 'https://phantom.app',
          readyState: 'Installed',
        })
      } else {
        wallets.push({
          name: 'Phantom',
          icon: '/icons/phantom.png',
          url: 'https://phantom.app',
          readyState: 'NotDetected',
        })
      }

      // Check for Solflare
      if ((window as any).solflare?.isSolflare) {
        wallets.push({
          name: 'Solflare',
          icon: '/icons/solflare.png',
          url: 'https://solflare.com',
          readyState: 'Installed',
        })
      } else {
        wallets.push({
          name: 'Solflare',
          icon: '/icons/solflare.png',
          url: 'https://solflare.com',
          readyState: 'NotDetected',
        })
      }

      dispatch({ type: 'SET_WALLETS', payload: wallets })
    }

    detectWallets()

    // Re-detect wallets when window loads
    window.addEventListener('load', detectWallets)
    return () => window.removeEventListener('load', detectWallets)
  }, [])

  const connect = useCallback(async (walletName: string) => {
    try {
      dispatch({ type: 'CONNECT_START' })

      let walletAdapter: any = null
      let adapter: WalletAdapter | null = null

      // Get wallet adapter
      if (walletName === 'Phantom') {
        walletAdapter = (window as any).phantom?.solana
        adapter = state.wallets.find(w => w.name === 'Phantom') || null
        
        if (!walletAdapter) {
          throw new Error('Phantom wallet não encontrada. Instale a extensão.')
        }
      } else if (walletName === 'Solflare') {
        walletAdapter = (window as any).solflare
        adapter = state.wallets.find(w => w.name === 'Solflare') || null
        
        if (!walletAdapter) {
          throw new Error('Solflare wallet não encontrada. Instale a extensão.')
        }
      } else {
        throw new Error(`Wallet ${walletName} não suportada`)
      }

      if (!adapter) {
        throw new Error('Adapter da wallet não encontrado')
      }

      // Connect to wallet
      const response = await walletAdapter.connect()
      const publicKey = new PublicKey(response.publicKey.toString())

      const connectedWallet: ConnectedWallet = {
        adapter,
        publicKey,
        connected: true,
        connecting: false,
        disconnecting: false,
        signTransaction: walletAdapter.signTransaction?.bind(walletAdapter),
        signAllTransactions: walletAdapter.signAllTransactions?.bind(walletAdapter),
        signMessage: walletAdapter.signMessage?.bind(walletAdapter),
      }

      dispatch({ type: 'CONNECT_SUCCESS', payload: connectedWallet })

      // Get balance
      const balance = await state.connection.getBalance(publicKey)
      dispatch({ type: 'SET_BALANCE', payload: balance / 1e9 }) // Convert lamports to SOL

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao conectar wallet'
      dispatch({ type: 'CONNECT_FAILURE', payload: message })
      throw error
    }
  }, [state.wallets, state.connection])

  const disconnect = useCallback(async () => {
    try {
      dispatch({ type: 'DISCONNECT_START' })

      if (state.wallet?.adapter.name === 'Phantom') {
        const phantom = (window as any).phantom?.solana
        if (phantom) {
          await phantom.disconnect()
        }
      } else if (state.wallet?.adapter.name === 'Solflare') {
        const solflare = (window as any).solflare
        if (solflare) {
          await solflare.disconnect()
        }
      }

      dispatch({ type: 'DISCONNECT_SUCCESS' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao desconectar wallet'
      dispatch({ type: 'DISCONNECT_FAILURE', payload: message })
      throw error
    }
  }, [state.wallet])

  const signTransaction = useCallback(async (transaction: Transaction | VersionedTransaction) => {
    if (!state.wallet?.signTransaction) {
      throw new Error('Wallet não suporta assinatura de transação')
    }

    try {
      return await state.wallet.signTransaction(transaction)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao assinar transação'
      throw new Error(message)
    }
  }, [state.wallet])

  const signAllTransactions = useCallback(async (transactions: (Transaction | VersionedTransaction)[]) => {
    if (!state.wallet?.signAllTransactions) {
      throw new Error('Wallet não suporta assinatura de múltiplas transações')
    }

    try {
      return await state.wallet.signAllTransactions(transactions)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao assinar transações'
      throw new Error(message)
    }
  }, [state.wallet])

  const signMessage = useCallback(async (message: string) => {
    if (!state.wallet?.signMessage) {
      throw new Error('Wallet não suporta assinatura de mensagem')
    }

    try {
      const encodedMessage = new TextEncoder().encode(message)
      return await state.wallet.signMessage(encodedMessage)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao assinar mensagem'
      throw new Error(message)
    }
  }, [state.wallet])

  const sendTransaction = useCallback(async (transaction: Transaction | VersionedTransaction) => {
    if (!state.wallet?.publicKey) {
      throw new Error('Wallet não conectada')
    }

    try {
      // Sign transaction
      const signedTransaction = await signTransaction(transaction)
      
      // Send transaction
      const signature = await state.connection.sendRawTransaction(
        signedTransaction.serialize()
      )

      // Confirm transaction
      await state.connection.confirmTransaction(signature, 'confirmed')

      return signature
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao enviar transação'
      throw new Error(message)
    }
  }, [state.wallet, state.connection, signTransaction])

  const getBalance = useCallback(async () => {
    if (!state.wallet?.publicKey) {
      return null
    }

    try {
      const balance = await state.connection.getBalance(state.wallet.publicKey)
      const solBalance = balance / 1e9 // Convert lamports to SOL
      dispatch({ type: 'SET_BALANCE', payload: solBalance })
      return solBalance
    } catch (error) {
      console.error('Erro ao obter saldo:', error)
      return null
    }
  }, [state.wallet?.publicKey, state.connection])

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' })
  }, [])

  // Known tokens (similar to teste.html)
  const knownTokens = {
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'USDC',
    'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 'USDT',
    'So11111111111111111111111111111111111111112': 'SOL',
    'HRX9BoeaTM9keXiqSAm6HuTzuHRUqTfwixXXBXW4pump': 'HRX',
    'GwkEDwePTa6aFosh9xzAniGK1zvLrQ5yPJfLnqwmuyhG': '$HYPERSKIDS',
    'wqfjEgJrrWWZdFEDHLDKvZGfohdCyKFj4VcKWwYFnCm': 'hiKEJey9zJ9SUtW3yQu',
    '2szngsw1SWyNwpcc17xgn6TYmpJ4gVJBrG5e4eupeV9z': 'Pandana',
    '7FYCw13TdZnaKD6zAU3TDuaQ8XFmStZs4rgTCE8tpump': '7FYC',
  }

  // Program IDs
  const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
  const TOKEN_2022_PROGRAM_ID = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb')
  const METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')
  const RAYDIUM_CLMM_PROGRAM_ID = new PublicKey('CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK')

  // Get token price from Jupiter API
  const getTokenPrice = useCallback(async (mint: string): Promise<number> => {
    try {
      const response = await fetch(`https://lite-api.jup.ag/price/v3?ids=${mint}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return data[mint]?.usdPrice || 0
    } catch (error) {
      console.error('Erro ao obter preço:', error)
      return 0
    }
  }, [])

  // Get token symbol from metadata
  const getTokenSymbol = useCallback(async (mint: PublicKey): Promise<string> => {
    try {
      const [metadataPDA] = PublicKey.findProgramAddressSync(
        [new TextEncoder().encode('metadata'), METADATA_PROGRAM_ID.toBytes(), mint.toBytes()],
        METADATA_PROGRAM_ID
      )
      const metadataAccount = await state.connection.getAccountInfo(metadataPDA)
      if (metadataAccount) {
        const data = metadataAccount.data
        let offset = 1 + 32 + 32 // key + update_authority + mint
        const nameLen = new Uint32Array(data.slice(offset, offset + 4))[0]
        offset += 4
        const name = new TextDecoder().decode(data.slice(offset, offset + nameLen)).trim()
        offset += nameLen
        const symbolLen = new Uint32Array(data.slice(offset, offset + 4))[0]
        offset += 4
        const symbol = new TextDecoder().decode(data.slice(offset, offset + symbolLen)).trim()
        return symbol || name || 'Unknown'
      }
      return 'Unknown'
    } catch (error) {
      console.error('Erro ao obter símbolo:', error)
      return 'Unknown'
    }
  }, [state.connection])

  // Get wallet tokens
  const getTokens = useCallback(async () => {
    if (!state.wallet?.publicKey) return

    try {
      dispatch({ type: 'SET_LOADING_TOKENS', payload: true })

      // Get token accounts (standard and Token-2022)
      const tokenAccountsStandard = await state.connection.getParsedTokenAccountsByOwner(
        state.wallet.publicKey,
        { programId: TOKEN_PROGRAM_ID }
      )
      const tokenAccounts2022 = await state.connection.getParsedTokenAccountsByOwner(
        state.wallet.publicKey,
        { programId: TOKEN_2022_PROGRAM_ID }
      )
      
      const allTokenAccounts = [...tokenAccountsStandard.value, ...tokenAccounts2022.value]
      const tokens: TokenInfo[] = []

      for (const acc of allTokenAccounts) {
        const info = acc.account.data.parsed.info
        const balance = info.tokenAmount.uiAmount
        
        if (balance > 0) {
          const mint = info.mint
          let symbol = knownTokens[mint as keyof typeof knownTokens] || 
                      await getTokenSymbol(new PublicKey(mint))
          
          const price = await getTokenPrice(mint)
          const usdValue = price * balance

          tokens.push({
            mint,
            symbol,
            balance,
            usdValue,
            decimals: info.tokenAmount.decimals,
          })
        }
      }

      dispatch({ type: 'SET_TOKENS', payload: tokens })
    } catch (error) {
      console.error('Erro ao buscar tokens:', error)
    } finally {
      dispatch({ type: 'SET_LOADING_TOKENS', payload: false })
    }
  }, [state.wallet?.publicKey, state.connection, getTokenPrice, getTokenSymbol, knownTokens])

  // Get DeFi positions
  const getDeFiPositions = useCallback(async () => {
    if (!state.wallet?.publicKey) return

    try {
      dispatch({ type: 'SET_LOADING_DEFI', payload: true })

      // Get token accounts for potential positions
      const tokenAccountsStandard = await state.connection.getParsedTokenAccountsByOwner(
        state.wallet.publicKey,
        { programId: TOKEN_PROGRAM_ID }
      )
      const tokenAccounts2022 = await state.connection.getParsedTokenAccountsByOwner(
        state.wallet.publicKey,
        { programId: TOKEN_2022_PROGRAM_ID }
      )
      
      const allTokenAccounts = [...tokenAccountsStandard.value, ...tokenAccounts2022.value]
      const defiPositions: DeFiPosition[] = []

      // Check for Raydium CLMM positions (NFT tokens with amount 1)
      const potentialPositionTokens = allTokenAccounts.filter(acc => {
        const info = acc.account.data.parsed.info
        return info.tokenAmount.amount === '1' && info.tokenAmount.decimals === 0
      })

      for (const acc of potentialPositionTokens) {
        const mint = new PublicKey(acc.account.data.parsed.info.mint)
        const [positionPubkey] = PublicKey.findProgramAddressSync(
          [new TextEncoder().encode('position'), mint.toBytes()],
          RAYDIUM_CLMM_PROGRAM_ID
        )
        
        const positionAccount = await state.connection.getAccountInfo(positionPubkey)
        if (positionAccount && positionAccount.owner.equals(RAYDIUM_CLMM_PROGRAM_ID)) {
          defiPositions.push({
            type: 'raydium-clmm',
            mint: mint.toString(),
            balance: 1,
            usdValue: 0, // Would need more complex calculation
            positionAddress: positionPubkey.toString(),
          })
        }
      }

      // Check for Raydium AMM LP tokens
      try {
        const raydiumPairsResponse = await fetch('https://api.raydium.io/v2/main/pairs')
        
        if (raydiumPairsResponse.ok) {
          const pairs = await raydiumPairsResponse.json()
          const potentialLpTokens = allTokenAccounts.filter(acc => {
            const info = acc.account.data.parsed.info
            return info.tokenAmount.uiAmount > 0 && info.tokenAmount.decimals > 0
          })
          
          for (const acc of potentialLpTokens) {
            const mint = acc.account.data.parsed.info.mint
            const matchingPair = pairs.find((p: any) => p.lpMint === mint)
            
            if (matchingPair) {
              const balance = acc.account.data.parsed.info.tokenAmount.uiAmount
              const price = await getTokenPrice(mint)
              const usdValue = price * balance
              
              defiPositions.push({
                type: 'raydium-amm',
                mint,
                balance,
                usdValue,
                poolName: matchingPair.name,
              })
            }
          }
        }
      } catch (error) {
        console.error('Error fetching Raydium pairs:', error)
      }
      
      dispatch({ type: 'SET_DEFI_POSITIONS', payload: defiPositions })
    } catch (error) {
      console.error('Erro ao buscar posições DeFi:', error)
    } finally {
      dispatch({ type: 'SET_LOADING_DEFI', payload: false })
    }
  }, [state.wallet?.publicKey, state.connection])

  // Refresh all wallet data
  const refreshWalletData = useCallback(async () => {
    if (!state.wallet?.publicKey) return

    await Promise.all([
      getBalance(),
      getTokens(),
      getDeFiPositions(),
    ])

    // Calculate total USD value
    const solBalance = state.balance || 0
    const solPrice = await getTokenPrice('So11111111111111111111111111111111111111112')
    const solUsdValue = solBalance * solPrice
    
    const tokensUsdValue = state.tokens.reduce((sum, token) => sum + token.usdValue, 0)
    const defiUsdValue = state.defiPositions.reduce((sum, position) => sum + position.usdValue, 0)
    
    const totalUsdValue = solUsdValue + tokensUsdValue + defiUsdValue
    dispatch({ type: 'SET_TOTAL_USD_VALUE', payload: totalUsdValue })
  }, [state.wallet?.publicKey, state.balance, state.tokens, state.defiPositions, getBalance, getTokens, getDeFiPositions, getTokenPrice])

  // Auto-refresh wallet data
  useEffect(() => {
    if (state.connected && state.wallet?.publicKey) {
      // Initial load
      refreshWalletData()

      // Set up interval for updates
      const interval = setInterval(() => {
        refreshWalletData()
      }, 30000) // Update every 30 seconds

      return () => clearInterval(interval)
    }
  }, [state.connected, state.wallet?.publicKey, refreshWalletData])

  const value: WalletContextType = {
    state,
    connect,
    disconnect,
    signTransaction,
    signAllTransactions,
    signMessage,
    sendTransaction,
    getBalance,
    getTokens,
    getDeFiPositions,
    refreshWalletData,
    clearError,
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

// Hook
export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

// Selectors
export const useWalletState = () => useWallet().state
export const useWalletConnected = () => useWallet().state.connected
export const useWalletBalance = () => useWallet().state.balance
export const useWalletPublicKey = () => useWallet().state.wallet?.publicKey
export const useWalletError = () => useWallet().state.error
export const useWalletConnecting = () => useWallet().state.connecting
export const useWalletTokens = () => useWallet().state.tokens
export const useWalletDeFiPositions = () => useWallet().state.defiPositions
export const useWalletTotalUsdValue = () => useWallet().state.totalUsdValue
export const useWalletLoadingTokens = () => useWallet().state.loadingTokens
export const useWalletLoadingDefi = () => useWallet().state.loadingDefi