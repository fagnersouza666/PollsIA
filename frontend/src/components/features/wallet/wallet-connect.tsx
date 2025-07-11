'use client'

import { useState, useEffect } from 'react'
import { 
  useWallet, 
  useWalletConnected, 
  useWalletConnecting, 
  useWalletError,
  useWalletState 
} from '@/contexts/wallet-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Wallet, ExternalLink, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import Image from 'next/image'

export function WalletConnect() {
  const { state, connect, disconnect, clearError } = useWallet()
  const connected = useWalletConnected()
  const connecting = useWalletConnecting()
  const error = useWalletError()
  
  const [dialogOpen, setDialogOpen] = useState(false)

  // Debug: verificar provedores disponíveis
  useEffect(() => {
    console.log('🔍 Provedores de wallet detectados:', {
      phantom: (window as any).phantom?.solana?.isPhantom,
      solflare: (window as any).solflare?.isSolflare,
      ethereum: (window as any).ethereum,
      metamask: (window as any).ethereum?.isMetaMask,
      hasConflict: (window as any).ethereum?.isMetaMask && (window as any).phantom?.solana?.isPhantom
    })
  }, [])

  const handleConnect = async (walletName: string) => {
    try {
      await connect(walletName)
      setDialogOpen(false)
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    }
  }

  const handleDisconnect = async () => {
    try {
      await disconnect()
    } catch (error) {
      console.error('Failed to disconnect wallet:', error)
    }
  }

  const getWalletIcon = (walletName: string) => {
    switch (walletName) {
      case 'Phantom':
        return '/icons/phantom.svg'
      case 'Solflare':
        return '/icons/solflare.svg'
      default:
        return '/icons/wallet.svg'
    }
  }

  if (connected) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Carteira Conectada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8">
                <Image
                  src={getWalletIcon(state.wallet?.adapter.name || '')}
                  alt={state.wallet?.adapter.name || 'Wallet'}
                  fill
                  className="rounded-full"
                />
              </div>
              <div>
                <p className="font-medium">{state.wallet?.adapter.name}</p>
                <p className="text-sm text-muted-foreground">
                  {state.wallet?.publicKey.toString().slice(0, 8)}...
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDisconnect}
            >
              Desconectar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-md">
      {error && (
        <Alert className="mb-4" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button
              variant="link"
              size="sm"
              onClick={clearError}
              className="ml-2 p-0 h-auto"
            >
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button
            className="w-full"
            size="lg"
            disabled={connecting}
          >
            {connecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Conectando...
              </>
            ) : (
              <>
                <Wallet className="mr-2 h-4 w-4" />
                Conectar Carteira
              </>
            )}
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Conectar Carteira</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3">
            {state.wallets.map((wallet) => (
              <Card
                key={wallet.name}
                className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                  wallet.readyState !== 'Installed' ? 'opacity-50' : ''
                }`}
                onClick={() => wallet.readyState === 'Installed' && handleConnect(wallet.name)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10">
                        <Image
                          src={getWalletIcon(wallet.name)}
                          alt={wallet.name}
                          fill
                          className="rounded-full"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{wallet.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {wallet.readyState === 'Installed' 
                            ? 'Detectada' 
                            : 'Não instalada'
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={wallet.readyState === 'Installed' ? 'default' : 'secondary'}
                      >
                        {wallet.readyState === 'Installed' ? 'Pronta' : 'Instalar'}
                      </Badge>
                      {wallet.readyState !== 'Installed' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            window.open(wallet.url, '_blank')
                          }}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Selecione uma carteira para conectar
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}