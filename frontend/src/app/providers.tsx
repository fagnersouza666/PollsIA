'use client'

import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { ErrorBoundary, useErrorReporting } from '../components/common/ErrorBoundary'
import { ServiceProvider } from '../services/service-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors
          if (error instanceof Error && error.message.includes('4')) {
            return false;
          }
          return failureCount < 3;
        },
      },
    },
  }))

  const { reportError } = useErrorReporting();

  return (
    <ErrorBoundary onError={reportError}>
      <ServiceProvider>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </ServiceProvider>
    </ErrorBoundary>
  )
}