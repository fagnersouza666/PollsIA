import Link from 'next/link'
import { ArrowRight, Shield, TrendingUp, Users, Zap } from 'lucide-react'
import { Suspense } from 'react'
import { StatsOverview } from '@/components/server/stats-overview'
import { PopularPools } from '@/components/server/popular-pools'
import { Logo } from '@/components/ui/logo'

// Server Component principal da landing page
export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <Logo size="lg" />
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Gestão Inteligente de
              <span className="text-blue-600 block">Pools de Liquidez</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Otimize seus investimentos DeFi na blockchain Solana com algoritmos de IA 
              que maximizam rendimentos e minimizam riscos automaticamente.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg transition-colors inline-flex items-center justify-center"
              >
                Começar Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              
              <Link
                href="/about"
                className="bg-white hover:bg-gray-50 text-gray-900 font-semibold py-4 px-8 rounded-lg border border-gray-300 transition-colors"
              >
                Saiba Mais
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Server Component */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Estatísticas da Plataforma
            </h2>
            <p className="text-gray-600">
              Dados em tempo real da nossa plataforma
            </p>
          </div>
          
          <Suspense fallback={<StatsLoading />}>
            <StatsOverview />
          </Suspense>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Por que escolher PollsIA?
            </h2>
            <p className="text-gray-600">
              Recursos avançados para maximizar seus rendimentos DeFi
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Shield className="h-8 w-8 text-blue-600" />}
              title="Segurança"
              description="Smart contracts auditados e práticas de segurança rigorosas"
            />
            
            <FeatureCard
              icon={<Zap className="h-8 w-8 text-blue-600" />}
              title="Alta Performance"
              description="Aproveite a velocidade e baixo custo da blockchain Solana"
            />
            
            <FeatureCard
              icon={<TrendingUp className="h-8 w-8 text-blue-600" />}
              title="IA Otimizada"
              description="Algoritmos inteligentes que maximizam seus retornos"
            />
            
            <FeatureCard
              icon={<Users className="h-8 w-8 text-blue-600" />}
              title="Comunidade"
              description="Junte-se a milhares de investidores DeFi"
            />
          </div>
        </div>
      </section>

      {/* Popular Pools Section - Server Component */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Pools em Destaque
              </h2>
              <p className="text-gray-600 mb-6">
                Descubra as oportunidades mais rentáveis do momento
              </p>
              <Link
                href="/pools"
                className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center"
              >
                Ver todos os pools
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            <div className="lg:col-span-2">
              <Suspense fallback={<PoolsLoading />}>
                <PopularPools />
              </Suspense>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Pronto para começar?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Conecte sua carteira e comece a otimizar seus investimentos DeFi hoje mesmo
          </p>
          <Link
            href="/dashboard"
            className="bg-white hover:bg-gray-100 text-blue-600 font-semibold py-4 px-8 rounded-lg transition-colors inline-flex items-center"
          >
            Conectar Carteira
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}

// Componente de feature card
function FeatureCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode
  title: string
  description: string 
}) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

// Loading components
function StatsLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg p-6 shadow-sm border animate-pulse">
          <div className="h-8 w-8 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-8 bg-gray-200 rounded mb-1"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  )
}

function PoolsLoading() {
  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-16 bg-gray-200 rounded"></div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
              <div className="text-right">
                <div className="h-4 bg-gray-200 rounded w-12 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-8"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}