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

interface WalletState {
  wallet: ConnectedWallet | null
  wallets: WalletAdapter[]
  connecting: boolean
  connected: boolean
  disconnecting: boolean
  error: string | null
  balance: number | null
  connection: Connection
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
  connection: new Connection(SOLANA_RPC_URL, 'confirmed'),
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

  // Auto-refresh balance
  useEffect(() => {
    if (state.connected && state.wallet?.publicKey) {
      const interval = setInterval(() => {
        getBalance()
      }, 30000) // Update every 30 seconds

      return () => clearInterval(interval)
    }
  }, [state.connected, state.wallet?.publicKey, getBalance])

  const value: WalletContextType = {
    state,
    connect,
    disconnect,
    signTransaction,
    signAllTransactions,
    signMessage,
    sendTransaction,
    getBalance,
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