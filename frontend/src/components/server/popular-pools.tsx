import { PoolImage } from '@/components/ui/pool-image'
import { TrendingDown, TrendingUp } from 'lucide-react'

// Server Component para pools populares
export async function PopularPools() {
  const pools = await fetchPopularPools()
  
  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold text-gray-900">Pools Populares</h2>
        <p className="text-gray-600 text-sm mt-1">
          Pools com maior volume nas últimas 24h
        </p>
      </div>
      
      <div className="p-6">
        <div className="space-y-4">
          {pools.map((pool) => (
            <PoolRow key={pool.id} pool={pool} />
          ))}
        </div>
      </div>
    </div>
  )
}

// Componente de linha de pool (server component)
function PoolRow({ pool }: { pool: Pool }) {
  const isPositive = pool.apy >= 0
  
  return (
    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="flex items-center space-x-3">
        <PoolImage
          token1Symbol={pool.token1}
          token2Symbol={pool.token2}
          size="sm"
        />
        <div>
          <h3 className="font-medium text-gray-900">
            {pool.token1}/{pool.token2}
          </h3>
          <p className="text-sm text-gray-500">
            TVL: ${(pool.tvl / 1000000).toFixed(2)}M
          </p>
        </div>
      </div>
      
      <div className="text-right">
        <div className="flex items-center space-x-1">
          {isPositive ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
          <span className={`font-medium ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {pool.apy.toFixed(2)}%
          </span>
        </div>
        <p className="text-sm text-gray-500">
          APY
        </p>
      </div>
    </div>
  )
}

// Interface do pool
interface Pool {
  id: string
  token1: string
  token2: string
  tvl: number
  apy: number
  volume24h: number
}

// Função que busca pools populares (seria substituída por API real)
async function fetchPopularPools(): Promise<Pool[]> {
  // Simular delay de rede
  await new Promise(resolve => setTimeout(resolve, 150))
  
  return [
    {
      id: '1',
      token1: 'SOL',
      token2: 'USDC',
      tvl: 15600000,
      apy: 12.45,
      volume24h: 2300000
    },
    {
      id: '2',
      token1: 'RAY',
      token2: 'SOL',
      tvl: 8900000,
      apy: 18.67,
      volume24h: 1800000
    },
    {
      id: '3',
      token1: 'USDC',
      token2: 'USDT',
      tvl: 12400000,
      apy: 5.23,
      volume24h: 3200000
    },
    {
      id: '4',
      token1: 'ORCA',
      token2: 'SOL',
      tvl: 4500000,
      apy: 15.89,
      volume24h: 980000
    },
    {
      id: '5',
      token1: 'SRM',
      token2: 'USDC',
      tvl: 3200000,
      apy: -2.14,
      volume24h: 650000
    }
  ]
}