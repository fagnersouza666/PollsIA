import { Shield, TrendingUp, Users, Zap } from 'lucide-react'

export const metadata = {
  title: 'Sobre - PollsIA',
  description: 'Conheça a PollsIA e nossa missão de revolucionar a gestão de pools de liquidez',
}

export default function AboutPage() {
  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Sobre a PollsIA
          </h1>
          <p className="text-xl text-gray-600">
            Revolucionando a gestão de pools de liquidez na blockchain Solana
          </p>
        </div>
        
        <div className="prose prose-lg max-w-none mb-12">
          <p>
            A PollsIA é uma plataforma inovadora que combina inteligência artificial 
            com tecnologia blockchain para otimizar a gestão de pools de liquidez na 
            rede Solana. Nossa missão é democratizar o acesso a estratégias 
            sofisticadas de DeFi para investidores de todos os níveis.
          </p>
          
          <p>
            Utilizamos algoritmos avançados de aprendizado de máquina para analisar 
            dados de mercado em tempo real, identificar oportunidades de arbitragem 
            e otimizar automaticamente as posições dos usuários em pools de liquidez.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <Shield className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Segurança</h3>
            <p className="text-gray-600">
              Nossos smart contracts são auditados e seguem as melhores práticas 
              de segurança da indústria DeFi.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <Zap className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Performance</h3>
            <p className="text-gray-600">
              Aproveite a velocidade e baixo custo da blockchain Solana para 
              operações eficientes.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <TrendingUp className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Otimização</h3>
            <p className="text-gray-600">
              Algoritmos de IA analisam continuamente o mercado para maximizar 
              seus retornos.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <Users className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Comunidade</h3>
            <p className="text-gray-600">
              Junte-se a uma comunidade ativa de investidores e desenvolvedores 
              DeFi.
            </p>
          </div>
        </div>
        
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Pronto para começar?
          </h2>
          <p className="text-gray-600 mb-6">
            Conecte sua carteira e descubra o potencial dos pools de liquidez 
            otimizados por IA.
          </p>
          <a
            href="/dashboard"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Começar Agora
          </a>
        </div>
      </div>
    </div>
  )
}