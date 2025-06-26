'use client'

import { useQuery } from '@tanstack/react-query'
import { Search, TrendingUp, X, DollarSign, ArrowRight, AlertCircle, Shield, ShieldAlert, ShieldX, Info } from 'lucide-react'
import { useState } from 'react'

async function fetchPools() {
  const response = await fetch('http://localhost:3001/api/pools/discover')
  const data = await response.json()
  return data.data || []
}

async function fetchRankings() {
  const response = await fetch('http://localhost:3001/api/pools/rankings')
  const data = await response.json()
  return data.data || []
}

export function PoolExplorer() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBy, setFilterBy] = useState('all')
  const [showInvestModal, setShowInvestModal] = useState(false)
  const [selectedPool, setSelectedPool] = useState<any>(null)

  const { data: pools, isLoading } = useQuery({
    queryKey: ['pools'],
    queryFn: fetchPools,
  })

  const { data: rankings } = useQuery({
    queryKey: ['pool-rankings'],
    queryFn: fetchRankings,
  })

  const filteredPools = (pools || []).filter((pool: any) => {
    const matchesSearch = pool.tokenA?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pool.tokenB?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pool.protocol?.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (filterBy === 'high-apy') return matchesSearch && pool.apy > 15
    if (filterBy === 'high-tvl') return matchesSearch && pool.tvl > 1000000
    return matchesSearch
  })

  const handleInvest = (pool: any) => {
    setSelectedPool(pool)
    setShowInvestModal(true)
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Explorador de Pools</h3>
        <div className="flex space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar pools..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
          >
            <option value="all">Todos os Pools</option>
            <option value="high-apy">Alto APY</option>
            <option value="high-tvl">Alto TVL</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPools?.map((pool: any, index: number) => {
            const ranking = (rankings || [])?.find((r: any) => r.poolId === pool.id)
            return (
              <PoolCard
                key={pool.id}
                pool={pool}
                ranking={ranking}
                rank={index + 1}
                onInvest={handleInvest}
              />
            )
          })}
        </div>
      )}

      {/* Modal de Investimento */}
      {showInvestModal && selectedPool && (
        <InvestmentModal
          pool={selectedPool}
          onClose={() => setShowInvestModal(false)}
        />
      )}
    </div>
  )
}

function PoolCard({ pool, ranking, rank, onInvest }: {
  pool: any
  ranking?: any
  rank: number
  onInvest?: (_pool: any) => void
}) {
  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-sm font-bold text-primary-600">#{rank}</span>
          </div>
          <div>
            <h4 className="font-semibold text-lg">
              {pool.tokenA} / {pool.tokenB}
            </h4>
            <p className="text-sm text-gray-500">{pool.protocol}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center text-green-600 mb-1">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span className="font-semibold">{pool.apy}% APY</span>
          </div>
          {ranking && (
            <div className="text-xs text-gray-500">
              Pontuação: {ranking.score.toFixed(1)}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm mb-4">
        <div>
          <p className="text-gray-500">TVL</p>
          <p className="font-medium">${(pool.tvl / 1000000).toFixed(1)}M</p>
        </div>
        <div>
          <p className="text-gray-500">Volume 24h</p>
          <p className="font-medium">${pool.volume24h ? (pool.volume24h / 1000).toFixed(0) : '0'}K</p>
        </div>
        <div>
          <div className="flex items-center gap-1 mb-1">
            <p className="text-gray-500 text-xs">Nível de Risco</p>
            <div className="group relative">
              <Info className="h-3 w-3 text-gray-400 cursor-help" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-2 px-3 whitespace-nowrap z-10">
                <div className="text-center">
                  <div>0-5: Baixo Risco (Mais Seguro)</div>
                  <div>6-7: Risco Médio</div>
                  <div>8-10: Alto Risco</div>
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
              </div>
            </div>
          </div>
          <p className="font-medium">
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${
              ranking?.riskScore <= 5 ? 'bg-green-100 text-green-800' :
              ranking?.riskScore <= 7 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {ranking?.riskScore <= 5 ? (
                <Shield className="h-3 w-3" />
              ) : ranking?.riskScore <= 7 ? (
                <ShieldAlert className="h-3 w-3" />
              ) : (
                <ShieldX className="h-3 w-3" />
              )}
              {ranking?.riskScore?.toFixed(1) || 'N/A'}
              <span className="ml-1 text-xs font-normal">
                {ranking?.riskScore <= 5 ? 'Baixo' :
                 ranking?.riskScore <= 7 ? 'Médio' : 'Alto'}
              </span>
            </span>
          </p>
        </div>
      </div>

      {/* Faixa de valores recomendados */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm font-medium text-blue-800 mb-1">Faixa de Investimento Recomendada</p>
        <div className="flex items-center justify-between text-sm text-blue-600">
          <span>Mínimo: {pool.minInvestment || '0.1'} SOL</span>
          <span>Máximo: {pool.maxInvestment || '10'} SOL</span>
        </div>
        <div className="text-xs text-blue-500 mt-1">
          Otimal: {pool.optimalInvestment || '2-5'} SOL
        </div>
      </div>

      {/* Botão de investir */}
      <button
        onClick={() => onInvest?.(pool)}
        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        Investir na Pool
      </button>
    </div>
  )
}

// Componente do Modal de Investimento
function InvestmentModal({ pool, onClose }: { pool: any; onClose: () => void }) {
  const [solAmount, setSolAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Preços simulados para conversão (em produção, buscar de API)
  const solPrice = 180 // USD
  const tokenAPrice = 1.05 // USD (exemplo para USDC)
  const tokenBPrice = 0.5 // USD (exemplo para outro token)

  const calculateTokenAmounts = () => {
    const solValue = parseFloat(solAmount) || 0
    const usdValue = solValue * solPrice
    
    // Assumindo split 50/50 na pool
    const halfValue = usdValue / 2
    const tokenAAmount = halfValue / tokenAPrice
    const tokenBAmount = halfValue / tokenBPrice
    
    return { tokenAAmount, tokenBAmount, usdValue }
  }

  const { tokenAAmount, tokenBAmount, usdValue } = calculateTokenAmounts()

  const handleInvest = async () => {
    if (!solAmount || parseFloat(solAmount) <= 0) {
      setError('Por favor, insira um valor válido')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Aqui seria implementada a lógica de criação da pool
      // usando o Solana Agent Kit ou similar
      // Log para debug (será removido em produção)
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log('Investindo na pool:', {
          pool: pool.id,
          solAmount,
          tokenAAmount,
          tokenBAmount
        })
      }

      // Simular chamada para API
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      alert(`Investimento realizado com sucesso!\n${solAmount} SOL convertidos para ${tokenAAmount.toFixed(4)} ${pool.tokenA} + ${tokenBAmount.toFixed(4)} ${pool.tokenB}`)
      onClose()
    } catch (_err) {
      setError('Erro ao processar investimento. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const isValidAmount = solAmount && parseFloat(solAmount) > 0
  const minAmount = parseFloat(pool.minInvestment || '0.1')
  const maxAmount = parseFloat(pool.maxInvestment || '10')
  const isInRange = isValidAmount && parseFloat(solAmount) >= minAmount && parseFloat(solAmount) <= maxAmount

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Investir na Pool</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Informações da Pool */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium">{pool.tokenA} / {pool.tokenB}</h4>
          <p className="text-sm text-gray-600">{pool.protocol}</p>
          <div className="flex justify-between text-sm mt-2">
            <span>APY: {pool.apy}%</span>
            <span>TVL: ${(pool.tvl / 1000000).toFixed(1)}M</span>
          </div>
        </div>

        {/* Input do valor */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Valor em SOL
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="number"
              value={solAmount}
              onChange={(e) => setSolAmount(e.target.value)}
              placeholder="0.0"
              step="0.1"
              min="0"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Faixa recomendada: {minAmount} - {maxAmount} SOL
          </div>
        </div>

        {/* Preview da conversão */}
        {isValidAmount && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <h5 className="text-sm font-medium text-blue-800 mb-2">Preview da Conversão</h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>{solAmount} SOL</span>
                <span>≈ ${usdValue.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-center">
                <ArrowRight className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex justify-between">
                <span>{tokenAAmount.toFixed(4)} {pool.tokenA}</span>
                <span>≈ ${(tokenAAmount * tokenAPrice).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>{tokenBAmount.toFixed(4)} {pool.tokenB}</span>
                <span>≈ ${(tokenBAmount * tokenBPrice).toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Alertas */}
        {!isInRange && isValidAmount && (
          <div className="mb-4 p-3 bg-yellow-50 rounded-lg flex items-start">
            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              Valor fora da faixa recomendada. Para melhor performance, mantenha entre {minAmount} e {maxAmount} SOL.
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 rounded-lg flex items-start">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-sm text-red-800">{error}</div>
          </div>
        )}

        {/* Botões */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleInvest}
            disabled={!isValidAmount || isLoading}
            className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white rounded-lg transition-colors"
          >
            {isLoading ? 'Processando...' : 'Investir'}
          </button>
        </div>
      </div>
    </div>
  )
}