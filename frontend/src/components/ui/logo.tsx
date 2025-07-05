import Image from 'next/image'
import { TrendingUp } from 'lucide-react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

export function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const sizeConfig = {
    sm: { icon: 'h-6 w-6', text: 'text-lg' },
    md: { icon: 'h-8 w-8', text: 'text-xl' },
    lg: { icon: 'h-12 w-12', text: 'text-3xl' }
  }

  return (
    <div className={`flex items-center ${className}`}>
      {/* Usando ícone do Lucide por enquanto, mas pode ser substituído por imagem */}
      <TrendingUp className={`${sizeConfig[size].icon} text-blue-600`} />
      {showText && (
        <span className={`ml-2 ${sizeConfig[size].text} font-bold text-gray-900`}>
          PollsIA
        </span>
      )}
    </div>
  )
}

// Componente para logo com imagem (quando tivermos uma imagem)
export function LogoImage({ 
  size = 'md', 
  showText = true, 
  className = '',
  priority = false 
}: LogoProps & { priority?: boolean }) {
  const sizeConfig = {
    sm: { width: 24, height: 24, text: 'text-lg' },
    md: { width: 32, height: 32, text: 'text-xl' },
    lg: { width: 48, height: 48, text: 'text-3xl' }
  }

  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/images/logos/pollsia-logo.svg"
        alt="PollsIA Logo"
        width={sizeConfig[size].width}
        height={sizeConfig[size].height}
        priority={priority}
        className="object-contain"
      />
      {showText && (
        <span className={`ml-2 ${sizeConfig[size].text} font-bold text-gray-900`}>
          PollsIA
        </span>
      )}
    </div>
  )
}