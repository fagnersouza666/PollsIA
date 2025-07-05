import { ReactNode } from 'react'
import { PublicHeader } from '@/components/layout/public-header'
import { Footer } from '@/components/layout/footer'

export default function PublicLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      <main>
        {children}
      </main>
      <Footer />
    </div>
  )
}