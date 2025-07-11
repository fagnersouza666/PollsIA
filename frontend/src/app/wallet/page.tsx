import { WalletConnect } from '@/components/features/wallet/wallet-connect'
import { WalletInfo } from '@/components/features/wallet/wallet-info'

export default function WalletPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Carteira Solana</h1>
          <p className="text-muted-foreground">
            Conecte sua carteira e visualize seus tokens e posições DeFi
          </p>
        </div>

        <div className="flex flex-col items-center gap-8">
          <WalletConnect />
          <WalletInfo />
        </div>
      </div>
    </div>
  )
}