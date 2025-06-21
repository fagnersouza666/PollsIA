'use client'

import { PoolExplorer } from '../components/PoolExplorer'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">PollsIA</h1>
          <p className="text-gray-600">Solana Pool Optimizer - Real Data from Raydium</p>
        </header>
        
        {/* Show pool explorer with real data */}
        <PoolExplorer />
      </div>
    </main>
  )
}