'use client'

import { Dashboard } from '../components/Dashboard'
import { LandingPage } from '../components/LandingPage'

export default function Home() {
  // Temporariamente sempre mostrar a landing page
  const connected = false

  return (
    <main className="min-h-screen">
      {connected ? <Dashboard /> : <LandingPage />}
    </main>
  )
}