'use client'

import { TrendingUp, Shield, Zap, BarChart3 } from 'lucide-react'

export function LandingPage() {
  return (
    <div className="bg-gradient-to-br from-primary-50 to-white">
      {/* Header */}
      <header className="px-4 lg:px-6 h-14 flex items-center border-b">
        <div className="flex items-center justify-center">
          <TrendingUp className="h-6 w-6 text-primary-600" />
          <span className="ml-2 text-lg font-bold">Solana Pool Optimizer</span>
        </div>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <button className="btn-primary">Conectar Carteira</button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center space-y-4 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
              Maximize Your
              <span className="text-primary-600"> DeFi Yields</span>
              <br />
              on Solana
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
              Automated pool optimization with AI-powered strategies.
              Let our algorithms find the best yield farming opportunities
              while you sleep.
            </p>
            <div className="space-x-4">
              <button className="btn-primary">Conectar Carteira</button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
        <div className="container px-4 md:px-6 mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose Our Platform?
          </h2>
          <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
            <FeatureCard
              icon={<Zap className="h-6 w-6" />}
              title="Automated Optimization"
              description="Our AI continuously monitors and rebalances your positions to maximize returns."
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6" />}
              title="Risk Management"
              description="Advanced risk assessment and automatic stop-loss protection for your investments."
            />
            <FeatureCard
              icon={<BarChart3 className="h-6 w-6" />}
              title="Real-time Analytics"
              description="Comprehensive dashboard with performance tracking and market insights."
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
        <div className="container px-4 md:px-6 mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Trusted by DeFi Investors
          </h2>
          <div className="grid gap-6 lg:grid-cols-3 text-center">
            <div>
              <div className="text-4xl font-bold text-primary-600">$2.4B+</div>
              <div className="text-gray-600">Total Value Locked</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600">15.7%</div>
              <div className="text-gray-600">Average APY</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600">10K+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({ icon, title, description }: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="card text-center">
      <div className="flex justify-center mb-4 text-primary-600">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}