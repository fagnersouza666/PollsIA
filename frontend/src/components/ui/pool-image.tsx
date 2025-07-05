import Image from 'next/image'
import { Coins } from 'lucide-react'

interface PoolImageProps {
  token1Symbol?: string
  token2Symbol?: string
  token1Image?: string
  token2Image?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function PoolImage({ 
  token1Symbol = 'SOL',
  token2Symbol = 'USDC',
  token1Image,
  token2Image,
  size = 'md',
  className = ''
}: PoolImageProps) {
  const sizeConfig = {
    sm: { container: 'h-8 w-16', token: 20, overlap: '-ml-2' },
    md: { container: 'h-10 w-20', token: 24, overlap: '-ml-3' },
    lg: { container: 'h-12 w-24', token: 32, overlap: '-ml-4' }
  }

  const { container, token, overlap } = sizeConfig[size]

  return (
    <div className={`relative flex items-center ${container} ${className}`}>
      {/* Token 1 */}
      <div className="relative z-10">
        {token1Image ? (
          <Image
            src={token1Image}
            alt={`${token1Symbol} token`}
            width={token}
            height={token}
            className="rounded-full border-2 border-white"
          />
        ) : (
          <div 
            className="rounded-full border-2 border-white bg-blue-100 flex items-center justify-center"
            style={{ width: token, height: token }}
          >
            <span className="text-xs font-bold text-blue-700">
              {token1Symbol.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* Token 2 */}
      <div className={`relative ${overlap}`}>
        {token2Image ? (
          <Image
            src={token2Image}
            alt={`${token2Symbol} token`}
            width={token}
            height={token}
            className="rounded-full border-2 border-white"
          />
        ) : (
          <div 
            className="rounded-full border-2 border-white bg-green-100 flex items-center justify-center"
            style={{ width: token, height: token }}
          >
            <span className="text-xs font-bold text-green-700">
              {token2Symbol.charAt(0)}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// Componente para ícone de pool genérico
export function PoolIcon({ size = 'md', className = '' }: { 
  size?: 'sm' | 'md' | 'lg'
  className?: string 
}) {
  const sizeConfig = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  }

  return (
    <div className={`flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 rounded-full ${sizeConfig[size]} ${className}`}>
      <Coins className="h-1/2 w-1/2 text-white" />
    </div>
  )
}