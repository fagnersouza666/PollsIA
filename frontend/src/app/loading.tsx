import { Loader2, TrendingUp } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="flex items-center justify-center mb-6">
          <TrendingUp className="h-12 w-12 text-blue-600 mr-2" />
          <span className="text-3xl font-bold text-gray-900">PollsIA</span>
        </div>
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Carregando aplicação...</p>
      </div>
    </div>
  )
}