import { Activity, DollarSign, TrendingUp, Users } from 'lucide-react'

// Server Component para estatísticas gerais da plataforma
export async function StatsOverview() {
  // Simular fetch de dados do servidor (pode ser substituído por API real)
  const stats = await fetchPlatformStats()
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Value Locked"
        value={`$${(stats.tvl / 1000000).toFixed(2)}M`}
        icon={DollarSign}
        change={`+${stats.tvlChange24h.toFixed(2)}%`}
        changeType="positive"
      />
      <StatCard
        title="Pools Ativos"
        value={stats.activePools.toString()}
        icon={Activity}
        change={`${stats.newPools24h} novos hoje`}
        changeType="neutral"
      />
      <StatCard
        title="Usuários Ativos"
        value={stats.activeUsers.toString()}
        icon={Users}
        change={`+${stats.userGrowth24h.toFixed(1)}%`}
        changeType="positive"
      />
      <StatCard
        title="Volume 24h"
        value={`$${(stats.volume24h / 1000000).toFixed(1)}M`}
        icon={TrendingUp}
        change={`${stats.volumeChange24h >= 0 ? '+' : ''}${stats.volumeChange24h.toFixed(2)}%`}
        changeType={stats.volumeChange24h >= 0 ? "positive" : "negative"}
      />
    </div>
  )
}

// Componente de card de estatística (pode ser server component)
function StatCard({
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
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Icon className="h-6 w-6 text-blue-600" />
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

// Função que simula fetch de dados (seria substituída por API real)
async function fetchPlatformStats() {
  // Simular delay de rede
  await new Promise(resolve => setTimeout(resolve, 100))
  
  return {
    tvl: 45600000, // $45.6M
    tvlChange24h: 2.34,
    activePools: 1247,
    newPools24h: 23,
    activeUsers: 5634,
    userGrowth24h: 4.2,
    volume24h: 8900000, // $8.9M
    volumeChange24h: -1.45
  }
}