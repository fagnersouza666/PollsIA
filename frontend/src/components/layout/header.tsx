'use client'

import { LogOut, User } from 'lucide-react'
import Link from 'next/link'
import { useWallet } from '@/hooks/use-wallet'
import { Logo } from '@/components/ui/logo'

export function Header() {
  const { wallet, disconnect } = useWallet()

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href="/dashboard">
            <Logo size="md" />
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            <Link 
              href="/dashboard" 
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Dashboard
            </Link>
            <Link 
              href="/pools" 
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Pools
            </Link>
            <Link 
              href="/profile" 
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Perfil
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {wallet?.address && (
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {wallet.address.slice(0, 4)}...{wallet.address.slice(-4)}
                </span>
              </div>
            )}
            <button
              onClick={disconnect}
              className="text-gray-500 hover:text-red-600 transition-colors"
              title="Desconectar carteira"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}