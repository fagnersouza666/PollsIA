import Image from 'next/image'
import { User } from 'lucide-react'

interface AvatarProps {
  src?: string
  alt?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  fallback?: string
  className?: string
}

export function Avatar({ 
  src, 
  alt = 'Avatar', 
  size = 'md', 
  fallback,
  className = '' 
}: AvatarProps) {
  const sizeConfig = {
    sm: { width: 32, height: 32, icon: 'h-4 w-4' },
    md: { width: 40, height: 40, icon: 'h-5 w-5' },
    lg: { width: 48, height: 48, icon: 'h-6 w-6' },
    xl: { width: 64, height: 64, icon: 'h-8 w-8' }
  }

  const { width, height, icon } = sizeConfig[size]

  if (src) {
    return (
      <div className={`relative inline-block ${className}`}>
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="rounded-full object-cover"
          onError={(e) => {
            // Fallback para erro de carregamento
            e.currentTarget.style.display = 'none'
          }}
        />
      </div>
    )
  }

  return (
    <div 
      className={`
        inline-flex items-center justify-center rounded-full 
        bg-gray-100 text-gray-600 ${className}
      `}
      style={{ width, height }}
    >
      {fallback ? (
        <span className="text-sm font-medium">
          {fallback.charAt(0).toUpperCase()}
        </span>
      ) : (
        <User className={icon} />
      )}
    </div>
  )
}