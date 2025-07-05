'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md mx-auto text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-destructive">
            Algo deu errado!
          </h1>
          <p className="text-muted-foreground">
            Ocorreu um erro inesperado. Tente novamente ou entre em contato com o suporte.
          </p>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="bg-muted p-4 rounded-md text-left">
            <p className="text-sm font-mono text-muted-foreground">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex gap-4 justify-center">
          <Button onClick={reset} variant="default">
            Tentar novamente
          </Button>
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
          >
            Voltar ao início
          </Button>
        </div>
      </div>
    </div>
  )
}