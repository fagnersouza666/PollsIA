'use client'

import { ReactNode, createContext, useContext, useEffect, useState } from 'react'
import { phantomWallet } from '@/utils/phantom-wallet'
import { WalletErrorBoundary } from '@/components/common/wallet-error-boundary'

interface WalletState {
  address: string | null
  connected: boolean
  loading: boolean
}

interface WalletContextType {
  wallet: WalletState
  connect: () => Promise<void>
  disconnect: () => Promise<void>
}

export const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    connected: false,
    loading: false,
  })

  useEffect(() => {
    // Setup phantom wallet listeners
    phantomWallet.onConnect((publicKey: string) => {
      setWallet({
        address: publicKey,
        connected: true,
        loading: false,
      })
    })

    phantomWallet.onDisconnect(() => {
      setWallet({
        address: null,
        connected: false,
        loading: false,
      })
    })

    phantomWallet.onAccountChanged((publicKey: string | null) => {
      if (publicKey) {
        setWallet({
          address: publicKey,
          connected: true,
          loading: false,
        })
      } else {
        setWallet({
          address: null,
          connected: false,
          loading: false,
        })
      }
    })

    // Check if already connected
    const checkConnection = async () => {
      try {
        if (await phantomWallet.isPhantomInstalled()) {
          const connected = phantomWallet.isConnected()
          if (connected) {
            const address = phantomWallet.getPublicKey()
            setWallet({
              address,
              connected: true,
              loading: false,
            })
          }
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error)
      }
    }

    checkConnection()
  }, [])

  const connect = async () => {
    try {
      setWallet(prev => ({ ...prev, loading: true }))
      
      if (!(await phantomWallet.isPhantomInstalled())) {
        throw new Error('Phantom wallet not installed')
      }

      const publicKey = await phantomWallet.connect()
      setWallet({
        address: publicKey,
        connected: true,
        loading: false,
      })
    } catch (error) {
      setWallet(prev => ({ ...prev, loading: false }))
      throw error
    }
  }

  const disconnect = async () => {
    try {
      await phantomWallet.disconnect()
      setWallet({
        address: null,
        connected: false,
        loading: false,
      })
    } catch (error) {
      console.error('Error disconnecting wallet:', error)
    }
  }

  return (
    <WalletErrorBoundary>
      <WalletContext.Provider value={{ wallet, connect, disconnect }}>
        {children}
      </WalletContext.Provider>
    </WalletErrorBoundary>
  )
}