import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Carregando...</h2>
        <p className="text-gray-500">Aguarde enquanto carregamos suas informações</p>
      </div>
    </div>
  )
}