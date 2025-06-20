'use client'

import { useQuery } from '@tanstack/react-query'
import { Search, Filter, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import { api } from '../utils/api'

export function PoolExplorer() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBy, setFilterBy] = useState('all')

  const { data: pools, isLoading } = useQuery({
    queryKey: ['pools'],
    queryFn: api.discoverPools,
  })

  const { data: rankings } = useQuery({
    queryKey: ['pool-rankings'],
    queryFn: api.getPoolRankings,
  })

  const filteredPools = pools?.filter(pool => {
    const matchesSearch = pool.tokenA.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pool.tokenB.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pool.protocol.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (filterBy === 'high-apy') return matchesSearch && pool.apy > 15
    if (filterBy === 'high-tvl') return matchesSearch && pool.tvl > 1000000
    return matchesSearch
  })

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Pool Explorer</h3>
        <div className="flex space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search pools..."
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
            <option value="all">All Pools</option>
            <option value="high-apy">High APY</option>
            <option value="high-tvl">High TVL</option>
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
          {filteredPools?.map((pool, index) => {
            const ranking = rankings?.find(r => r.poolId === pool.id)
            return (
              <PoolCard
                key={pool.id}
                pool={pool}
                ranking={ranking}
                rank={index + 1}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

function PoolCard({ pool, ranking, rank }: {
  pool: any
  ranking?: any
  rank: number
}) {
  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
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
              Score: {ranking.score.toFixed(1)}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-gray-500">TVL</p>
          <p className="font-medium">${(pool.tvl / 1000000).toFixed(1)}M</p>
        </div>
        <div>
          <p className="text-gray-500">24h Volume</p>
          <p className="font-medium">${(pool.volume24h / 1000).toFixed(0)}K</p>
        </div>
        <div>
          <p className="text-gray-500">Risk Score</p>
          <p className="font-medium">
            <span className={`px-2 py-1 rounded text-xs ${
              ranking?.riskScore <= 5 ? 'bg-green-100 text-green-800' :
              ranking?.riskScore <= 7 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {ranking?.riskScore?.toFixed(1) || 'N/A'}
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}