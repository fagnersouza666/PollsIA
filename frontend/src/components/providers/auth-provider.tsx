'use client'

import { ReactNode, createContext, useContext, useEffect, useState } from 'react'
import { useWallet } from '@/hooks/use-wallet'

interface AuthState {
  isAuthenticated: boolean
  user: {
    walletAddress: string
    connectedAt: Date
  } | null
  loading: boolean
}

interface AuthContextType {
  auth: AuthState
  login: (walletAddress: string) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
  })

  // Check auth state on mount
  useEffect(() => {
    const checkAuth = () => {
      const stored = localStorage.getItem('pollsia_auth')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          setAuth({
            isAuthenticated: true,
            user: {
              walletAddress: parsed.walletAddress,
              connectedAt: new Date(parsed.connectedAt),
            },
            loading: false,
          })
        } catch (error) {
          localStorage.removeItem('pollsia_auth')
          setAuth(prev => ({ ...prev, loading: false }))
        }
      } else {
        setAuth(prev => ({ ...prev, loading: false }))
      }
    }

    checkAuth()
  }, [])

  const login = (walletAddress: string) => {
    const user = {
      walletAddress,
      connectedAt: new Date(),
    }
    
    setAuth({
      isAuthenticated: true,
      user,
      loading: false,
    })
    
    localStorage.setItem('pollsia_auth', JSON.stringify(user))
  }

  const logout = () => {
    setAuth({
      isAuthenticated: false,
      user: null,
      loading: false,
    })
    
    localStorage.removeItem('pollsia_auth')
  }

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}