'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { api } from '../utils/api'

export function PortfolioOverview() {
  const { publicKey } = useWallet()

  const { data: portfolio, isLoading } = useQuery({
    queryKey: ['portfolio', publicKey?.toString()],
    queryFn: () => api.getPortfolio(publicKey!.toString()),
    enabled: !!publicKey,
  })

  if (isLoading) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Portfolio Overview</h3>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Portfolio Overview</h3>
      
      {/* Token Balances */}
      <div className="space-y-3 mb-6">
        <h4 className="text-sm font-medium text-gray-600">Token Balances</h4>
        {portfolio?.tokens?.map((token, index) => (
          <div key={index} className="flex justify-between items-center py-2">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-primary-600">
                  {token.symbol.slice(0, 2)}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{token.symbol}</p>
                <p className="text-xs text-gray-500">{token.balance}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">${token.value.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Active Positions */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-600">Active Positions</h4>
        {portfolio?.positions?.map((position, index) => (
          <div key={index} className="border rounded-lg p-3">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm font-medium">
                  {position.tokenA} / {position.tokenB}
                </p>
                <p className="text-xs text-gray-500">{position.poolId}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">${position.value.toLocaleString()}</p>
                <div className="flex items-center text-xs">
                  {position.impermanentLoss > 0 ? (
                    <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                  ) : (
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  )}
                  <span className={position.impermanentLoss > 0 ? 'text-red-600' : 'text-green-600'}>
                    {Math.abs(position.impermanentLoss).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>APY: {position.apy}%</span>
              <span>IL: {position.impermanentLoss.toFixed(1)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}