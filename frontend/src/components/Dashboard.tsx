'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useQuery } from '@tanstack/react-query'
import { TrendingUp, Wallet, Activity, Target } from 'lucide-react'
import { PortfolioOverview } from './PortfolioOverview'
import { PoolExplorer } from './PoolExplorer'
import { PerformanceChart } from './PerformanceChart'
import { api } from '../utils/api'

export function Dashboard() {
  const { publicKey } = useWallet()

  const { data: portfolio, isLoading: portfolioLoading } = useQuery({
    queryKey: ['portfolio', publicKey?.toString()],
    queryFn: () => api.getPortfolio(publicKey!.toString()),
    enabled: !!publicKey,
  })

  const { data: performance, isLoading: performanceLoading } = useQuery({
    queryKey: ['performance', publicKey?.toString()],
    queryFn: () => api.getPerformance(publicKey!.toString()),
    enabled: !!publicKey,
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold">Solana Pool Optimizer</span>
            </div>
            <WalletMultiButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Portfolio Value"
            value={`$${portfolio?.totalValue?.toLocaleString() || '0'}`}
            icon={<Wallet className="h-5 w-5" />}
            loading={portfolioLoading}
          />
          <StatsCard
            title="Total Return"
            value={`${performance?.totalReturn?.toFixed(1) || '0'}%`}
            icon={<TrendingUp className="h-5 w-5" />}
            loading={performanceLoading}
          />
          <StatsCard
            title="Active Positions"
            value={portfolio?.positions?.length?.toString() || '0'}
            icon={<Activity className="h-5 w-5" />}
            loading={portfolioLoading}
          />
          <StatsCard
            title="Sharpe Ratio"
            value={performance?.sharpeRatio?.toFixed(2) || '0'}
            icon={<Target className="h-5 w-5" />}
            loading={performanceLoading}
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            <PerformanceChart />
            <PoolExplorer />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <PortfolioOverview />
          </div>
        </div>
      </main>
    </div>
  )
}

function StatsCard({ title, value, icon, loading }: {
  title: string
  value: string
  icon: React.ReactNode
  loading?: boolean
}) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {loading ? '...' : value}
          </p>
        </div>
        <div className="text-primary-600">
          {icon}
        </div>
      </div>
    </div>
  )
}