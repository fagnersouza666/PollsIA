'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Dashboard } from '../components/Dashboard'
import { LandingPage } from '../components/LandingPage'

export default function Home() {
  const { connected } = useWallet()

  return (
    <main className="min-h-screen">
      {connected ? <Dashboard /> : <LandingPage />}
    </main>
  )
}