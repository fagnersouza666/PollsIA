'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Wallet, Activity, Target } from 'lucide-react'
import { PoolExplorer } from './PoolExplorer'
import { api } from '../utils/api'

export function Dashboard() {
  const [walletAddress, setWalletAddress] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [portfolio, setPortfolio] = useState<any>(null)
  const [positions, setPositions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const handleConnectWallet = async () => {
    try {
      setLoading(true)
      
      console.log('🔍 Verificando Phantom...')
      console.log('window exists:', typeof window !== 'undefined')
      console.log('window.solana exists:', !!(typeof window !== 'undefined' && window.solana))
      console.log('window.solana.isPhantom:', typeof window !== 'undefined' && window.solana?.isPhantom)
      
      if (typeof window === 'undefined') {
        alert('Ambiente não suportado')
        return
      }
      
      if (!window.solana) {
        console.log('❌ window.solana é undefined')
        alert('Phantom wallet não detectado.\n\n1. Instale o Phantom: https://phantom.app\n2. Recarregue a página\n3. Tente novamente')
        return
      }
      
      if (!window.solana.isPhantom) {
        console.log('❌ window.solana.isPhantom é false')
        alert('Extensão Phantom não detectada.\n\nVerifique se a extensão está ativada no navegador.')
        return
      }
      
      console.log('✅ Phantom detectado, tentando conectar...')
      
      const response = await window.solana.connect()
      console.log('✅ Conectado com sucesso!', response)
      
      const publicKey = response.publicKey.toString()
      console.log('📍 Endereço:', publicKey)
      
      setWalletAddress(publicKey)
      setIsConnected(true)
      
      // Carregar dados reais da carteira
      console.log('🔄 Carregando dados da carteira...')
      await loadWalletData(publicKey)
      
    } catch (error: any) {
      console.error('❌ Erro ao conectar carteira:', error)
      
      if (error.code === 4001) {
        alert('Conexão cancelada pelo usuário.')
      } else if (error.message?.includes('User rejected')) {
        alert('Conexão rejeitada pelo usuário.')
      } else {
        alert(`Erro ao conectar carteira: ${error.message || 'Erro desconhecido'}\n\nVerifique se:\n1. Phantom está instalado\n2. A extensão está desbloqueada\n3. Tente recarregar a página`)
      }
    } finally {
      setLoading(false)
    }
  }

  const loadWalletData = async (publicKey: string) => {
    try {
      // Carregar dados do portfólio
      const portfolioData = await api.getPortfolio(publicKey)
      setPortfolio(portfolioData)
      
      // Carregar posições
      const positionsData = await api.getPositions(publicKey)
      setPositions(positionsData)
    } catch (error) {
      console.error('Erro ao carregar dados da carteira:', error)
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <Wallet className="h-16 w-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">PollsIA</h2>
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Otimizador de Pools Solana</h3>
          <p className="text-gray-600 mb-6">
            Gestão automatizada de pools de liquidez com dados em tempo real do Raydium e blockchain Solana.
          </p>
          <button 
            onClick={handleConnectWallet}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors inline-flex items-center"
          >
            <Wallet className="h-5 w-5 mr-2" />
            Conectar Carteira
          </button>
          <p className="text-sm text-gray-500 mt-4">
            * Dados em tempo real dos pools de liquidez da Solana
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold">PollsIA</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Carteira: {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
              </span>
              <button 
                onClick={() => {
                  if (window.solana && window.solana.isPhantom) {
                    window.solana.disconnect()
                  }
                  setIsConnected(false)
                  setWalletAddress('')
                }}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Desconectar
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Valor Total do Portfólio"
            value={loading ? "Carregando..." : portfolio ? `$${(portfolio.totalValue || 0).toFixed(2)}` : "$0.00"}
            icon={Wallet}
            change={portfolio ? `${(portfolio.change24h || 0) >= 0 ? '+' : ''}${(portfolio.change24h || 0).toFixed(2)}%` : "+0%"}
            changeType={(portfolio?.change24h || 0) >= 0 ? "positive" : "negative"}
          />
          <StatsCard
            title="Posições Ativas"
            value={loading ? "..." : positions.length.toString()}
            icon={Activity}
            change={`+${positions.length}`}
            changeType="neutral"
          />
          <StatsCard
            title="Saldo SOL"
            value={loading ? "Carregando..." : portfolio ? `${(portfolio.solBalance || 0).toFixed(4)} SOL` : "0 SOL"}
            icon={TrendingUp}
            change=""
            changeType="positive"
          />
          <StatsCard
            title="Contas de Token"
            value={loading ? "..." : portfolio ? portfolio.tokenAccounts?.toString() || "0" : "0"}
            icon={Target}
            change=""
            changeType="positive"
          />
        </div>

        {/* Pool Explorer */}
        <div className="mb-8">
          <PoolExplorer />
        </div>

        {/* Additional Info */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">About PollsIA</h3>
          <p className="text-gray-600">
            PollsIA is an automated liquidity pool management system for Solana. 
            It analyzes real-time data from Raydium and other DEXs to find the best 
            opportunities for liquidity provision and yield optimization.
          </p>
        </div>
      </main>
    </div>
  )
}

// Stats Card Component
function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  change, 
  changeType 
}: { 
  title: string
  value: string
  icon: any
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
}) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Icon className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {change && (
          <p className={`text-sm mt-1 ${
            changeType === 'positive' ? 'text-green-600' :
            changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {change}
          </p>
        )}
      </div>
    </div>
  )
}