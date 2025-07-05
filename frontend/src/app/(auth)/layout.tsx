import { ReactNode } from 'react'
import { AuthProvider } from '@/components/providers/auth-provider'
import { WalletProvider } from '@/components/providers/wallet-provider'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export default function AuthLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <AuthProvider>
      <WalletProvider>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <Footer />
        </div>
      </WalletProvider>
    </AuthProvider>
  )
}