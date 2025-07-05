'use client'

import { Wallet } from 'lucide-react'
import Link from 'next/link'
import { Logo } from '@/components/ui/logo'

export function PublicHeader() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href="/">
            <Logo size="md" />
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            <Link 
              href="/about" 
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Sobre
            </Link>
            <Link 
              href="/features" 
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Recursos
            </Link>
            <Link 
              href="/contact" 
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Contato
            </Link>
          </nav>

          <Link
            href="/dashboard"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors inline-flex items-center"
          >
            <Wallet className="h-4 w-4 mr-2" />
            Conectar Carteira
          </Link>
        </div>
      </div>
    </header>
  )
}