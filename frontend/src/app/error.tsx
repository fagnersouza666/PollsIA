'use client'

import { useEffect } from 'react'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <AlertTriangle className="h-20 w-20 text-yellow-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Ops!</h1>
        <h2 className="text-xl text-gray-700 mb-4">Algo deu errado</h2>
        <p className="text-gray-600 mb-8">
          Ocorreu um erro inesperado na aplicação. Nossa equipe foi notificada.
        </p>
        <div className="space-y-4">
          <button
            onClick={reset}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors inline-flex items-center justify-center"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Tentar novamente
          </button>
          <Link
            href="/"
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors inline-flex items-center justify-center"
          >
            <Home className="h-5 w-5 mr-2" />
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  )
}