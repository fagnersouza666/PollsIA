'use client'

import { Component, ReactNode } from 'react'
import { AlertTriangle, ExternalLink, RefreshCw, Wallet } from 'lucide-react'

interface Props {
  children: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
}

export class WalletErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Wallet component error:', error, errorInfo)
    
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
        <div className="bg-white border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-6 w-6 text-yellow-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              Erro na Carteira
            </h3>
          </div>
          
          <p className="text-gray-600 mb-4">
            Ocorreu um erro com sua carteira. Verifique se o Phantom está instalado e desbloqueado.
          </p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-yellow-800 mb-2">Possíveis soluções:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Verifique se o Phantom Wallet está instalado</li>
              <li>• Desbloqueie sua carteira</li>
              <li>• Recarregue a página</li>
              <li>• Desconecte e reconecte a carteira</li>
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={this.handleRetry}
              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </button>
            
            <a
              href="https://phantom.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Wallet className="h-4 w-4 mr-2" />
              Instalar Phantom
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}