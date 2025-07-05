'use client'

import { ReactNode, createContext, useCallback, useContext, useReducer } from 'react'
import { z } from 'zod'

// Types
interface User {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }

interface AuthContextType {
  state: AuthState
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  clearError: () => void
  updateUser: (updates: Partial<User>) => void
}

// Initial state
const initialState: AuthState = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
}

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      }
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      }
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: action.payload,
      }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        error: null,
      }
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      }
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      }
    default:
      return state
  }
}

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Provider
interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  const login = useCallback(async (email: string, password: string) => {
    try {
      dispatch({ type: 'AUTH_START' })

      // Validate input
      const loginSchema = z.object({
        email: z.string().email('Email inválido'),
        password: z.string().min(1, 'Senha é obrigatória'),
      })

      const { email: validEmail, password: validPassword } = loginSchema.parse({
        email,
        password,
      })

      // Make API call
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: validEmail, password: validPassword }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Falha no login')
      }

      const data = await response.json()
      
      // Store token in localStorage
      localStorage.setItem('auth-token', data.token)
      
      // Update state
      dispatch({ type: 'AUTH_SUCCESS', payload: data.user })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro no login'
      dispatch({ type: 'AUTH_FAILURE', payload: message })
      throw error
    }
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      dispatch({ type: 'AUTH_START' })

      // Validate input
      const registerSchema = z.object({
        name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
        email: z.string().email('Email inválido'),
        password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
      })

      const { name: validName, email: validEmail, password: validPassword } = registerSchema.parse({
        name,
        email,
        password,
      })

      // Make API call
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: validName, 
          email: validEmail, 
          password: validPassword 
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Falha no registro')
      }

      const data = await response.json()
      
      // Store token in localStorage
      localStorage.setItem('auth-token', data.token)
      
      // Update state
      dispatch({ type: 'AUTH_SUCCESS', payload: data.user })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro no registro'
      dispatch({ type: 'AUTH_FAILURE', payload: message })
      throw error
    }
  }, [])

  const logout = useCallback(() => {
    // Remove token from localStorage
    localStorage.removeItem('auth-token')
    
    // Update state
    dispatch({ type: 'LOGOUT' })
  }, [])

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' })
  }, [])

  const updateUser = useCallback((updates: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: updates })
  }, [])

  const value: AuthContextType = {
    state,
    login,
    register,
    logout,
    clearError,
    updateUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Selectors
export const useAuthState = () => useAuth().state
export const useIsAuthenticated = () => useAuth().state.isAuthenticated
export const useAuthUser = () => useAuth().state.user
export const useAuthError = () => useAuth().state.error
export const useAuthLoading = () => useAuth().state.isLoading