'use client'

import { ReactNode, createContext, useCallback, useContext, useEffect, useReducer } from 'react'
import { STORAGE_KEYS } from '@/lib/constants'

// Types
type Theme = 'light' | 'dark' | 'system'

interface ThemeState {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  systemTheme: 'light' | 'dark'
  isLoading: boolean
}

type ThemeAction =
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'SET_RESOLVED_THEME'; payload: 'light' | 'dark' }
  | { type: 'SET_SYSTEM_THEME'; payload: 'light' | 'dark' }
  | { type: 'SET_LOADING'; payload: boolean }

interface ThemeContextType {
  state: ThemeState
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

// Initial state
const initialState: ThemeState = {
  theme: 'system',
  resolvedTheme: 'light',
  systemTheme: 'light',
  isLoading: true,
}

// Reducer
function themeReducer(state: ThemeState, action: ThemeAction): ThemeState {
  switch (action.type) {
    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload,
      }
    case 'SET_RESOLVED_THEME':
      return {
        ...state,
        resolvedTheme: action.payload,
      }
    case 'SET_SYSTEM_THEME':
      return {
        ...state,
        systemTheme: action.payload,
      }
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      }
    default:
      return state
  }
}

// Context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Provider
interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

export function ThemeProvider({ 
  children, 
  defaultTheme = 'system',
  storageKey = STORAGE_KEYS.theme 
}: ThemeProviderProps) {
  const [state, dispatch] = useReducer(themeReducer, {
    ...initialState,
    theme: defaultTheme,
  })

  // Get system theme
  const getSystemTheme = useCallback((): 'light' | 'dark' => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  }, [])

  // Calculate resolved theme
  const getResolvedTheme = useCallback((theme: Theme, systemTheme: 'light' | 'dark'): 'light' | 'dark' => {
    if (theme === 'system') {
      return systemTheme
    }
    return theme
  }, [])

  // Apply theme to DOM
  const applyTheme = useCallback((resolvedTheme: 'light' | 'dark') => {
    const root = document.documentElement
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark')
    
    // Add new theme class
    root.classList.add(resolvedTheme)
    
    // Update CSS custom properties
    if (resolvedTheme === 'dark') {
      root.style.setProperty('--background', '222.2% 84% 4.9%')
      root.style.setProperty('--foreground', '210% 40% 98%')
      root.style.setProperty('--card', '222.2% 84% 4.9%')
      root.style.setProperty('--card-foreground', '210% 40% 98%')
      root.style.setProperty('--popover', '222.2% 84% 4.9%')
      root.style.setProperty('--popover-foreground', '210% 40% 98%')
      root.style.setProperty('--primary', '210% 40% 98%')
      root.style.setProperty('--primary-foreground', '222.2% 84% 4.9%')
      root.style.setProperty('--secondary', '217.2% 32.6% 17.5%')
      root.style.setProperty('--secondary-foreground', '210% 40% 98%')
      root.style.setProperty('--muted', '217.2% 32.6% 17.5%')
      root.style.setProperty('--muted-foreground', '215% 20.2% 65.1%')
      root.style.setProperty('--accent', '217.2% 32.6% 17.5%')
      root.style.setProperty('--accent-foreground', '210% 40% 98%')
      root.style.setProperty('--destructive', '0 62.8% 30.6%')
      root.style.setProperty('--destructive-foreground', '210% 40% 98%')
      root.style.setProperty('--border', '217.2% 32.6% 17.5%')
      root.style.setProperty('--input', '217.2% 32.6% 17.5%')
      root.style.setProperty('--ring', '212.7% 26.8% 83.9%')
    } else {
      root.style.setProperty('--background', '0 0% 100%')
      root.style.setProperty('--foreground', '222.2% 84% 4.9%')
      root.style.setProperty('--card', '0 0% 100%')
      root.style.setProperty('--card-foreground', '222.2% 84% 4.9%')
      root.style.setProperty('--popover', '0 0% 100%')
      root.style.setProperty('--popover-foreground', '222.2% 84% 4.9%')
      root.style.setProperty('--primary', '222.2% 47.4% 11.2%')
      root.style.setProperty('--primary-foreground', '210% 40% 98%')
      root.style.setProperty('--secondary', '210% 40% 96%')
      root.style.setProperty('--secondary-foreground', '222.2% 47.4% 11.2%')
      root.style.setProperty('--muted', '210% 40% 96%')
      root.style.setProperty('--muted-foreground', '215.4% 16.3% 46.9%')
      root.style.setProperty('--accent', '210% 40% 96%')
      root.style.setProperty('--accent-foreground', '222.2% 47.4% 11.2%')
      root.style.setProperty('--destructive', '0 84.2% 60.2%')
      root.style.setProperty('--destructive-foreground', '210% 40% 98%')
      root.style.setProperty('--border', '214.3% 31.8% 91.4%')
      root.style.setProperty('--input', '214.3% 31.8% 91.4%')
      root.style.setProperty('--ring', '222.2% 84% 4.9%')
    }
  }, [])

  // Set theme
  const setTheme = useCallback((theme: Theme) => {
    dispatch({ type: 'SET_THEME', payload: theme })
    
    // Save to localStorage
    try {
      localStorage.setItem(storageKey, theme)
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error)
    }
  }, [storageKey])

  // Toggle theme
  const toggleTheme = useCallback(() => {
    if (state.theme === 'light') {
      setTheme('dark')
    } else if (state.theme === 'dark') {
      setTheme('light')
    } else {
      // If system, toggle to opposite of current resolved theme
      setTheme(state.resolvedTheme === 'light' ? 'dark' : 'light')
    }
  }, [state.theme, state.resolvedTheme, setTheme])

  // Initialize theme
  useEffect(() => {
    const initializeTheme = () => {
      // Get system theme
      const systemTheme = getSystemTheme()
      dispatch({ type: 'SET_SYSTEM_THEME', payload: systemTheme })

      // Get saved theme from localStorage
      let savedTheme: Theme = defaultTheme
      try {
        const stored = localStorage.getItem(storageKey)
        if (stored && ['light', 'dark', 'system'].includes(stored)) {
          savedTheme = stored as Theme
        }
      } catch (error) {
        console.warn('Failed to load theme from localStorage:', error)
      }

      // Set theme
      dispatch({ type: 'SET_THEME', payload: savedTheme })

      // Calculate resolved theme
      const resolvedTheme = getResolvedTheme(savedTheme, systemTheme)
      dispatch({ type: 'SET_RESOLVED_THEME', payload: resolvedTheme })

      // Apply theme
      applyTheme(resolvedTheme)

      // Set loading to false
      dispatch({ type: 'SET_LOADING', payload: false })
    }

    initializeTheme()
  }, [defaultTheme, storageKey, getSystemTheme, getResolvedTheme, applyTheme])

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e: MediaQueryListEvent) => {
      const newSystemTheme = e.matches ? 'dark' : 'light'
      dispatch({ type: 'SET_SYSTEM_THEME', payload: newSystemTheme })
      
      // If using system theme, update resolved theme
      if (state.theme === 'system') {
        dispatch({ type: 'SET_RESOLVED_THEME', payload: newSystemTheme })
        applyTheme(newSystemTheme)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [state.theme, applyTheme])

  // Update resolved theme when theme changes
  useEffect(() => {
    const resolvedTheme = getResolvedTheme(state.theme, state.systemTheme)
    dispatch({ type: 'SET_RESOLVED_THEME', payload: resolvedTheme })
    applyTheme(resolvedTheme)
  }, [state.theme, state.systemTheme, getResolvedTheme, applyTheme])

  const value: ThemeContextType = {
    state,
    setTheme,
    toggleTheme,
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

// Hook
export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// Selectors
export const useThemeState = () => useTheme().state
export const useCurrentTheme = () => useTheme().state.theme
export const useResolvedTheme = () => useTheme().state.resolvedTheme
export const useSystemTheme = () => useTheme().state.systemTheme
export const useThemeLoading = () => useTheme().state.isLoading