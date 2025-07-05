'use client'

import { Component, ReactNode } from 'react'
import { AlertCircle, Coins, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  poolName?: string
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
}

export class PoolErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Pool component error:', error, errorInfo)
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white border border-red-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              Erro no Pool {this.props.poolName || ''}
            </h3>
          </div>
          
          <p className="text-gray-600 mb-4">
            Ocorreu um erro ao carregar os dados do pool. Verifique sua conexão e tente novamente.
          </p>
          
          <div className="flex space-x-3">
            <button
              onClick={this.handleRetry}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Coins className="h-4 w-4 mr-2" />
              Recarregar Página
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}