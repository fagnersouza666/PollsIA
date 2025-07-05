import { Activity, Settings, User, Wallet } from 'lucide-react'

export const metadata = {
  title: 'Perfil - PollsIA',
  description: 'Gerenciar perfil e configurações',
}

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Perfil</h1>
        <p className="text-gray-600 mt-2">
          Gerencie suas configurações e informações da conta
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Informações da Conta</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Carteira Conectada
                  </label>
                  <p className="text-sm text-gray-500">
                    Sua carteira Phantom conectada
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Wallet className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Endereço da Carteira
                  </label>
                  <p className="text-sm text-gray-500 font-mono">
                    Será exibido quando conectado
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Configurações</h2>
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center">
                  <Settings className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-sm font-medium">Preferências</span>
                </div>
              </button>
              
              <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center">
                  <Activity className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-sm font-medium">Histórico</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}