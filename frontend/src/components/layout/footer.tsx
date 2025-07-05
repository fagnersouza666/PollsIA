import { Github, MessageCircle, Twitter } from 'lucide-react'
import Link from 'next/link'
import { Logo } from '@/components/ui/logo'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="mb-4">
              <Logo size="md" className="text-white" />
            </div>
            <p className="text-gray-400 text-sm">
              Gestão automatizada de pools de liquidez na blockchain Solana
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Produto</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/features" className="text-gray-400 hover:text-white">Recursos</Link></li>
              <li><Link href="/pricing" className="text-gray-400 hover:text-white">Preços</Link></li>
              <li><Link href="/docs" className="text-gray-400 hover:text-white">Documentação</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Empresa</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-gray-400 hover:text-white">Sobre</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white">Contato</Link></li>
              <li><Link href="/privacy" className="text-gray-400 hover:text-white">Privacidade</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Comunidade</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center text-gray-400">
          <p>&copy; 2024 PollsIA. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}