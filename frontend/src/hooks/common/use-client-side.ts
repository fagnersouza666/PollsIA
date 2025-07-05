import { useEffect, useState } from 'react'

/**
 * Hook para garantir que o código rode apenas no cliente
 * Útil para evitar problemas de hidratação com localStorage, window, etc.
 */
export function useClientSide() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return isClient
}

/**
 * Hook para executar código apenas no cliente
 */
export function useClientSideEffect(effect: () => void | (() => void), deps?: React.DependencyList) {
  const isClient = useClientSide()

  useEffect(() => {
    if (isClient) {
      return effect()
    }
  }, [isClient, ...(deps || [])])
}

/**
 * Hook para valores que devem ser diferentes no servidor vs cliente
 */
export function useClientSideValue<T>(serverValue: T, clientValue: T): T {
  const isClient = useClientSide()
  return isClient ? clientValue : serverValue
}