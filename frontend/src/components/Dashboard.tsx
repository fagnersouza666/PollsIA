'use client'

import { useQuery } from '@tanstack/react-query'
import { TrendingUp, Wallet, Activity, Target } from 'lucide-react'
import { PortfolioOverview } from './PortfolioOverview'
import { PoolExplorer } from './PoolExplorer'
import { PerformanceChart } from './PerformanceChart'
import { api } from '../utils/api'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

export function Dashboard() {
  const { publicKey, connected } = useWallet()
  
  // Only fetch data if wallet is connected
  const walletAddress = connected && publicKey ? publicKey.toBase58() : null

  const { data: portfolio, isLoading: portfolioLoading } = useQuery({
    queryKey: ['portfolio', walletAddress],
    queryFn: () => api.getPortfolio(walletAddress!),
    enabled: !!walletAddress,
  })

  const { data: performance, isLoading: performanceLoading } = useQuery({
    queryKey: ['performance', walletAddress],
    queryFn: () => api.getPerformance(walletAddress!),
    enabled: !!walletAddress,
  })

  if (!connected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Wallet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Connect Your Wallet</h2>
          <p className="text-gray-600 mb-6">Please connect your Solana wallet to view your portfolio and start optimizing your liquidity positions.</p>
          <WalletMultiButton />
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
            value={`$${(portfolio as any)?.totalValue?.toLocaleString() || '0'}`}
            icon={<Wallet className="h-5 w-5" />}
            loading={portfolioLoading}
          />
          <StatsCard
            title="Total Return"
            value={`${(performance as any)?.totalReturn?.toFixed(1) || '0'}%`}
            icon={<TrendingUp className="h-5 w-5" />}
            loading={performanceLoading}
          />
          <StatsCard
            title="Active Positions"
            value={(portfolio as any)?.positions?.length?.toString() || '0'}
            icon={<Activity className="h-5 w-5" />}
            loading={portfolioLoading}
          />
          <StatsCard
            title="Sharpe Ratio"
            value={(performance as any)?.sharpeRatio?.toFixed(2) || '0'}
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