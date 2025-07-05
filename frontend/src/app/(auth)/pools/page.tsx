import { PoolExplorer } from '@/components/PoolExplorer'

export const metadata = {
  title: 'Pools - PollsIA',
  description: 'Explorar e gerenciar pools de liquidez',
}

export default function PoolsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pools de Liquidez</h1>
        <p className="text-gray-600 mt-2">
          Explore e gerencie pools de liquidez na blockchain Solana
        </p>
      </div>
      
      <PoolExplorer />
    </div>
  )
}