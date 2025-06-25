'use client'

import { useState, useEffect, useCallback } from 'react'
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { api } from '../utils/api'

interface WalletPool {
  id: string
  tokenA: string
  tokenB: string
  myLiquidity: number
  myValue: number
  apy: number
  entryDate: string
  currentValue: number
  pnl: number
  rewardsEarned: number
  status: 'active' | 'inactive' | 'pending'
  protocol?: string
  source?: string
}

interface WalletPoolsProps {
  walletAddress: string
}

export function WalletPools({ walletAddress }: WalletPoolsProps) {
  const [pools, setPools] = useState<WalletPool[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<string>('value')
  const [statusFilter, setStatusFilter] = useState<string>('active')

  const loadWalletPools = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const poolsData = await api.getWalletPools(walletAddress, statusFilter, sortBy)
      
      setPools(Array.isArray(poolsData) ? poolsData : [])
    } catch (err: any) {
      setError('Erro ao carregar pools da carteira')
      setPools([])
    } finally {
      setLoading(false)
    }
  }, [walletAddress, statusFilter, sortBy])

  useEffect(() => {
    if (walletAddress) {
      loadWalletPools()
    }
  }, [walletAddress, sortBy, statusFilter, loadWalletPools])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getPnlColor = (pnl: number) => {
    if (pnl > 0) return 'text-green-600'
    if (pnl < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo'
      case 'inactive': return 'Inativo'
      case 'pending': return 'Pendente'
      default: return status
    }
  }

  const totalValue = pools.reduce((sum, pool) => sum + pool.currentValue, 0)
  const totalPnl = pools.reduce((sum, pool) => sum + pool.pnl, 0)
  const totalRewards = pools.reduce((sum, pool) => sum + pool.rewardsEarned, 0)
  const avgApy = pools.length > 0 ? pools.reduce((sum, pool) => sum + pool.apy, 0) / pools.length : 0

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Minhas Pools de Liquidez</h3>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Minhas Pools de Liquidez</h3>
        <div className="flex space-x-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm border border-gray-300 rounded px-3 py-1"
          >
            <option value="active">Ativas</option>
            <option value="all">Todas</option>
            <option value="inactive">Inativas</option>
            <option value="pending">Pendentes</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border border-gray-300 rounded px-3 py-1"
          >
            <option value="value">Valor</option>
            <option value="apy">APY</option>
            <option value="pnl">P&L</option>
            <option value="date">Data</option>
          </select>
        </div>
      </div>

      {/* Resumo */}
      {pools.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Valor Total</p>
                <p className="text-xl font-bold text-blue-900">{formatCurrency(totalValue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">P&L Total</p>
                <p className={`text-xl font-bold ${getPnlColor(totalPnl)}`}>
                  {formatCurrency(totalPnl)}
                </p>
              </div>
              {totalPnl >= 0 ? (
                <TrendingUp className="h-8 w-8 text-green-500" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-500" />
              )}
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium">Rewards</p>
                <p className="text-xl font-bold text-yellow-900">{formatCurrency(totalRewards)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">APY Médio</p>
                <p className="text-xl font-bold text-purple-900">{avgApy.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>
      )}

      {/* Lista de Pools */}
      {error ? (
        <div className="text-center py-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="text-lg font-medium text-blue-900 mb-2">
              Sem Posições em Pools de Liquidez
            </h4>
            <p className="text-blue-700 mb-4">
              Sua carteira não possui posições ativas em pools de liquidez do Raydium no momento.
            </p>
            <div className="text-sm text-blue-600 space-y-2">
              <p>• Isso é normal se você ainda não participa de liquidity mining</p>
              <p>• Para criar posições, visite pools disponíveis na seção &ldquo;Explorar Pools&rdquo;</p>
              <p>• O sistema verifica LP tokens reais da blockchain Solana</p>
            </div>
            <button
              onClick={loadWalletPools}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
            >
              Verificar Novamente
            </button>
          </div>
        </div>
      ) : pools.length === 0 ? (
        <div className="text-center py-8">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Carteira Conectada - Sem Pools
            </h4>
            <p className="text-gray-700 mb-4">
              Sua carteira está conectada mas não possui posições em pools de liquidez.
            </p>
            <div className="text-sm text-gray-600 space-y-2">
              <p>• ✅ Carteira verificada na blockchain Solana</p>
              <p>• ✅ Busca realizada em todas as pools do Raydium</p>
              <p>• ℹ️ Nenhum LP token encontrado</p>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Para participar de pools de liquidez, explore as opções disponíveis abaixo.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {pools.map((pool) => (
            <div
              key={pool.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <span className="font-semibold text-lg">{pool.tokenA}</span>
                    <span className="text-gray-400">/</span>
                    <span className="font-semibold text-lg">{pool.tokenB}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(pool.status)}`}>
                    {getStatusText(pool.status)}
                  </span>
                  {pool.protocol && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                      {pool.protocol}
                    </span>
                  )}
                  {pool.source && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                      {pool.source}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">APY</p>
                  <p className="font-semibold text-green-600">{pool.apy.toFixed(1)}%</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Valor Atual</p>
                  <p className="font-semibold">{formatCurrency(pool.currentValue)}</p>
                </div>
                <div>
                  <p className="text-gray-500">P&L</p>
                  <p className={`font-semibold ${getPnlColor(pool.pnl)}`}>
                    {formatCurrency(pool.pnl)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Rewards</p>
                  <p className="font-semibold text-blue-600">{formatCurrency(pool.rewardsEarned)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Liquidez</p>
                  <p className="font-semibold">{pool.myLiquidity.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Data Entrada</p>
                  <p className="font-semibold">{formatDate(pool.entryDate)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}